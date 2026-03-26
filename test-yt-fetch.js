console.log("[1] Start");
const mongoose = require('mongoose');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
console.log("[2] Loaded env");

async function check() {
    console.log("[3] Connecting to MongoDB...");
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("[4] Connected!");
        const db = mongoose.connection.db;

        console.log("[5] Fetching courses...");
        const courses = await db.collection('courses').find({}).toArray();
        console.log(`[6] Found ${courses.length} courses!`);

        console.log("[7] Fetching mappings...");
        const mappings = await db.collection('drivemappings').find({ contentType: 'videos' }).toArray();
        console.log(`[8] Found ${mappings.length} mappings!`);

        console.log("\n--- DB CONTENT ---");
        courses.slice(0, 3).forEach(c => console.log(`Course: ${c.grade_level} / ${c.subject}`));
        mappings.slice(0, 3).forEach(m => console.log(`Mapping: ${m.grade_level} / ${m.subject} => ${m.playlistId}`));

    } catch(e) {
        console.error("ERROR:", e.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}
check();
