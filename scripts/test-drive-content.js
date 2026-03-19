require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const path = require('path');
const { getGoogleAuth } = require(path.join(process.cwd(), 'src/lib/googleAuth'));

async function testDriveFolder(folderId) {
    try {
        const auth = await getGoogleAuth();
        const drive = google.drive({ version: 'v3', auth });

        console.log(`\n📂 Inspection du dossier : ${folderId}`);
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType, webViewLink)',
            orderBy: 'name',
        });

        const files = response.data.files || [];
        console.log(`- Éléments trouvés : ${files.length}`);
        files.forEach(f => {
            console.log(`  > [${f.mimeType === 'application/vnd.google-apps.folder' ? 'DIR' : 'FILE'}] ${f.name} (${f.id})`);
        });

        if (files.length === 0) {
            console.log("\n⚠️ ALERTE : Le dossier est VIDE !");
            
            // On vérifie le dossier lui-même
            const self = await drive.files.get({ fileId: folderId, fields: 'name, mimeType' });
            console.log(`\nLe dossier cible s'appelle : "${self.data.name}" (Type: ${self.data.mimeType})`);
        }
    } catch (err) {
        console.error("❌ Erreur :", err.message);
    }
}

// Tester le dossier 6ème Mathématiques > 01_Chapitres
testDriveFolder('1fNjpC-0S3PLaxvNZ7BuY7HaDzkLDPYAd');
