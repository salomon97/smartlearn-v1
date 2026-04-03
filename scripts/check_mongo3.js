const mongoose = require('mongoose');

const ContentMappingSchema = new mongoose.Schema({
    grade_level: String,
    subject: String,
    contentType: String,
    bunnyStoragePath: String,
    bunnyCollectionId: String,
});

// the collection is typically 'contentmappings' but sometimes mongoose pluralizes to something else, or maybe it is 'ContentMapping'?
const ContentMapping = mongoose.model('ContentMapping', ContentMappingSchema, 'contentmappings');

async function run() {
    try {
        await mongoose.connect('mongodb+srv://Lamemoire97:Pwp6h2xfnUd8yWd8@smartlearncluster.zhxslua.mongodb.net/smartlearn?retryWrites=true&w=majority&appName=SmartLearnCluster');
        // Let's just find ONE mapping to see if collection is correct
        const one = await ContentMapping.findOne();
        console.log("ONE:", one);
        const count = await ContentMapping.countDocuments();
        console.log("TOTAL:", count);
        
        // Let's try to query the native db collection names
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("COLLECTIONS:", collections.map(c => c.name));
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
