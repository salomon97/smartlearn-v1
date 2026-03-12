import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import AdminToken from '@/models/AdminToken';
import bcrypt from 'bcryptjs';

// Cette route est appelée quand l'Admin clique sur le lien dans son email.
// Elle doit vérifier le token et, si valide, déclencher NextAuth d'une manière ou d'une autre.
// Pour NextAuth, on va utiliser une redirection avec un paramètre sécurisé vers /api/auth/callback/credentials

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            return NextResponse.redirect(new URL('/?error=Lien_Invalide', req.url));
        }

        await connectToDatabase();

        // 1. Chercher un token non expiré pour cet email
        const tokenRecord = await AdminToken.findOne({ email });

        if (!tokenRecord) {
            return NextResponse.redirect(new URL('/?error=Lien_Expire_Ou_Invalide', req.url));
        }

        // 2. Vérifier que le jeton brut correspond au hash stocké
        const isValid = await bcrypt.compare(token, tokenRecord.token);

        if (!isValid) {
            return NextResponse.redirect(new URL('/?error=Lien_Invalide', req.url));
        }

        // 3. Le lien est valide. On le détruit immédiatement pour qu'il soit à usage INIQUE.
        await AdminToken.findByIdAndDelete(tokenRecord._id);

        // 4. Connecter l'utilisateur. 
        // L'astuce avec NextAuth "Credentials" est qu'il faut faire un POST. 
        // Depuis un GET (le clic email), on ne peut pas faire de POST direct côté client sans JavaScript.
        // On va renvoyer une page HTML très basique qui fait un auto-submit d'un formulaire POST caché vers NextAuth.

        const htmlForm = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authentification en cours...</title>
                    <style>
                        body { background-color: #f9fafb; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
                        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #ff6e14; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    </style>
                </head>
                <body>
                    <div style="text-align: center;">
                        <div class="loader" style="margin: 0 auto 16px;"></div>
                        <p style="color: #4b5563;">Connexion sécurisée en cours...</p>
                    </div>
                    
                    <form id="autoLoginForm" action="/api/auth/callback/credentials" method="POST" style="display: none;">
                        <input type="hidden" name="csrfToken" id="csrfToken" value="" />
                        <!-- On informe notre Provider "Credentials" personnalisé que c'est une connexion MagicLink -->
                        <input type="hidden" name="magicLinkEmail" value="${email}" />
                        <!-- Jeton d'autorisation spécial (secret interne) pour que NextAuth sache que ça vient de cette vérification validée -->
                        <input type="hidden" name="magicLinkVerificationSecret" value="${process.env.NEXTAUTH_SECRET}" />
                        <!-- Redirection vers le tableau de bord admin après succès -->
                        <input type="hidden" name="callbackUrl" value="/admin" />
                    </form>

                    <script>
                        // Pour faire un POST propre vers NextAuth, il faut récupérer le CSRF Token d'abord
                        fetch('/api/auth/csrf')
                            .then(res => res.json())
                            .then(data => {
                                document.getElementById('csrfToken').value = data.csrfToken;
                                document.getElementById('autoLoginForm').submit();
                            })
                            .catch(err => {
                                window.location.href = '/?error=Erreur_CSRF';
                            });
                    </script>
                </body>
            </html>
        `;

        return new NextResponse(htmlForm, {
            headers: { "Content-Type": "text/html" }
        });

    } catch (error) {
        console.error("❌ Erreur lors de la vérification du magic link:", error);
        return NextResponse.redirect(new URL('/?error=Erreur_Serveur', req.url));
    }
}
