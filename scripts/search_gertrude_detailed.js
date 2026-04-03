const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
    isPremium: Boolean,
    name: String,
    grade_level: String
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function searchGertrudeDetailed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connecté à MongoDB.');
        
        const users = await User.find({ 
            $or: [
                { email: /gertrude/i },
                { name: /gertrude/i }
            ]
        });

        if (users.length === 0) {
            console.log("Aucun utilisateur trouvé.");
            return;
        }

        console.log(`Trouvé ${users.length} utilisateur(s) :`);
        users.forEach(user => {
            console.log('---');
            console.log('Nom:', user.name);
            console.log('Email:', user.email);
            console.log('Classe:', user.grade_level);
            console.log('VIP:', user.isPremium ? '✅ OUI' : '❌ NON');
        });

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

searchGertrudeDetailed();
