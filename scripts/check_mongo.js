const mongoose = require('mongoose');

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
        await mongoose.connect('mongodb+srv://Lamemoire97:Pwp6h2xfnUd8yWd8@smartlearncluster.zhxslua.mongodb.net/smartlearn?retryWrites=true&w=majority&appName=SmartLearnCluster');
        const mappings = await ContentMapping.find({ subject: "Informatique" });
        console.log(JSON.stringify(mappings, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
