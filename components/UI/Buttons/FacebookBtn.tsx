import FacebookLogin, { SuccessResponse } from "@greatsumini/react-facebook-login";
import { useState } from "react";
import { socialLogin, AuthError } from "@/services/auth/login";
import { useRouter } from "next/navigation";

interface FacebookBtnProps {
  onSuccess?: (response: SuccessResponse) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
}

const FacebookBtn = ({
  onSuccess: onSuccessProp,
  onError: onErrorProp,
  disabled = false,
  className = ""
}: FacebookBtnProps) => {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; severity: "error" | "success" }>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (response: SuccessResponse) => {
    console.log('✅ Facebook Login Success!', response);
    console.log('🔑 Facebook Access Token:', response.accessToken);
    
    setMessage({ text: "جاري تسجيل الدخول...", severity: "success" });
    setIsLoading(true);

    try {
      // Call your backend social login with Facebook access token
      console.log('📞 Calling backend social login with Facebook token...');
      
      const backendResponse = await socialLogin({
        provider: 'facebook',
        idToken: response.accessToken // Facebook uses accessToken
      });

      console.log('✅ Backend social login successful!', backendResponse);
      
      setMessage({ text: "تم تسجيل الدخول بنجاح", severity: "success" });
      
      // Call parent success callback if provided
      if (onSuccessProp) {
        onSuccessProp(response);
      }

      // Redirect to home page after successful login
      setTimeout(() => {
        router.push('/');
      }, 500);

    } catch (error: any) {
      console.error('❌ Backend social login failed:', error);
      
      let errorMessage = 'فشل تسجيل الدخول عبر Facebook';
      
      if (error instanceof AuthError) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ text: errorMessage, severity: "error" });
      
      // Call parent error callback if provided
      if (onErrorProp) {
        onErrorProp(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFail = (error: any) => {
    console.error('❌ Facebook Login Failed!', error);
    setMessage({ text: "فشل تسجيل الدخول عبر Facebook", severity: "error" });
    
    // Call parent callback if provided
    if (onErrorProp) {
      onErrorProp(error);
    }
  };

  const handleProfileSuccess = (response: any) => {
    console.log('✅ Facebook Get Profile Success!', response);
    console.log('👤 User Profile:', {
      name: response.name,
      email: response.email,
      id: response.id
    });
  };

  return (
    <div className="facebook-login-wrapper">
      <FacebookLogin
        appId="2311992442585820"
        onSuccess={handleSuccess}
        onFail={handleFail}
        onProfileSuccess={handleProfileSuccess}
        // Request additional permissions
        scope="public_profile,email"
        className={className}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          padding: 0,
          cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
          opacity: (disabled || isLoading) ? 0.5 : 1,
        }}
        children={
          isLoading ? (
            // Loading spinner
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid #1877F2',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite'
            }} />
          ) : (
            // Facebook icon
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#1877F2"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          )
        }
      />
      
      {/* Optional: Display message */}
      {message && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: message.severity === 'error' ? '#ef4444' : '#22c55e',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      {/* Add CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FacebookBtn;