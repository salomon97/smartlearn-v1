const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkWebhooks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const logs = await db.collection('webhook_logs').find({}).sort({ receivedAt: -1 }).limit(3).toArray();
        console.log(`Trouvé ${logs.length} logs récents :`);
        logs.forEach((l, i) => {
            console.log(`\n--- Log #${i + 1} ---`);
            console.log(`Date :`, l.receivedAt);
            console.log(`Query Params :`, l.query);
            console.log(`Corps (Body) :\n`, JSON.stringify(l.body, null, 2));
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkWebhooks();
