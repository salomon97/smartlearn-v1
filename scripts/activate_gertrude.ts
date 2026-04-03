import mongoose from 'mongoose';
import connectToDatabase from './src/lib/mongoose.ts';
import User from './src/models/User.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function activateGertrude() {
    try {
        await connectToDatabase();
        const email = "gertrudepachelimalelel@gmail.com";
        const user = await User.findOne({ email: email });

        if (!user) {
            console.log(`Utilisateur non trouvé avec l'email : ${email}`);
            return;
        }

        user.isPremium = true;
        await user.save();

        console.log('--- Activation Gertrude ---');
        console.log('Email:', user.email);
        console.log('Ancien statut: NON VIP');
        console.log('Nouveau statut: ✅ VIP');
        console.log('---------------------------');
        console.log('Compte activé avec succès !');

    } catch (error) {
        console.error('Erreur :', error);
    } finally {
        process.exit();
    }
}

activateGertrude();
