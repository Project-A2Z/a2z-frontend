"use client";
import "./globals.css";
import AppShell from "@/components/Layout/AppShell";
import { FavoritesProvider } from "@/services/favorites/FavoritesContext";
import { SessionProvider } from "next-auth/react";
import GoogleTranslate from "@/components/Layout/Translator/GoogleTranslator";
import { AlertProvider } from "@/components/providers/AlertProvider"; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased" suppressHydrationWarning={true}>
        <GoogleTranslate pageLanguage="ar" />
        <SessionProvider>
          <FavoritesProvider>
            {/* 👇 Wrap the app shell with AlertProvider */}
            <AlertProvider>
              <AppShell>
                {children}
              </AppShell>
            </AlertProvider>
          </FavoritesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
