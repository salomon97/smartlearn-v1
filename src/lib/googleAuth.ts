import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

/**
 * Recupère le client OAuth2 configuré avec les credentials et le token.
 * Supporte les variables d'environnement (Vercel) et les fichiers locaux (Dev).
 */
export async function getGoogleAuth() {
    let credentials, token;

    // 1. Try Environment Variables (Vercel/Production)
    if (process.env.GOOGLE_CREDENTIALS_JSON && process.env.GOOGLE_TOKEN_JSON) {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        token = JSON.parse(process.env.GOOGLE_TOKEN_JSON);
    } 
    // 2. Fallback to Local Files (Development)
    else {
        const credentialsPath = path.join(process.cwd(), 'credentials.json');
        const tokenPath = path.join(process.cwd(), 'token.json');

        if (!fs.existsSync(credentialsPath) || !fs.existsSync(tokenPath)) {
            throw new Error("Identifiants Google manquants (Vérifiez les variables d'env ou les fichiers .json)");
        }

        credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    }

    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}
