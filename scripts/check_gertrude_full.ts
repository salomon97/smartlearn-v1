import mongoose from 'mongoose';
import connectToDatabase from './src/lib/mongoose.ts';
import User from './src/models/User.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkGertrude() {
    try {
        await connectToDatabase();
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
        process.exit();
    }
}

checkGertrude();
