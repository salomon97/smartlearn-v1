const mongoose = require('mongoose');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const GRADE_MAP_REVERSE = {
    '6ème': ['6e', '6ème'],
    '5ème': ['5e', '5ème'],
    '4ème': ['4e', '4ème'],
    '3ème': ['3e', '3ème'],
    'Seconde': ['2nde', 'seconde', 'Seconde'],
    'Première': ['1ère', 'première', 'Première'],
    'Terminale': ['terminale', 'tle', 'Terminale']
};

const SUBJECT_MAP_REVERSE = {
    'Mathématiques': ['Mathématiques', 'maths', 'mathématiques'],
    'Informatique': ['Informatique', 'info', 'informatique']
};

async function syncYoutubeToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        // 1. Get Auth
        const credentials = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'credentials.json'), 'utf8'));
        const token = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'token.json'), 'utf8'));
        const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);
        const yt = google.youtube({ version: 'v3', auth: oAuth2Client });

        // 2. Fetch playlists
        console.log("Fetching YouTube Playlists...");
        const response = await yt.playlists.list({ part: ['snippet'], mine: true, maxResults: 50 });
        const playlists = response.data.items || [];

        for (const playlist of playlists) {
            const title = playlist.snippet?.title?.toLowerCase() || "";
            let detectedGrade = "";
            let detectedSubject = "";

            // Naming Mapper (Same as the route)
            const GRADE_MAP = {
                '6e': '6ème', '6ème': '6ème', '5e': '5ème', '5ème': '5ème', '4e': '4ème', '4ème': '4ème', '3e': '3ème', '3ème': '3ème',
                '2nde': 'Seconde', '1ère': 'Première', 'terminale': 'Terminale', 'tle': 'Terminale'
            };
            const SUBJECT_MAP = {
                'maths': 'Mathématiques', 'informatique': 'Informatique'
            };

            for (const [key, val] of Object.entries(GRADE_MAP)) {
                if (title.includes(key.toLowerCase())) detectedGrade = val;
            }
            for (const [key, val] of Object.entries(SUBJECT_MAP)) {
                if (title.includes(key.toLowerCase())) detectedSubject = val;
            }

            if (detectedGrade && detectedSubject) {
                console.log(`Matched Playlist: ${title} => Grade: ${detectedGrade}, Subject: ${detectedSubject}`);
                
                // Fetch videos for this playlist
                const pItems = await yt.playlistItems.list({
                    playlistId: playlist.id,
                    part: ['snippet', 'contentDetails'],
                    maxResults: 50
                });
                const videos = pItems.data.items || [];
                console.log(`  Found ${videos.length} videos.`);

                if (videos.length > 0) {
                    // Match Course in DB
                    const possibleGrades = GRADE_MAP_REVERSE[detectedGrade] || [detectedGrade];
                    const possibleSubjects = SUBJECT_MAP_REVERSE[detectedSubject] || [detectedSubject];
                    
                    const course = await db.collection('courses').findOne({
                        grade_level: { $in: possibleGrades },
                        subject: { $in: possibleSubjects }
                    });

                    if (course) {
                        console.log(`  -> Linking to Course: ${course.title} (ID: ${course._id})`);
                        // Empty existing lessons for this course to avoid duplicates if re-syncing
                        await db.collection('lessons').deleteMany({ courseId: course._id });

                        // Insert new lessons
                        const lessonsToInsert = videos.map((v, i) => ({
                            courseId: course._id,
                            title: v.snippet.title,
                            videoUrl: `https://www.youtube.com/watch?v=${v.contentDetails.videoId}`,
                            pdfUrl: '',
                            order: i + 1,
                            isFreePreview: i === 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }));

                        await db.collection('lessons').insertMany(lessonsToInsert);
                        console.log(`  -> Inserted ${lessonsToInsert.length} lessons into DB!`);
                    } else {
                        console.log(`  -> NO MATCHING COURSE FOUND IN DB.`);
                    }
                }
            }
        }
        console.log("Sync Complete!");
    } catch (e) {
        console.error("ERR:", e.message);
    } finally {
        await mongoose.disconnect();
    }
}
syncYoutubeToDB();
