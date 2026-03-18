import mongoose from 'mongoose';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import 'dotenv/config'; // Load .env.local if available

// Simple hack to load models without full Next.js context
import DriveMapping from '../src/models/DriveMapping';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Lamemoire97:Pwp6h2xfnUd8yWd8@smartlearncluster.zhxslua.mongodb.net/smartlearn?retryWrites=true&w=majority&appName=SmartLearnCluster";

async function runImport() {
    try {
        console.log("🔗 Connexion à MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connecté.");

        const csvPath = '/tmp/smartlearn_drive_ids.csv';
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const mappings = [];
        let isFirstLine = true;

        for await (const line of rl) {
            if (isFirstLine) {
                isFirstLine = false;
                continue;
            }

            const [name, relPath, id] = line.split(',');
            if (!relPath || !id) continue;

            const parts = relPath.split('/');
            
            // Logic de parsing basée sur l'arborescence rclone
            let subject = 'N/A';
            let grade = 'N/A';
            let type: any = 'root';

            if (parts[0] === '02_Ressources_Pedagogiques') {
                subject = parts[1] || 'N/A';
                grade = parts[2] || 'N/A';
                
                if (parts[3] === '01_Chapitres') type = 'chapters';
                else if (parts[3] === '02_Evaluations_Sequentielles') type = 'evaluations';
                else if (parts[3] === '03_Annales_Examens') {
                    if (parts[4] === 'Officiels') type = 'annales_officiels';
                    else if (parts[4] === 'Blancs') type = 'annales_blancs';
                }
            } else if (parts[0] === '01_Bibliotheque_Numerique') {
                subject = parts[1] || 'N/A';
                grade = 'TOUTES'; // Les manuels sont souvent pour tout le monde ou par discipline
                if (parts[2] === 'Manuels_Scolaires') type = 'library_manuals';
                else if (parts[2] === 'Ouvrages_Reference') type = 'library_ref';
            }

            // On ne garde que les dossiers utiles pour l'élève (ceux qui ont une classe et une discipline)
            if (subject !== 'N/A' && grade !== 'N/A') {
                mappings.push({
                    grade_level: grade,
                    subject: subject,
                    contentType: type,
                    folderId: id,
                    path: relPath
                });
            }
        }

        console.log(`🧹 Nettoyage de l'ancienne table DriveMapping...`);
        await DriveMapping.deleteMany({});

        console.log(`🚀 Insertion de ${mappings.length} entrées...`);
        await DriveMapping.insertMany(mappings);

        console.log("🏆 Importation terminée avec succès !");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de l'importation :", error);
        process.exit(1);
    }
}

runImport();
