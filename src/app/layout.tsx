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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <MarketingBanner />
        <NextAuthProvider>
          <SessionGuardian />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
