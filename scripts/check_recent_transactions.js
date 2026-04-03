const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const TransactionSchema = new mongoose.Schema({
    userId: String,
    amount: Number,
    status: String,
    paymentMethod: String,
    referenceId: String,
    createdAt: Date,
    metadata: Object
}, { collection: 'transactions' });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function checkRecentTransactions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB.');
        
        // Chercher les transactions des dernières 30 minutes
        const minutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const transactions = await Transaction.find({ 
            createdAt: { $gte: minutesAgo }
        }).sort({ createdAt: -1 });

        if (transactions.length === 0) {
            console.log("Aucune transaction trouvée dans les 30 dernières minutes.");
            return;
        }

        console.log(`Trouvé ${transactions.length} transaction(s) récente(s) :`);
        transactions.forEach(t => {
            console.log('---');
            console.log('ID:', t._id);
            console.log('Utilisateur (ID):', t.userId || 'INCONNU ❓');
            console.log('Montant:', t.amount);
            console.log('Statut:', t.status);
            console.log('Date:', t.createdAt);
            console.log('Metadata:', JSON.stringify(t.metadata, null, 2));
        });

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkRecentTransactions();
