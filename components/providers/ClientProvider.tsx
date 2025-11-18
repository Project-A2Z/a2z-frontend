// app/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { FavoritesProvider } from "@/services/favorites/FavoritesContext";
import { AlertProvider } from "@/components/providers/AlertProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <FavoritesProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </FavoritesProvider>
    </SessionProvider>
  );
}