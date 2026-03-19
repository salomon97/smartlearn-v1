require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const DriveMappingSchema = new mongoose.Schema({
    grade_level: String,
    subject: String,
    contentType: String,
    folderId: String,
    playlistId: String,
    path: String,
    updatedAt: Date
});

const DriveMapping = mongoose.models.DriveMapping || mongoose.model('DriveMapping', DriveMappingSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const mappings = await DriveMapping.find({ grade_level: /6/i });
        console.log(`Found ${mappings.length} mappings for 6ème/6e:`);
        
        mappings.forEach(m => {
            console.log(`- [${m.grade_level}] [${m.subject}] [${m.contentType}] -> Folder: ${m.folderId}, Total: ${!!m.playlistId}`);
        });

        const all = await DriveMapping.find({});
        console.log(`\nTotal mappings in DB: ${all.length}`);
        
        // Print unique grade levels found
        const grades = [...new Set(all.map(m => m.grade_level))];
        console.log(`Unique grades in DB: ${grades.join(', ')}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
