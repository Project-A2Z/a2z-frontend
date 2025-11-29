// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { JWT } from "next-auth/jwt";

import { socialLogin } from "@/services/auth/login";

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

async function loginWithBackend(accessToken: string, provider: 'google' | 'facebook'): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    console.log('🔄 [NextAuth] Calling backend with access token...');
    console.log('🔑 [NextAuth] Provider:', provider);
    
    const response = await socialLogin({ 
      idToken: accessToken, 
      provider 
    });

    console.log('📥 [NextAuth] Backend response:', response);

    if (response.status === 'success') {
      console.log('✅ [NextAuth] Backend login successful');
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user
      };
    } else {
      console.error('❌ [NextAuth] Backend login failed:', response);
      return {
        success: false,
        error: response.message || 'Backend authentication failed'
      };
    }
  } catch (error: any) {
    console.error('❌ [NextAuth] Error calling backend:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to backend'
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
    verifyRequest: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, profile, user, trigger }) {
      console.log('🎯 [NextAuth JWT Callback] Starting...');
      
      try {
        if (account) {
          console.log('🔑 [NextAuth] New OAuth login detected');
          console.log('🔑 [NextAuth] Provider:', account.provider);
          
          token.provider = account.provider;
          
          // Get the appropriate token
          let tokenToSend = account.access_token;
          
          if (account.provider === 'google' && account.id_token) {
            tokenToSend = account.id_token;
            console.log('🔑 [NextAuth] Using Google ID token');
          } else {
            console.log('🔑 [NextAuth] Using access token');
          }
          
          if (!tokenToSend) {
            console.error('❌ [NextAuth] No token available from provider');
            token.error = 'No authentication token received from provider';
            return token;
          }
          
          // DON'T store the OAuth token - we don't need it
          // token.accessToken = tokenToSend;
          
          // Call backend
          console.log('📞 [NextAuth] Calling backend...');
          const backendResult = await loginWithBackend(
            tokenToSend,
            account.provider as 'google' | 'facebook'
          );
          
          if (backendResult.success) {
            token.backendToken = backendResult.token;
            
            // 🔥 CRITICAL: Store ONLY essential user data to keep JWT small
            token.backendUser = {
              id: backendResult.user?.id,
              email: backendResult.user?.email,
              name: backendResult.user?.name,
              phone: backendResult.user?.phone,
              // Add only what you NEED - remove arrays/objects if possible
            };
            
            console.log('✅ [NextAuth] Backend authentication successful');
            console.log('👤 [NextAuth] User ID:', token.backendUser.id);
          } else {
            console.error('❌ [NextAuth] Backend authentication failed:', backendResult.error);
            token.error = backendResult.error || 'Backend authentication failed';
          }
        }
      } catch (error: any) {
        console.error('❌ [NextAuth] JWT callback error:', error);
        token.error = error.message || 'Authentication error occurred';
      }
      
      return token;
    },
    
    async session({ session, token }) {
      console.log('🔄 [NextAuth Session Callback] Building session...');
      
      if (token.provider) {
        session.provider = token.provider as string;
      }
      
      if (token.backendToken) {
        session.backendToken = token.backendToken as string;
        console.log('✅ [NextAuth] Backend token added to session');
      }
      
      // Add backend user data to session
      if (token.backendUser && session.user) {
        session.user.backendUser = token.backendUser;
        console.log('✅ [NextAuth] Backend user added to session');
      }
      
      // Pass error to session if exists
      if (token.error) {
        (session as any).error = token.error;
        console.error('⚠️ [NextAuth] Passing error to session:', token.error);
      }
      
      console.log('📦 [NextAuth] Session ready:', {
        hasBackendToken: !!session.backendToken,
        hasBackendUser: !!session.user?.backendUser,
        hasError: !!(session as any).error,
        userId: session.user?.backendUser?.id
      });
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔄 [NextAuth Redirect Callback]');
      console.log('📍 [NextAuth] URL:', url);
      console.log('📍 [NextAuth] Base URL:', baseUrl);
      
      // If there's an error, redirect to login with error param
      if (url.includes('error=')) {
        return url;
      }
      
      // Redirect to login page for client-side localStorage handling
      return `${baseUrl}/login?oauth=success`;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };