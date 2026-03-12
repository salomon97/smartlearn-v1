import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "eleve@smartlearn.com" },
                password: { label: "Mot de passe", type: "password" },
                magicLinkEmail: { label: "Magic Link Email", type: "text" },
                magicLinkVerificationSecret: { label: "Magic Link Secret", type: "text" }
            },
            async authorize(credentials) {
                await connectToDatabase();

                // === LOGIQUE 1 : MAGIC LINK (ADMIN UNIQUEMENT) ===
                if (credentials?.magicLinkEmail && credentials?.magicLinkVerificationSecret) {
                    console.log("[NextAuth] Magic Link attempt for:", credentials.magicLinkEmail);
                    
                    // Vérifier que le secret transmis par notre propre serveur (/verify) est le bon
                    const expectedSecret = process.env.NEXTAUTH_SECRET || "smartlearn-super-secret-key-pour-le-mvp";
                    
                    if (credentials.magicLinkVerificationSecret !== expectedSecret) {
                        console.log("[NextAuth] Secret mismatch");
                        throw new Error("Authentification Magic Link rejetée (Secret invalide).");
                    }

                    const adminUser = await User.findOne({ email: credentials.magicLinkEmail.toLowerCase(), role: 'admin' });
                    
                    if (!adminUser) {
                        console.log("[NextAuth] Admin user not found:", credentials.magicLinkEmail);
                        throw new Error("Authentification Magic Link rejetée (Admin introuvable).");
                    }

                    console.log("[NextAuth] Success for:", adminUser.email);

                    // Générer la session admin
                    const sessionId = crypto.randomUUID();
                    adminUser.sessionId = sessionId;
                    await adminUser.save();

                    return {
                        id: adminUser._id.toString(),
                        email: adminUser.email,
                        name: adminUser.name,
                        isPremium: adminUser.isPremium,
                        grade_level: adminUser.grade_level,
                        sessionId: sessionId,
                        role: adminUser.role,
                        image: adminUser.image
                    };
                }

                // === LOGIQUE 2 : CONNEXION CLASSIQUE (ELEVES & AFFILIES) ===
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Veuillez entrer une adresse e-mail et un mot de passe.");
                }

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user) {
                    throw new Error("Erreur de connexion. Vérifiez vos identifiants.");
                }

                const passwordsMatch = await bcrypt.compare(credentials.password, user.password as string);

                if (!passwordsMatch) {
                    throw new Error("Erreur de connexion. Vérifiez vos identifiants.");
                }

                if (!user.isVerified) {
                    throw new Error("Veuillez vérifier votre adresse e-mail avant de vous connecter.");
                }
                
                // Sécurité : Empêcher un admin de se connecter via ce formulaire public classique
                if (user.role === 'admin') {
                    throw new Error("L'accès Administrateur n'est plus autorisé via ce formulaire par mesure de sécurité.");
                }

                // Générer un nouvel identifiant de session unique pour empêcher le partage
                const sessionId = crypto.randomUUID();
                user.sessionId = sessionId;
                await user.save();

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    isPremium: user.isPremium,
                    grade_level: user.grade_level,
                    sessionId: sessionId,
                    role: user.role,
                    image: user.image
                };
            }
        })
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.id = user.id;
                token.isPremium = user.isPremium;
                token.grade_level = user.grade_level;
                token.sessionId = user.sessionId;
                token.role = user.role;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.isPremium = token.isPremium;
                session.user.grade_level = token.grade_level;
                session.user.sessionId = token.sessionId;
                session.user.role = token.role;
                session.user.image = token.image;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/connexion',
    },
    secret: process.env.NEXTAUTH_SECRET || "smartlearn-super-secret-key-pour-le-mvp",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
