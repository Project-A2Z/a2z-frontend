// app/api/auth/[...nextauth]/auth-options.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { socialLogin, UserStorage } from "@/services/auth/login";

// Function to send token to your backend and save auth data
async function loginWithBackend(accessToken: string, provider: 'google' | 'facebook'): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    // //console.log('🔄 [NextAuth] Calling backend with access token...');
    // //console.log('🔑 [NextAuth] Provider:', provider);
    // //console.log('🔑 [NextAuth] Token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    const response = await socialLogin({ 
      idToken: accessToken, 
      provider 
    });

    // //console.log('📥 [NextAuth] Backend response:', response);

    if (response.status === 'success') {
      //console.log('✅ [NextAuth] Backend login successful');
      
      if (response.data && response.data.user && response.data.token) {
        //console.log('💾 [NextAuth] Saving user data and token to localStorage...');
        
        UserStorage.saveUser(response.data.user);
        //console.log('✅ [NextAuth] User data saved:', response.data.user.email);
        
        UserStorage.saveToken(response.data.token);
        //console.log('✅ [NextAuth] Auth token saved');
        
        if (response.data.refreshToken) {
          UserStorage.saveRefreshToken(response.data.refreshToken);
          //console.log('✅ [NextAuth] Refresh token saved');
        }
        
        //console.log('✅ [NextAuth] All authentication data saved successfully');
      } else {
        console.warn('⚠️ [NextAuth] Missing user or token in backend response');
      }
      
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

export const authOptions: NextAuthOptions = {
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
    signOut: "/login",
    verifyRequest: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account, profile, user, trigger }) {
      //console.log('🎯 [NextAuth JWT Callback] Starting...');
      
      if (account) {
        //console.log('🔑 [NextAuth] New OAuth login detected');
        //console.log('🔑 [NextAuth] Provider:', account.provider);
        
        token.provider = account.provider;
        
        let tokenToSend = account.access_token;
        
        if (account.provider === 'google' && account.id_token) {
          tokenToSend = account.id_token;
          //console.log('🔑 [NextAuth] Using Google ID token');
        }
        
        token.accessToken = tokenToSend;
        
        const backendResult = await loginWithBackend(
          tokenToSend!,
          account.provider as 'google' | 'facebook'
        );
        
        if (backendResult.success) {
          token.backendToken = backendResult.token;
          token.backendUser = backendResult.user;
          //console.log('✅ [NextAuth] Backend JWT stored in token');
        } else {
          console.error('❌ [NextAuth] Backend authentication failed:', backendResult.error);
          token.error = backendResult.error;
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      //console.log('🔄 [NextAuth Session Callback] Building session...');
      
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      session.backendToken = token.backendToken as string;
      
      if (token.backendUser && session.user) {
        session.user.backendUser = token.backendUser;
        //console.log('✅ [NextAuth] Backend user added to session');
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      //console.log('🔄 [NextAuth Redirect Callback]');
      const redirectUrl = baseUrl + '/';
      //console.log('✅ [NextAuth] Redirecting to:', redirectUrl);
      return redirectUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};