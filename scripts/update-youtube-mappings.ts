import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import DriveMapping from '../src/models/DriveMapping';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Lamemoire97:Pwp6h2xfnUd8yWd8@smartlearncluster.zhxslua.mongodb.net/smartlearn?retryWrites=true&w=majority&appName=SmartLearnCluster";

async function updateMappings() {
    try {
        console.log("🔗 Connexion à MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connecté.");

        const csvPath = path.join(process.cwd(), 'youtube_playlists_created.csv');
        if (!fs.existsSync(csvPath)) {
            console.error("❌ Fichier youtube_playlists_created.csv manquant !");
            process.exit(1);
        }

        const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [subject, grade, playlistId] = line.split(',');
            if (!subject || !grade || !playlistId) continue;

            console.log(`⏳ Mise à jour de ${subject} - ${grade} -> Playlist: ${playlistId}...`);
            
            // On met à jour toutes les entrées qui correspondent à cette classe et matière
            // Le champ 'playlistId' sera ajouté s'il n'existe pas
            const result = await DriveMapping.updateMany(
                { subject: subject, grade_level: grade },
                { $set: { playlistId: playlistId } }
            );

            console.log(`✅ ${result.modifiedCount} entrées mises à jour.`);
        }

        console.log("🏆 Toutes les playlists ont été liées avec succès !");
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour :", error);
        process.exit(1);
    }
}

updateMappings();
