const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// Definition simplifiée du schéma pour la vérification
const UserSchema = new mongoose.Schema({
    email: String,
    isPremium: Boolean,
    role: String
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkGertrude() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB.');
        
        const email = "gertrudepachellimalele@gmail.com";
        const user = await User.findOne({ email: email });

        if (!user) {
            console.log(`Utilisateur non trouvé avec l'email : ${email}`);
            return;
        }

        console.log('--- Statut de Gertrude ---');
        console.log('Email:', user.email);
        console.log('Est Premium (VIP):', user.isPremium ? '✅ OUI' : '❌ NON');
        console.log('Rôle:', user.role);
        console.log('---------------------------');

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

checkGertrude();
