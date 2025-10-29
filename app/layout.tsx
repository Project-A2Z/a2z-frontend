// app/layout.tsx
"use client";
import "./globals.css";
import AppShell from "@/components/Layout/AppShell";
import { FavoritesProvider } from "@/services/favorites/FavoritesContext";
import { SessionProvider } from "next-auth/react";
import GoogleTranslate from "@/components/Layout/Translator/GoogleTranslator"; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`antialiased`}
        suppressHydrationWarning={true}
      >
        <GoogleTranslate pageLanguage="ar" />
        <SessionProvider>
          <FavoritesProvider>
            <AppShell>
              {children}
            </AppShell>
          </FavoritesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}