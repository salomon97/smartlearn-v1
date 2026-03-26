const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/youtube'
];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function main() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        console.error("❌ Fichier credentials.json manquant !");
        process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    // Check if code.txt exists to exchange it
    const codeFile = path.join(process.cwd(), 'code.txt');
    if (fs.existsSync(codeFile)) {
        const code = fs.readFileSync(codeFile, 'utf8').trim();
        if (code) {
            console.log("🎟️ Code détecté ! Échange en cours...");
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                oAuth2Client.setCredentials(tokens);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                console.log('✅ SUCCÈS : Le nouveau token est enregistré dans token.json');
                console.log('Tu peux maintenant utiliser le Sync Center dans ton administration !');
                fs.unlinkSync(codeFile);
                process.exit(0);
            } catch (error) {
                console.error("❌ Erreur lors de l'échange :", error.message);
                process.exit(1);
            }
        }
    }

    // Otherwise generate URL
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });

    console.log('\n🔐 CONFIGURATION DES ACCÈS SMARTLEARN');
    console.log('------------------------------------');
    console.log('Pour que le Sync Center puisse lire ton Drive et ton YouTube, tu dois autoriser ces accès.');
    console.log('\n1. Visite cette URL dans ton navigateur :');
    console.log(authUrl);
    console.log('\n2. Connecte-toi avec ton compte Google.');
    console.log('3. Copie le code de confirmation qui s\'affiche.');
    console.log('4. Donne-moi ce code ici-même.');
    console.log('------------------------------------\n');
}

main().catch(console.error);
