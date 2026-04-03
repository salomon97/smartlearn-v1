const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function checkWebhookLogs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB.');
        
        // On récupère la collection brute pour éviter de créer un modèle complet
        const db = mongoose.connection.db;
        const logs = await db.collection('webhook_logs').find({}).sort({ receivedAt: -1 }).limit(5).toArray();

        if (logs.length === 0) {
            console.log("Aucun log trouvé dans 'webhook_logs'. Attente du premier test...");
            return;
        }

        console.log(`Trouvé ${logs.length} log(s) de diagnostic :`);
        logs.forEach((log, index) => {
            console.log(`--- LOG #${index + 1} ---`);
            console.log('Date:', log.receivedAt);
            console.log('URL:', log.url);
            console.log('Query Params:', JSON.stringify(log.query, null, 2));
            console.log('Body:', JSON.stringify(log.body, null, 2));
        });

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkWebhookLogs();
