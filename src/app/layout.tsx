import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";
import SessionGuardian from "@/components/SessionGuardian";
import MarketingBanner from "@/components/MarketingBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartlearn-edu.org"),
  title: {
    default: "SmartLearn - Apprendre pour Réussir",
    template: "%s | SmartLearn"
  },
  description: "Rejoignez SmartLearn, la plateforme d'apprentissage en ligne nouvelle génération. Cours vidéo, supports PDF et suivi de progression pour une réussite académique garantie.",
  keywords: ["éducation", "cours en ligne", "apprentissage", "réussite scolaire", "formation vidéo", "SmartLearn"],
  authors: [{ name: "SmartLearn Team" }],
  creator: "SmartLearn",
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
    title: "SmartLearn - Excellence Académique en Ligne",
    description: "Évoluez à votre rythme avec nos formations interactives et nos supports de cours complets.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SmartLearn - Plateforme d'apprentissage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartLearn - Excellence Académique en Ligne",
    description: "La plateforme qui transforme votre apprentissage.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "-1XyO6LCHqiTWdmEj_8xXB5G94PuYItC4nqeVkUM11k",
  },
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
          
          <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-black border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-sm text-gray-500 font-medium">
                © 2026 SmartLearn. Tous droits réservés.
              </div>
              <div className="flex gap-6 text-sm font-bold text-gray-400">
                <a href="/politique-confidentialite" className="hover:text-[var(--primary-gold)] transition-colors">Politique de Confidentialité</a>
                <a href="/conditions-utilisation" className="hover:text-[var(--primary-gold)] transition-colors">Conditions d'Utilisation</a>
                <a href="mailto:foesalomon65@gmail.com" className="hover:text-[var(--primary-gold)] transition-colors">Contact</a>
              </div>
            </div>
          </footer>

        </NextAuthProvider>
      </body>
    </html>
  );
}
