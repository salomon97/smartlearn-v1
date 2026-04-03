const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) {
        process.env[match[1].trim()] = match[2].trim();
    }
});

async function testBunny() {
    const zoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    const password = process.env.BUNNY_STORAGE_PASSWORD;
    const cleanPath = "6ème/Informatique/evaluations";
    
    console.log("Testing:", `https://storage.bunnycdn.com/${zoneName}/${cleanPath}/`);
    
    const response = await fetch(`https://storage.bunnycdn.com/${zoneName}/${cleanPath}/`, {
        headers: {
            'AccessKey': password,
            'accept': 'application/json'
        }
    });

    console.log("Status un-encoded:", response.status);
    
    // Test encoded
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    console.log("\nTesting encoded:", `https://storage.bunnycdn.com/${zoneName}/${encodedPath}/`);
    
    const responseEncoded = await fetch(`https://storage.bunnycdn.com/${zoneName}/${encodedPath}/`, {
        headers: {
            'AccessKey': password,
            'accept': 'application/json'
        }
    });
    
    console.log("Status encoded:", responseEncoded.status);
    if (responseEncoded.ok) {
        console.log("Data:", await responseEncoded.json());
    }
}
testBunny();
