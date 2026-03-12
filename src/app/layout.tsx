import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";
import SessionGuardian from "@/components/SessionGuardian";
import MarketingBanner from "@/components/MarketingBanner";

export const metadata: Metadata = {
  title: "SmartLearn",
  description: "Plateforme d'apprentissage en ligne",
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
