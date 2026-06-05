import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware global — garde de session.
 *
 * Ce middleware intercepte les routes sensibles (dashboard, profil, affiliation,
 * paiement, admin) AVANT que le composant serveur ne soit exécuté. Il vérifie
 * uniquement la présence d'un JWT valide ; les contrôles fins (Premium actif,
 * rôle admin) restent dans chaque route, où ils ont accès à la DB fraîche.
 *
 * Ce qu'il NE fait PAS (par design) :
 *   - Vérifier l'expiration Premium (responsabilité des API/pages individuelles
 *     qui font computePremiumStatus sur la DB).
 *   - Vérifier le rôle admin (le layout admin le fait déjà).
 *
 * Pourquoi un middleware : protection en défense en profondeur. Si une nouvelle
 * page sensible est ajoutée sous /dashboard et qu'on oublie le redirect côté
 * server component, le middleware bloque quand même les visiteurs non connectés.
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Aucune session → redirection vers /auth/connexion en préservant le callback
  if (!token) {
    const loginUrl = new URL('/auth/connexion', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Garde-fou admin : empêche l'accès à /admin sans rôle admin (le layout le
  // fait déjà via getServerSession, c'est un double check).
  if (pathname.startsWith('/admin') && (token as any).role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/affiliation/:path*',
    '/paiement/:path*',
    '/admin/:path*',
  ],
};
