import mongoose from 'mongoose';
import connectToDatabase from './src/lib/mongoose.ts';
import User from './src/models/User.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkUser() {
    try {
        await connectToDatabase();
        console.log('Connexion à la base de données réussie.');

        const user = await User.findOne({ 
            $or: [
                { email: /gertrude/i },
                { name: /gertrude/i }
            ]
        });

        if (!user) {
            console.log('Utilisateur non trouvé avec le nom ou email "gertrude".');
            return;
        }

        console.log('--- Infos Utilisateur ---');
        console.log('ID:', user._id);
        console.log('Nom:', user.name);
        console.log('Email:', user.email);
        console.log('Est Premium (VIP):', user.isPremium);
        console.log('Rôle:', user.role);
        console.log('Date de création:', user.createdAt);
        console.log('-------------------------');

        if (user.isPremium) {
            console.log('✅ Le compte est bien activé en VIP !');
        } else {
            console.log('❌ Le compte n\'est PAS encore activé en VIP.');
        }

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        process.exit();
    }
}

checkUser();
