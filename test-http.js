const https = require('https');

https.get('https://smartlearn-v1.vercel.app/api/admin/debug-yt', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => { console.log("Response:", data); });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
