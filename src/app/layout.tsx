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
          <footer className="bg-navy border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto">
              {/* Ligne principale */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <div className="flex flex-col gap-3">
                  <Logo variant="full" theme="dark" size={44} />
                  <p className="text-sm text-slate-400 max-w-md">
                    Plateforme éducative fédérée. Cameroun, Afrique francophone.
                  </p>
                </div>

                <nav className="flex flex-col md:flex-row gap-3 md:gap-8 text-sm font-medium text-slate-300">
                  <Link href="/catalogue" className="hover:text-teal transition-colors">
                    Catalogue
                  </Link>
                  <Link href="/affiliation" className="hover:text-teal transition-colors">
                    Programme Ambassadeur
                  </Link>
                  <Link href="/le-fondateur" className="hover:text-teal transition-colors">
                    Le fondateur
                  </Link>
                  <Link href="mailto:salomonfoe97@smartlearn-edu.org" className="hover:text-teal transition-colors">
                    Contact
                  </Link>
                </nav>
              </div>

              {/* Ligne mentions légales */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-xs text-slate-500">
                <div>
                  © 2026 SmartLearn. Tous droits réservés. Propulsé par Salomon FOE, enseignant.
                </div>
                <div className="flex gap-5">
                  <Link href="/politique-confidentialite" className="hover:text-slate-300 transition-colors">
                    Confidentialité
                  </Link>
                  <Link href="/conditions-utilisation" className="hover:text-slate-300 transition-colors">
                    CGU
                  </Link>
                </div>
              </div>
            </div>
          </footer>

        </NextAuthProvider>
      </body>
    </html>
  );
}
