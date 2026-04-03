const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) { process.env[match[1].trim()] = match[2].trim(); }
});

async function listFolder() {
    const zoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    const password = process.env.BUNNY_STORAGE_PASSWORD;
    
    // Exactly what Next.js did
    const cleanPath = "6ème/Informatique/evaluations";
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    
    console.log("Listing:", `/${zoneName}/${encodedPath}/`);
    
    const options = {
      hostname: 'storage.bunnycdn.com',
      port: 443,
      path: `/${zoneName}/${encodedPath}/`, // MUST have trailing slash to list directory
      method: 'GET',
      headers: {
        'AccessKey': password,
        'accept': 'application/json'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      console.log(`STATUS ENCODED: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
            const items = JSON.parse(data);
             console.log("Items:", items.map ? items.map(i => i.ObjectName) : items);
        } catch(e) { console.log("Raw:", data); }
      });
    });
    req.on('error', (e) => console.error(e));
    req.end();

    // Now try UN-encoded to see what Bunny returns natively
    setTimeout(() => {
        const options2 = { ...options, path: `/${zoneName}/${cleanPath}/` };
        console.log("Listing UNENCODED:", options2.path);
        const req2 = https.request(options2, (res) => {
          console.log(`STATUS UNENCODED: ${res.statusCode}`);
        });
        req2.end();
    }, 1000);
}
listFolder();
