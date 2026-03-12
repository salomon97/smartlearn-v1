import connectToDatabase from "./src/lib/mongoose";
import User from "./src/models/User";

async function makeAdmin() {
    await connectToDatabase();
    // Remplacez par votre adresse e-mail de test
    const email = "foesalomon65@gmail.com"; 

    const user = await User.findOne({ email });
    
    if (!user) {
        console.log(`L'utilisateur ${email} n'existe pas. Veuillez le créer via la page d'inscription (/auth/inscription) d'abord.`);
        process.exit(1);
    }

    user.role = "admin";
    await user.save();
    console.log(`Succès: L'utilisateur ${email} est maintenant Administrateur !`);
    process.exit(0);
}

makeAdmin();
