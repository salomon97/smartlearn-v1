export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "smartlearn-super-secret-key-pour-le-mvp";
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://smartlearn-edu.org";

// Force la base URL officielle en production pour éviter les erreurs de redirection d'emails
export const BASE_URL = process.env.NODE_ENV === 'production' 
    ? "https://smartlearn-edu.org" 
    : (process.env.NEXTAUTH_URL || "http://localhost:3000");
