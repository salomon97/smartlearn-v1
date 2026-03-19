require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const credentials = require('../credentials.json');
const token = require('../token.json');

async function listPlaylists() {
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials(token);
    const youtube = google.youtube({ version: 'v3', auth });
    
    try {
        const response = await youtube.playlists.list({
            part: ['snippet', 'contentDetails'],
            mine: true,
            maxResults: 50
        });
        
        response.data.items.forEach(p => {
            console.log(`[${p.snippet.title}]`);
            console.log(`  ID: ${p.id}`);
            console.log(`  Count: ${p.contentDetails.itemCount}`);
        });
    } catch(e) {
        console.error(e);
    }
}
listPlaylists();
