import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Charger l'environnement local manuellement car dotenv n'est pas tjs parfait dans un environnement Next.js complexe
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

import { Schema, Document, models } from 'mongoose';

// Définition locale du modèle pour le script (évite les conflits d'import Next.js)
const ContentMappingSchema = new Schema({
    grade_level: { type: String, required: true },
    subject: { type: String, required: true },
    contentType: { type: String, required: true },
    bunnyStoragePath: { type: String, required: false },
    bunnyCollectionId: { type: String, required: false },
}, { timestamps: true });
const ContentMapping = models.ContentMapping || mongoose.model('ContentMapping', ContentMappingSchema);

const GRADES = [
    "6ème", "5ème", "4ème", "3ème",
    "2nde A", "2nde C", "2nde E", "2nde TI",
    "1ère A", "1ère C", "1ère D", "1ère E", "1ère TI",
    "Terminale A", "Terminale C", "Terminale D", "Terminale E", "Terminale TI"
];
const SUBJECTS = ['Mathématiques', 'Informatique'];
const FOLDER_TYPES = ['chapters', 'evaluations', 'annales_officiels', 'annales_blancs', 'library_manuals', 'library_ref'];

// Configuration Bunny
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE_NAME;
const STORAGE_PASS = process.env.BUNNY_STORAGE_PASSWORD;
const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID;

const STORAGE_API_BASE = `https://storage.bunnycdn.com/${STORAGE_ZONE}`;
const STREAM_API_BASE = `https://video.bunnycdn.com/library/${LIBRARY_ID}`;

async function createStorageFolder(folderPath: string) {
    // Bunny exige un "slash" final pour comprendre que c'est un dossier et non un fichier
    const url = `${STORAGE_API_BASE}/${folderPath}/`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'AccessKey': STORAGE_PASS as string,
                'Content-Length': '0' // Important pour la création de dossier
            }
        });
        if (response.ok || response.status === 201) {
            console.log(`✅ Dossier créé sur Bunny Storage : /${folderPath}`);
            return true;
        } else {
            console.error(`❌ Échec Bunny Storage /${folderPath}: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (e: any) {
         console.error(`❌ Échec réseau Bunny Storage: ${e.message}`);
         return false;
    }
}

async function getStreamCollections() {
     const res = await fetch(`${STREAM_API_BASE}/collections?page=1&itemsPerPage=100`, {
         headers: { 'AccessKey': BUNNY_API_KEY as string, 'accept': 'application/json' }
     });
     if (!res.ok) return [];
     const data = await res.json();
     return data.items || [];
}

async function createStreamCollection(name: string): Promise<string | null> {
    try {
        const response = await fetch(`${STREAM_API_BASE}/collections`, {
            method: 'POST',
            headers: {
                'AccessKey': BUNNY_API_KEY as string,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ Collection vidéo créée sur Bunny Stream : ${name} (ID: ${data.guid})`);
            return data.guid;
        } else {
             console.error(`❌ Échec création collection ${name} :`, data);
             return null;
        }
    } catch (e: any) {
        return null;
    }
}

async function automateSetup() {
    console.log("🚀 Démarrage de l'automatisation Bunny.net & MongoDB...");

    // Connexion DB
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI manquant");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📚 Connecté à MongoDB.");

    // Récupération des collections existantes pour éviter les doublons
    const existingCollections = await getStreamCollections();

    let createdCount = 0;

    // Suppression préalable de tous les anciens mappings pour remettre à zéro proprement
    await ContentMapping.deleteMany({});
    console.log("🧹 Base de données ContentMapping réinitialisée.");

    for (const grade of GRADES) {
        for (const subject of SUBJECTS) {
            
            // 1. Création Physique sur Bunny Storage (Fichiers & PDF)
            for (const type of FOLDER_TYPES) {
                const pathStr = `${grade}/${subject}/${type}`;
                await createStorageFolder(pathStr);

                // Mapping MongoDB (Storage)
                await ContentMapping.create({
                    grade_level: grade,
                    subject: subject,
                    contentType: type,
                    bunnyStoragePath: pathStr
                });
                createdCount++;
            }

            // 2. Création de la Collection Vidéo sur Bunny Stream
            const collectionName = `${grade} - ${subject}`;
            let collectionId = existingCollections.find((c: any) => c.name === collectionName)?.guid;

            if (!collectionId) {
                collectionId = await createStreamCollection(collectionName);
            } else {
                console.log(`ℹ️ Collection vidéo existante trouvée : ${collectionName}`);
            }

            // Mapping MongoDB (Vidéos)
            if (collectionId) {
                await ContentMapping.create({
                    grade_level: grade,
                    subject: subject,
                    contentType: 'videos',
                    bunnyCollectionId: collectionId
                });
                createdCount++;
            }
        }
    }

    console.log(`\n🎉 Terminé ! L'architecture Bunny.net est en place.`);
    console.log(`📊 Total de mappings (Dossiers/Collections) créés en base de données : ${createdCount}`);
    
    await mongoose.disconnect();
}

automateSetup().catch(console.error);
