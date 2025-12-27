"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './../../../components/UI/Buttons/Button'; 
import Input from './../../../components/UI/Inputs/Input'; 
import Logo from '@/public/logo/logo2.webp.png';
import Background from './../../../components/UI/Background/Background';
import Alert from '@/components/UI/Alert/alert';
import styles from './../auth.module.css';
import { AuthService, AuthError, LoginCredentials, UserStorage } from './../../../services/auth/login';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Clean up OAuth parameters on mount (especially after logout)
  useEffect(() => {
    const hasOAuthParams = searchParams?.get('oauth') || searchParams?.get('error');
    const justLoggedOut = sessionStorage.getItem('user_logged_out');
    
    if (hasOAuthParams || justLoggedOut) {
      console.log('🧹 [LoginForm] Cleaning up OAuth parameters');
      sessionStorage.removeItem('user_logged_out');
      
      // Clean URL without triggering navigation
      if (hasOAuthParams) {
        window.history.replaceState({}, '', '/login');
      }
    }

    // Check for existing valid session
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    const storedExpiry = localStorage.getItem('token_expiry');
    
    if (storedToken && storedUser && storedExpiry && !justLoggedOut) {
      const isValid = Date.now() < parseInt(storedExpiry, 10);
      if (isValid) {
        console.log('✅ [LoginForm] Valid token found, redirecting...');
        router.push('/');
      } else {
        console.log('⚠️ [LoginForm] Token expired, clearing...');
        UserStorage.removeUser();
      }
    }
  }, [router, searchParams]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }
    
    return newErrors;
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await AuthService.login(formData);
      
      if (response.status === 'success') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('authUpdated'));
        }
        router.push('/');
      } else {
        setAlertMessage('يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول.');
        setShowVerificationAlert(true);
      }
    } catch (error) {
      if (error instanceof AuthError) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid() && !isLoading) {
      handleSubmit();
    }
  };
 
  if (status === 'loading') {
    return (
      <>
        <Background />
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <img src={Logo.src} alt="Logo" className={styles.logo} />
              <h2 className={styles.title}>جاري التحميل...</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Background />
      
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <img src={Logo.src} alt="Logo" className={styles.logo} />
            <h2 className={styles.title}>تسجيل الدخول</h2>
          </div>

          <div className={styles.form} onKeyPress={handleKeyPress}>
            {errors.general && (
              <div className={styles.errorMessage}>
                <p className={styles.errorText}>{errors.general}</p>
              </div>
            )}

            <div className={styles.inputGroup}>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="البريد الإلكتروني"
                error={!!errors.email}
                disabled={isLoading}
                className={styles.Input}
              />
              {errors.email && (
                <p className={styles.errorText}>{errors.email}</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="كلمة المرور"
                error={!!errors.password}
                disabled={isLoading}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconPosition="left"
                className={styles.Input}
              />
              {errors.password && (
                <p className={styles.errorText}>{errors.password}</p>
              )}
            </div>

            <div className={styles.forgotPasswordSection}>
              <button 
                type="button"
                className={styles.forgotPasswordLink}
                onClick={() => router.push('/active-code')}
                disabled={isLoading}
              >
                هل نسيت كلمة المرور؟
              </button>
            </div>

            <div className={styles.submitButtonWrapper}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} ${
                  isFormValid() ? styles.submitButtonValid : styles.submitButtonInvalid
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </div>

            <div className={styles.socialLoginSection}>
              <div className={styles.registerSection}>
                <p className={styles.registerText}>
                  ليس لديك حساب؟{' '}
                  <button 
                    type="button"
                    className={styles.registerLink}
                    onClick={() => router.push('/register')}
                    disabled={isLoading}
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              </div>

              {/* Social login buttons are disabled */}
              {/* Uncomment to re-enable social login */}
              {/* 
              <div className={styles.socialButtons}>
                <button 
                  type="button"
                  className={styles.socialButton}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  title="تسجيل الدخول باستخدام Google"
                  aria-label="تسجيل الدخول باستخدام Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  className={styles.socialButton}
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  title="تسجيل الدخول باستخدام Facebook"
                  aria-label="تسجيل الدخول باستخدام Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
              */}
            </div>
          </div>
        </div>
      </div>

      {showVerificationAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowVerificationAlert(false)}
          buttons={[
            { 
              label: 'حسناً', 
              onClick: () => setShowVerificationAlert(false), 
              variant: 'primary' 
            }
          ]}
          type="info"
        />
      )}

      {showErrorAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowErrorAlert(false)}
          buttons={[
            { 
              label: 'إغلاق', 
              onClick: () => setShowErrorAlert(false), 
              variant: 'danger' 
            }
          ]}
          type="error"
        />
      )}
    </>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <>
        <Background />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>جاري التحميل...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    }>
      <LoginFormContent />
    </Suspense>
  );
}