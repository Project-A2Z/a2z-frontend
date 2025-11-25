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

// ✅ FIXED: Removed localStorage saves - this runs on SERVER where localStorage doesn't exist
async function loginWithBackend(accessToken: string, provider: 'google' | 'facebook'): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    console.log('🔄 [NextAuth] Calling backend with access token...');
    console.log('🔑 [NextAuth] Provider:', provider);
    console.log('🔑 [NextAuth] Token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    // Call your socialLogin function
    const response = await socialLogin({ 
      idToken: accessToken, 
      provider 
    });

    console.log('📥 [NextAuth] Backend response:', response);

    if (response.status === 'success') {
      console.log('✅ [NextAuth] Backend login successful');
      
      // ✅ FIXED: Just return the data - localStorage saves will happen on CLIENT side
      // Don't try to save to localStorage here - it doesn't exist on the server!
      
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile, user, trigger }) {
      console.log('🎯 [NextAuth JWT Callback] Starting...');
      console.log('🔍 [NextAuth] Trigger:', trigger);
      console.log('🔍 [NextAuth] Has account:', !!account);
      console.log('🔍 [NextAuth] Has profile:', !!profile);
      console.log('🔍 [NextAuth] Has user:', !!user);
      
      // This runs right after OAuth provider returns
      if (account) {
        console.log('🔑 [NextAuth] New OAuth login detected');
        console.log('🔑 [NextAuth] Provider:', account.provider);
        console.log('🔑 [NextAuth] Account object:', {
          provider: account.provider,
          type: account.type,
          hasAccessToken: !!account.access_token,
          hasIdToken: !!account.id_token,
          accessToken: account.access_token ? account.access_token.substring(0, 30) + '...' : null,
          userId: account.providerAccountId
        });
        
        if (profile) {
          console.log('👤 [NextAuth] Profile:', {
            email: profile.email,
            name: profile.name,
            id: (profile as any).id
          });
        }
        
        // Store OAuth tokens
        token.provider = account.provider;
        
        // For Facebook, use access_token
        // For Google, prefer id_token but fallback to access_token
        let tokenToSend = account.access_token;
        
        if (account.provider === 'google' && account.id_token) {
          tokenToSend = account.id_token;
          console.log('🔑 [NextAuth] Using Google ID token');
        } else {
          console.log('🔑 [NextAuth] Using access token');
        }
        
        token.accessToken = tokenToSend;
        
        // Call your backend with the token
        console.log('📞 [NextAuth] Calling backend...');
        const backendResult = await loginWithBackend(
          tokenToSend!,
          account.provider as 'google' | 'facebook'
        );
        
        if (backendResult.success) {
          // Store backend JWT token and user data in the session
          token.backendToken = backendResult.token;
          token.backendUser = backendResult.user;
          
          console.log('✅ [NextAuth] Backend JWT stored in token');
          console.log('✅ [NextAuth] Backend user stored in token');
          console.log('✅ [NextAuth] User email:', backendResult.user?.email);
        } else {
          console.error('❌ [NextAuth] Backend authentication failed:', backendResult.error);
          token.error = backendResult.error;
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      console.log('🔄 [NextAuth Session Callback] Building session...');
      
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      session.backendToken = token.backendToken as string;
      
      // Add backend user data to session
      if (token.backendUser && session.user) {
        session.user.backendUser = token.backendUser;
        console.log('✅ [NextAuth] Backend user added to session');
        console.log('👤 [NextAuth] Backend user email:', token.backendUser?.email);
      }
      
      // ✅ ADDED: Pass error to session if exists
      if (token.error) {
        (session as any).error = token.error;
      }
      
      console.log('✅ [NextAuth] Session built:', {
        hasBackendToken: !!session.backendToken,
        hasBackendUser: !!session.user?.backendUser,
        provider: session.provider
      });
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      console.log('🔄 [NextAuth Redirect Callback]');
      console.log('📍 [NextAuth] URL:', url);
      console.log('📍 [NextAuth] Base URL:', baseUrl);
      
      // ✅ FIXED: Redirect to /login so client-side can save to localStorage
      const redirectUrl = baseUrl + '/login';
      console.log('✅ [NextAuth] Redirecting to:', redirectUrl);
      return redirectUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };