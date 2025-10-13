// app/layout.tsx
"use client"; // Add this at the very top

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/Layout/AppShell";
import { FavoritesProvider } from "@/services/favorites/FavoritesContext";
import { SessionProvider } from "next-auth/react";

// ... rest of your code

// Change the component to:
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
        suppressHydrationWarning={true}
      >
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