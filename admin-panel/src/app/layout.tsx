import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustLink Admin | Premium Marketplace Control",
  description: "Console d'administration sécurisée TrustLink pour le commerce Bénin-Nigeria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased selection:bg-accent/30">
        {children}
      </body>
    </html>
  );
}
