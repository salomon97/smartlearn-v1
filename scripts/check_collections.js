const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) { process.env[match[1].trim()] = match[2].trim(); }
});

const ContentMappingSchema = new mongoose.Schema({
    grade_level: String,
    subject: String,
    contentType: String,
    bunnyStoragePath: String,
    bunnyCollectionId: String,
});

const ContentMapping = mongoose.model('ContentMapping', ContentMappingSchema, 'contentmappings');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const maths = await ContentMapping.findOne({ subject: "Mathématiques", grade_level: "6ème", contentType: "videos" });
        const info = await ContentMapping.findOne({ subject: "Informatique", grade_level: "6ème", contentType: "videos" });
        
        console.log("MATHS Collection ID:", maths ? maths.bunnyCollectionId : "NOT FOUND");
        console.log("INFO Collection ID:", info ? info.bunnyCollectionId : "NOT FOUND");
        
        if (maths && info && maths.bunnyCollectionId === info.bunnyCollectionId) {
            console.log("CRITICAL ERROR: The Collection IDs are identical!");
        } else {
            console.log("The Collection IDs are different. The logic works.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
