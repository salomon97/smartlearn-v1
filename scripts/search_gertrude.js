const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
    isPremium: Boolean,
    name: String
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function searchGertrude() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB.');
        
        const users = await User.find({ 
            $or: [
                { email: /gertrude/i },
                { name: /gertrude/i },
                { email: /pachelli/i }
            ]
        });

        if (users.length === 0) {
            console.log("Aucun utilisateur trouvé avec 'gertrude' ou 'pachelli'.");
            return;
        }

        console.log(`Trouvé ${users.length} utilisateur(s) :`);
        users.forEach(user => {
            console.log('---');
            console.log('Nom:', user.name);
            console.log('Email:', user.email);
            console.log('Est Premium (VIP):', user.isPremium ? '✅ OUI' : '❌ NON');
        });

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

searchGertrude();
