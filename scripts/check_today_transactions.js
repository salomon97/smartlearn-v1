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

async function checkAllTodayTransactions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB.');
        
        // Toutes les transactions depuis le début de la journée
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const transactions = await Transaction.find({ 
            createdAt: { $gte: today }
        }).sort({ createdAt: -1 });

        if (transactions.length === 0) {
            console.log("Aucune transaction trouvée aujourd'hui.");
            return;
        }

        console.log(`Trouvé ${transactions.length} transaction(s) aujourd'hui :`);
        transactions.forEach(t => {
            console.log('---');
            console.log('ID:', t._id);
            console.log('Utilisateur (ID):', t.userId || 'INCONNU ❓');
            console.log('Montant:', t.amount);
            console.log('Statut:', t.status);
            console.log('Référence:', t.referenceId);
            console.log('Date:', t.createdAt);
            console.log('---');
        });

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkAllTodayTransactions();
