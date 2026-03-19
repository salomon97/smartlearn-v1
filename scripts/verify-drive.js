const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function verifySync() {
    const rootId = '1CVmWPsOh2mIW6rfJIniW8dXiQUBpGaT7';
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    const tokenPath = path.join(process.cwd(), 'token.json');

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    console.log("🚀 Verifying Root ID:", rootId);

    try {
        const res = await drive.files.list({
            q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name)',
        });
        const folders = res.data.files || [];
        console.log(`Found ${folders.length} top-level folders:`);
        folders.forEach(f => console.log(` - ${f.name} (ID: ${f.id})`));
        
        if (folders.length > 0) {
            console.log("✅ API is working and can read the Drive hierarchy.");
        } else {
            console.log("⚠️ No subfolders found in the provided Root ID.");
        }
    } catch (err) {
        console.error("❌ Verification failed:", err.message);
    }
}

verifySync();
