const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkLessons() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const lessons = await db.collection('lessons').find({}).limit(10).toArray();
        console.log("Exemples de leçons dans la BD:");
        lessons.forEach(l => {
            console.log(`- Titre: ${l.title}`);
            console.log(`  Video URL: ${l.videoUrl || 'AUCUNE URL VIDEO'}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkLessons();
