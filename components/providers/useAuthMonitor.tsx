// hooks/useAuthMonitor.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  isUserAuthenticated, 
  logoutUser, 
  AuthService 
} from '@/services/auth/login';

interface UseAuthMonitorOptions {
  redirectOnExpiry?: boolean;
  redirectUrl?: string;
  showWarning?: boolean;
  warningThresholdMinutes?: number;
  onTokenExpired?: () => void;
  onTokenExpiringSoon?: (remainingMinutes: number) => void;
}

interface AuthMonitorState {
  isAuthenticated: boolean;
  isTokenExpiringSoon: boolean;
  remainingMinutes: number;
  warningMessage: string | null;
}

/**
 * Hook to monitor authentication status and token expiration
 * Automatically handles logout and redirection when token expires
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, warningMessage } = useAuthMonitor({
 *   redirectOnExpiry: true,
 *   showWarning: true,
 *   onTokenExpired: () => {
 *     toast.error('Session expired. Please login again.');
 *   }
 * });
 * ```
 */
export const useAuthMonitor = (options: UseAuthMonitorOptions = {}) => {
  const {
    redirectOnExpiry = true,
    redirectUrl = '/login',
    showWarning = true,
    warningThresholdMinutes = 5,
    onTokenExpired,
    onTokenExpiringSoon,
  } = options;

  const router = useRouter();
  
  const [authState, setAuthState] = useState<AuthMonitorState>({
    isAuthenticated: false,
    isTokenExpiringSoon: false,
    remainingMinutes: 0,
    warningMessage: null,
  });

  /**
   * Handle token expiration
   */
  const handleTokenExpiry = async () => {
    //console.log('🔒 useAuthMonitor: Token expired, handling logout...');
    
    // Call custom callback if provided
    if (onTokenExpired) {
      onTokenExpired();
    }

    // Update state
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      warningMessage: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    }));

    // Logout user
    try {
      await logoutUser();
    } catch (error) {
      //console.error('❌ Error during logout:', error);
    }

    // Redirect if enabled
    if (redirectOnExpiry) {
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    }
  };

  /**
   * Check authentication status and token validity
   */
  const checkAuth = () => {
    const isAuth = isUserAuthenticated();
    
    if (!isAuth) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isTokenExpiringSoon: false,
        remainingMinutes: 0,
        warningMessage: null,
      }));
      return false;
    }

    const isExpiringSoon = AuthService.isTokenExpiringSoon();
    const remaining = AuthService.getRemainingTime();
    const remainingMinutes = Math.floor(remaining / 60000);

    // Update state
    setAuthState({
      isAuthenticated: true,
      isTokenExpiringSoon: isExpiringSoon,
      remainingMinutes,
      warningMessage: showWarning && isExpiringSoon
        ? `ستنتهي صلاحية الجلسة خلال ${remainingMinutes} دقيقة`
        : null,
    });

    // Call warning callback
    if (isExpiringSoon && onTokenExpiringSoon) {
      onTokenExpiringSoon(remainingMinutes);
    }

    return true;
  };

  /**
   * Initialize auth monitoring on mount
   */
  useEffect(() => {
    // Initial check
    const isAuth = checkAuth();
    
    if (!isAuth && redirectOnExpiry) {
      //console.log('❌ Not authenticated on mount, redirecting...');
      router.push(redirectUrl);
      return;
    }

    // Start token expiration monitoring
    AuthService.startTokenMonitoring(() => {
      handleTokenExpiry();
    });

    // Cleanup on unmount
    return () => {
      AuthService.stopTokenMonitoring();
    };
  }, []);

  /**
   * Listen for token expiration events
   */
  useEffect(() => {
    const handleTokenExpiredEvent = () => {
      //console.log('🔔 Token expiration event received');
      handleTokenExpiry();
    };

    window.addEventListener('tokenExpired', handleTokenExpiredEvent);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiredEvent);
    };
  }, []);

  /**
   * Periodic check for auth status (backup)
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      const isAuth = checkAuth();
      
      if (!isAuth) {
        //console.log('⏰ Periodic check: Token invalid');
        handleTokenExpiry();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  /**
   * Listen for storage changes (logout in another tab)
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data' || e.key === 'auth_token' || e.key === 'token_expiry') {
        //console.log('🔄 Storage changed, checking auth...');
        
        const isAuth = checkAuth();
        
        if (!isAuth && redirectOnExpiry) {
          //console.log('❌ Auth changed in another tab, redirecting...');
          router.push(redirectUrl);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    ...authState,
    checkAuth,
    logout: handleTokenExpiry,
  };
};

/**
 * Simplified hook for pages that just need to protect routes
 * 
 * @example
 * ```tsx
 * const ProtectedPage = () => {
 *   useAuthProtection(); // Auto-redirects if not authenticated
 *   
 *   return <div>Protected content</div>;
 * };
 * ```
 */
export const useAuthProtection = (redirectUrl: string = '/login') => {
  const { isAuthenticated } = useAuthMonitor({
    redirectOnExpiry: true,
    redirectUrl,
    showWarning: false,
  });

  return { isAuthenticated };
};

/**
 * Hook to get remaining session time with formatting
 * 
 * @example
 * ```tsx
 * const { formattedTime, isExpiringSoon } = useSessionTimer();
 * return <div>Session expires in: {formattedTime}</div>;
 * ```
 */
export const useSessionTimer = () => {
  const [sessionInfo, setSessionInfo] = useState({
    remainingMs: 0,
    formattedTime: '',
    isExpiringSoon: false,
  });

  useEffect(() => {
    const updateTimer = () => {
      if (!isUserAuthenticated()) {
        setSessionInfo({
          remainingMs: 0,
          formattedTime: 'منتهية',
          isExpiringSoon: false,
        });
        return;
      }

      const remaining = AuthService.getRemainingTime ();
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      let formatted = '';
      if (hours > 0) {
        formatted = `${hours}س ${minutes}د`;
      } else if (minutes > 0) {
        formatted = `${minutes}د ${seconds}ث`;
      } else {
        formatted = `${seconds}ث`;
      }

      setSessionInfo({
        remainingMs: remaining,
        formattedTime: formatted,
        isExpiringSoon: AuthService.isTokenExpiringSoon(),
      });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return sessionInfo;
};

export default useAuthMonitor;