const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Config
const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const PLAYLISTS_TO_CREATE = [
    { subject: 'Mathématiques', grade: '6e' },
    { subject: 'Mathématiques', grade: '5e' },
    { subject: 'Mathématiques', grade: '4e' },
    { subject: 'Mathématiques', grade: '3e' },
    { subject: 'Mathématiques', grade: '2ndeTI' },
    { subject: 'Mathématiques', grade: '2ndeA4' },
    { subject: 'Mathématiques', grade: '2ndeC' },
    { subject: 'Mathématiques', grade: '1ère_TI' },
    { subject: 'Mathématiques', grade: '1ère_C' },
    { subject: 'Mathématiques', grade: '1ère_D' },
    { subject: 'Mathématiques', grade: '1ère_A4' },
    { subject: 'Mathématiques', grade: 'TleTI' },
    { subject: 'Mathématiques', grade: 'TleC' },
    { subject: 'Mathématiques', grade: 'TleD' },
    { subject: 'Mathématiques', grade: 'TleA4' },
    { subject: 'Informatique', grade: '6e' },
    { subject: 'Informatique', grade: '5e' },
    { subject: 'Informatique', grade: '4e' },
    { subject: 'Informatique', grade: '3e' },
    { subject: 'Informatique', grade: '2ndeTI' },
    { subject: 'Informatique', grade: '2ndeA4' },
    { subject: 'Informatique', grade: '2ndeC' },
    { subject: 'Informatique', grade: '1ère_TI' },
    { subject: 'Informatique', grade: '1ère_C' },
    { subject: 'Informatique', grade: '1ère_D' },
    { subject: 'Informatique', grade: '1ère_A4' },
    { subject: 'Informatique', grade: 'TleTI' },
    { subject: 'Informatique', grade: 'TleC' },
    { subject: 'Informatique', grade: 'TleD' },
    { subject: 'Informatique', grade: 'TleA4' },
];

async function main() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error("❌ Fichier credentials.json manquant !");
        process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    // Check if we have a token
    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
    } else {
        const codeFile = 'code.txt';
        if (fs.existsSync(codeFile)) {
            const code = fs.readFileSync(codeFile, 'utf8').trim();
            if (code) {
                console.log("🎟️ Code trouvé dans 'code.txt'. Tentative d'échange contre un token...");
                try {
                    const { tokens } = await oAuth2Client.getToken(code);
                    oAuth2Client.setCredentials(tokens);
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                    console.log('✅ Token enregistré dans', TOKEN_PATH);
                    fs.unlinkSync(codeFile); // Suppression du code après usage
                } catch (error) {
                    console.error("❌ Erreur lors de l'échange du code :", error.message);
                    process.exit(1);
                }
            }
        } else {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            console.log('\n🔗 ACTION REQUISE : Autorisez cette application en visitant cette URL :');
            console.log(authUrl);
            console.log('\nUne fois autorisé, vous recevrez un code. Enregistrez ce code dans un fichier nommé \'code.txt\' à la racine du projet, puis relancez ce script.');
            process.exit(0);
        }
    }

    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

    console.log("🔍 Récupération des playlists existantes...");
    const existingPlaylists = {};
    let pageToken = undefined;
    
    try {
        do {
            const res = await youtube.playlists.list({
                part: ['snippet'],
                mine: true,
                maxResults: 50,
                pageToken: pageToken
            });
            res.data.items?.forEach((item) => {
                existingPlaylists[item.snippet.title] = item.id;
            });
            pageToken = res.data.nextPageToken;
        } while (pageToken);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des playlists :", error.message);
    }

    console.log(`🚀 Début de la création de ${PLAYLISTS_TO_CREATE.length} playlists...`);
    const results = [];

    for (const item of PLAYLISTS_TO_CREATE) {
        const title = `${item.subject} - ${item.grade.replace('_', ' ')} - SmartLearn`;
        
        if (existingPlaylists[title]) {
            console.log(`⏭️ Playlist déjà existante : ${title} (ID: ${existingPlaylists[title]})`);
            results.push({ ...item, playlistId: existingPlaylists[title] });
            continue;
        }

        console.log(`⏳ Création de : ${title}...`);
        try {
            const response = await youtube.playlists.insert({
                part: ['snippet', 'status'],
                requestBody: {
                    snippet: {
                        title: title,
                        description: `Vidéos de cours, exercices et TP de ${item.subject} pour la classe de ${item.grade.replace('_', ' ')}. Propulsé par SmartLearn-edu.org.`,
                    },
                    status: {
                        privacyStatus: 'unlisted', // Non répertoriée
                    },
                },
            });

            console.log(`✅ Créée : ${response.data.id}`);
            results.push({ ...item, playlistId: response.data.id });
        } catch (error) {
            console.error(`❌ Erreur pour ${title}:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const csvContent = "Matière,Classe,PlaylistID\n" + results.map(r => `${r.subject},${r.grade},${r.playlistId}`).join("\n");
    fs.writeFileSync('youtube_playlists_created.csv', csvContent);
    console.log("\n🏆 Terminé ! Les IDs ont été sauvegardés dans 'youtube_playlists_created.csv'.");
}

main().catch(console.error);
