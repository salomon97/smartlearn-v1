import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import AdminToken from "@/models/AdminToken";
import { trackEvent } from "@/lib/retention";
import { computePremiumStatus } from "@/lib/premium-core";
import { grantTrialIfEligible, logFreemiumEvent } from "@/lib/freemium";
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
                magicLinkToken: { label: "Magic Link Token", type: "text" }
            },
            async authorize(credentials) {
                await connectToDatabase();

                // === LOGIQUE 1 : MAGIC LINK (ADMIN UNIQUEMENT) ===
                if (credentials?.magicLinkEmail && credentials?.magicLinkToken) {
                    // Correspondance exacte avec la casse stockée par /request-link (le lien email
                    // transporte adminUser.email tel quel) — évite toute désynchronisation de casse.
                    const email = credentials.magicLinkEmail;

                    // La preuve de légitimité est le jeton à usage unique (généré par /request-link
                    // et envoyé par email), JAMAIS un secret partagé statique. On le valide et on le
                    // consomme ici, au moment exact où la session est créée.
                    const tokenRecord = await AdminToken.findOne({ email });
                    if (!tokenRecord) {
                        throw new Error("Authentification Magic Link rejetée (lien expiré ou déjà utilisé).");
                    }

                    const tokenValid = await bcrypt.compare(credentials.magicLinkToken, tokenRecord.token);
                    if (!tokenValid || tokenRecord.expiresAt < new Date()) {
                        await AdminToken.deleteOne({ _id: tokenRecord._id });
                        throw new Error("Authentification Magic Link rejetée (lien invalide ou expiré).");
                    }

                    // Usage unique strict : on détruit le jeton dès qu'il sert.
                    await AdminToken.deleteOne({ _id: tokenRecord._id });

                    const adminUser = await User.findOne({ email, role: 'admin' });
                    if (!adminUser) {
                        throw new Error("Authentification Magic Link rejetée (Admin introuvable).");
                    }

                    // Générer la session admin
                    const sessionId = crypto.randomUUID();
                    adminUser.sessionId = sessionId;
                    await adminUser.save();

                    return {
                        id: adminUser._id.toString(),
                        email: adminUser.email,
                        name: adminUser.name,
                        isPremium: adminUser.isPremium,
                        premiumUntil: adminUser.premiumUntil,
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

                // Migration lazy : octroi essai 7j si éligible (legacy users sans welcomeTrialGrantedAt)
                // Idempotent : safe à appeler à chaque login.
                const trialGrantedMigration = grantTrialIfEligible(user);

                // Tracking last login (pour n8n 02-relance-inactif-7j)
                user.lastLoginAt = new Date();

                // Générer un nouvel identifiant de session unique pour empêcher le partage
                const sessionId = crypto.randomUUID();
                user.sessionId = sessionId;
                await user.save();

                // Instrumentation rétention (best-effort, non bloquant)
                await trackEvent(user._id.toString(), 'login');

                // Observability freemium : log trial_granted si octroyé lors de cette migration
                if (trialGrantedMigration) {
                  logFreemiumEvent(user._id.toString(), 'trial_granted', { source: 'migration' }).catch(() => {});
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    isPremium: user.isPremium,
                    premiumUntil: user.premiumUntil,
                    welcomeTrialGrantedAt: user.welcomeTrialGrantedAt,
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
        async jwt({ token, user, trigger }: { token: any, user: any, trigger?: string }) {
            if (user) {
                token.id = user.id;
                token.isPremium = user.isPremium;
                token.premiumUntil = user.premiumUntil;
                token.welcomeTrialGrantedAt = user.welcomeTrialGrantedAt;
                token.grade_level = user.grade_level;
                token.sessionId = user.sessionId;
                token.role = user.role;
                token.image = user.image;
            }
            // Refresh manuel depuis la BD (déclenché par useSession().update() côté client).
            // Utilisé après un paiement Chariow réussi pour que isPremium/premiumUntil reflètent
            // l'état BD sans forcer un logout/login.
            if (trigger === 'update' && token?.id) {
                try {
                    await connectToDatabase();
                    const fresh = await User.findById(token.id).select('isPremium premiumUntil welcomeTrialGrantedAt role grade_level image');
                    if (fresh) {
                        token.isPremium = fresh.isPremium;
                        token.premiumUntil = fresh.premiumUntil;
                        token.welcomeTrialGrantedAt = fresh.welcomeTrialGrantedAt;
                        token.role = fresh.role;
                        token.grade_level = fresh.grade_level;
                        token.image = fresh.image;
                    }
                } catch (err) {
                    console.error('[NextAuth jwt update] échec refresh BD :', err);
                }
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.grade_level = token.grade_level;
                session.user.sessionId = token.sessionId;
                session.user.role = token.role;
                session.user.image = token.image;

                // Calcul du statut Premium EFFECTIF à chaque requête (le JWT porte la valeur brute,
                // la session expose le statut calculé). Un abonné dont premiumUntil est passé verra
                // session.user.isPremium = false sans avoir à se reconnecter.
                const access = computePremiumStatus({ isPremium: token.isPremium, premiumUntil: token.premiumUntil });
                session.user.isPremium = access.isPremium;
                session.user.premiumStatus = access.status;
                session.user.premiumUntil = token.premiumUntil;
                session.user.premiumExpiresAt = access.expiresAt;
                session.user.premiumDaysRemaining = access.daysRemaining;

                session.user.welcomeTrialGrantedAt = token.welcomeTrialGrantedAt;

                // isOnTrial : vrai si l'user est Premium grâce à son essai initial (pas un Premium payé).
                // Heuristique : welcomeTrialGrantedAt set + premiumUntil ≈ welcomeTrialGrantedAt + 7d (à la minute près).
                // (Après paiement Chariow, premiumUntil est étendu — la différence dépasse 1 minute, isOnTrial=false.)
                const trialEnd = token.welcomeTrialGrantedAt
                    ? new Date(new Date(token.welcomeTrialGrantedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
                    : null;
                const premiumUntilDate = token.premiumUntil ? new Date(token.premiumUntil) : null;
                session.user.isOnTrial = !!(
                    access.isPremium &&
                    trialEnd && premiumUntilDate &&
                    Math.abs(trialEnd.getTime() - premiumUntilDate.getTime()) < 60_000
                );
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/connexion',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
