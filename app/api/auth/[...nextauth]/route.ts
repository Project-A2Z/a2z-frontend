// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "./auth-options";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: string;
    backendToken?: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      backendUser?: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    provider?: string;
    backendToken?: string;
    backendUser?: any;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };