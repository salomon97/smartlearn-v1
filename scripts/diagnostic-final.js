require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    grade_level: String,
    isPremium: Boolean,
    role: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const DriveMappingSchema = new mongoose.Schema({
    grade_level: String,
    subject: String,
    contentType: String,
    folderId: String
});
const DriveMapping = mongoose.models.DriveMapping || mongoose.model('DriveMapping', DriveMappingSchema);

async function diagnostic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connexion MongoDB");

        const student = await User.findOne({ email: 'foesalomon65@gmail.com' }); // On vérifie pour Robert Atangana
        if (!student) {
            console.log("❌ Élève non trouvé");
            process.exit(1);
        }

        console.log(`\n👨‍🎓 ÉLÈVE : ${student.email}`);
        console.log(`- Classe (grade_level) : [${student.grade_level}]`);
        console.log(`- Premium : ${student.isPremium}`);
        console.log(`- Role : ${student.role}`);

        const grade = student.grade_level;
        console.log(`\n🔍 Recherche de mappings pour la classe : [${grade}]`);
        
        // Simuler la requête de l'API content/route.ts
        const query = {
            $or: [
                { grade_level: grade },
                { grade_level: 'TOUTES' }
            ]
        };
        const mappings = await DriveMapping.find(query);

        console.log(`- Mappings trouvés : ${mappings.length}`);
        mappings.forEach(m => {
            console.log(`  > [${m.grade_level}] ${m.subject} - ${m.contentType}`);
        });

        if (mappings.length === 0) {
            console.log("\n⚠️ ALERTE : Aucun mapping trouvé pour cette classe exacte !");
            // Vérifier des variations
            const allGrades = await DriveMapping.distinct('grade_level');
            console.log(`\nClasses existantes dans DriveMapping : ${allGrades.join(', ')}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnostic();
