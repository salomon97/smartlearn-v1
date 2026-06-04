import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";
import SessionGuardian from "@/components/SessionGuardian";
import MarketingBanner from "@/components/MarketingBanner";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartlearn-edu.org"),
  title: {
    default: "SmartLearn — L'école qui suit votre enfant.",
    template: "%s · SmartLearn"
  },
  description: "Plateforme éducative fédérée qui connecte école, parent et élève. Cours, exercices, suivi de progression — accessible depuis n'importe quel téléphone Android, même quand le réseau tousse.",
  keywords: ["éducation", "cours en ligne", "Cameroun", "lycée", "suivi scolaire", "APC", "SmartLearn", "Afrique francophone"],
  authors: [{ name: "Salomon FOE", url: "https://smartlearn-edu.org" }],
  creator: "Salomon FOE",
  publisher: "SmartLearn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://smartlearn-edu.org",
    siteName: "SmartLearn",
    title: "SmartLearn — L'école qui suit votre enfant.",
    description: "Cours, exercices, suivi de progression et alertes parents — accessibles depuis n'importe quel téléphone Android.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartLearn — Plateforme éducative fédérée",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartLearn — L'école qui suit votre enfant.",
    description: "Plateforme éducative fédérée pour l'Afrique francophone.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "-1XyO6LCHqiTWdmEj_8xXB5G94PuYItC4nqeVkUM11k",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A1628" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1628" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <MarketingBanner />
        <NextAuthProvider>
          <SessionGuardian />
          <main className="flex-grow">
            {children}
          </main>

          {/* ─── Footer ─── */}
          <footer className="bg-navy border-t border-white/5 py-14 px-6">
            <div className="max-w-7xl mx-auto">
              {/* Ligne principale : 3 colonnes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

                {/* Col 1 : Logo + pitch + coordonnées */}
                <div className="flex flex-col gap-4">
                  <Logo variant="full" theme="dark" size={44} />
                  <p className="text-sm text-slate-400 max-w-xs">
                    Plateforme numérique d'excellence pédagogique pour le secondaire camerounais.
                  </p>
                  <div className="text-xs text-slate-500 space-y-1 mt-2">
                    <div className="flex items-start gap-2">
                      <span aria-hidden>📍</span>
                      <span>Douala, Cameroun</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span aria-hidden>📞</span>
                      <span>+237 671 71 91 24 / +237 691 27 63 34</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span aria-hidden>✉️</span>
                      <a href="mailto:salomonfoe97@smartlearn-edu.org" className="hover:text-teal transition-colors">
                        salomonfoe97@smartlearn-edu.org
                      </a>
                    </div>
                  </div>
                </div>

                {/* Col 2 : Navigation */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Plateforme</h3>
                  <Link href="/catalogue" className="text-sm text-slate-300 hover:text-teal transition-colors">
                    Catalogue
                  </Link>
                  <Link href="/paiement" className="text-sm text-slate-300 hover:text-teal transition-colors">
                    Tarifs &amp; abonnements
                  </Link>
                  <Link href="/affiliation" className="text-sm text-slate-300 hover:text-teal transition-colors">
                    Programme Ambassadeur
                  </Link>
                  <Link href="/le-fondateur" className="text-sm text-slate-300 hover:text-teal transition-colors">
                    Le fondateur
                  </Link>
                </div>

                {/* Col 3 : Légal + contact */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Institutionnel</h3>
                  <Link href="/politique-confidentialite" className="text-sm text-slate-300 hover:text-teal transition-colors">
                    Politique de confidentialité
                  </Link>
                  <Link href="/conditions-utilisation" className="text-sm text-slate-300 hover:text-teal transition-colors">
                    Conditions générales
                  </Link>
                  <a
                    href="mailto:salomonfoe97@smartlearn-edu.org?subject=Partenariat%20%C3%A9tablissement"
                    className="text-sm text-slate-300 hover:text-teal transition-colors"
                  >
                    Devenir établissement partenaire
                  </a>
                </div>
              </div>

              {/* Ligne mentions légales */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-xs text-slate-500">
                <div>
                  © 2026 SmartLearn. Tous droits réservés. Propulsé par Salomon FOE, enseignant.
                </div>
                <div className="text-slate-600">
                  Fait à Douala 🇨🇲
                </div>
              </div>
            </div>
          </footer>

        </NextAuthProvider>
      </body>
    </html>
  );
}
