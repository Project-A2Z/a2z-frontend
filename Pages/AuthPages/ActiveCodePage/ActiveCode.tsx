"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
>>>>>>> 27a89a7d70c63156f33cc74f599967b9c0894c0e
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import InstructionSection from './sections/InstructionSection/InstructionSection';
import CodeInputSection from './sections/CodeInputSection/CodeInputSection';
import VerifyButtonSection from './sections/VerifyButtonSection/VerifyButtonSection';
import ResendTimerSection from './sections/ResendTimerSection/ResendTimerSection';
import { resendVerificationCode, getCurrentUser } from '../../../services/auth/register';
import { verifyEmail } from '../../../services/auth/register';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const API_BASE = 'https://a2z-backend.fly.dev/app/v1/users';

const ActiveCodePage = () => {
<<<<<<< HEAD
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined); // Store email from query

  // Sync email from query param when component mounts
  useEffect(() => {
    const queryEmail = router.query?.email as string | undefined;
    if (queryEmail) {
      setEmail(queryEmail);
    } else {
      setError('البريد الإلكتروني غير متوفر');
    }
  }, [router.query]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const callApi = async (url: string, options: RequestInit) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('يرجى إدخال الرمز الكامل (6 أرقام)');
      return;
    }
    if (!email) {
      setError('البريد الإلكتروني غير متوفر');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await callApi(`${API_BASE}/OTPVerification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          OTP: fullCode,
          type: 'EmailVerification' // Adjust type based on your backend requirements
        })
      });
      if (response.status === 'success') {
        router.push(`/forget-password?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.message || 'فشل في التحقق من الرمز');
      }
    } catch (err: any) {
      const errorMessage = err.message || (err.response?.data?.message) || 'حدث خطأ في التحقق من الرمز';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('البريد الإلكتروني غير متوفر');
      return;
    }
    setSubmitting(true);
    try {
      const response = await callApi(`${API_BASE}/OTPResend?lang=en`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: 'EmailVerification' // Adjust type based on your backend requirements
        })
      });
      if (response.status === 'success') {
        setCode(['', '', '', '', '', '']);
        setTimeLeft(60);
        setCanResend(false);
      } else {
        setError(response.message || 'فشل في إعادة إرسال الرمز');
      }
    } catch (err: any) {
      const errorMessage = err.message || (err.response?.data?.message) || 'حدث خطأ في إعادة إرسال الرمز';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[95%] xs:max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[850px] min-h-[280px] xs:min-h-[300px] sm:min-h-[350px] md:min-h-[380px] lg:min-h-[400px] rounded-[16px] xs:rounded-[20px] sm:rounded-[22px] lg:rounded-[24px] gap-3 xs:gap-4 sm:gap-6 lg:gap-8 p-3 xs:p-4 sm:p-5 lg:p-6 bg-card backdrop-blur-sm shadow-lg border border-white/20 mx-2 xs:mx-4 sm:mx-6 lg:mx-auto"
      style={{
        backdropFilter: "blur(4px)"
      }}
    >
      {/* Logo and Instruction Section */}
      <div className="flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-4 w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[368px] min-h-[80px] xs:min-h-[90px] sm:min-h-[100px] lg:min-h-[124px]">
        {/* Logo Section */}
        <LogoSection />

        {/* Instruction Text */}
        <InstructionSection />
      </div>

      {/* Code Input Fields */}
      <CodeInputSection
        code={code}
        onCodeChange={handleCodeChange}
        onKeyDown={handleKeyDown}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Verify Button */}
      <VerifyButtonSection
        onVerify={handleVerify}
        isDisabled={code.join('').length !== 6 || submitting}
      />

      {/* Resend Timer */}
      <ResendTimerSection
        timeLeft={timeLeft}
        onResend={handleResend}
        canResend={canResend}
      />
    </div>
  );
=======
    const router = useRouter();
    const searchParams = useSearchParams();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');
    const [emailLoaded, setEmailLoaded] = useState(false); // Track if email is loaded

    // Get email from URL params or current user
    useEffect(() => {
        console.log('🔍 Checking for email...');
        console.log('📧 URL params:', searchParams?.toString());
        
        const emailParam = searchParams?.get('email');
        console.log('📧 Email from URL:', emailParam);
        
        const currentUser = getCurrentUser();
        console.log('👤 Current user:', currentUser);
        
        if (emailParam) {
            console.log('✅ Using email from URL params:', emailParam);
            setEmail(emailParam);
            setEmailLoaded(true);
        } else if (currentUser?.email) {
            console.log('✅ Using email from current user:', currentUser.email);
            setEmail(currentUser.email);
            setEmailLoaded(true);
        } else {
            // Try to get from localStorage as backup
            const storedUser = localStorage.getItem('user');
            const storedEmail = localStorage.getItem('userEmail'); // If you store email separately
            
            console.log('💾 Stored user:', storedUser);
            console.log('💾 Stored email:', storedEmail);
            
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser?.email) {
                        console.log('✅ Using email from stored user:', parsedUser.email);
                        setEmail(parsedUser.email);
                        setEmailLoaded(true);
                        return;
                    }
                } catch (e) {
                    console.error('❌ Error parsing stored user:', e);
                }
            }
            
            if (storedEmail) {
                console.log('✅ Using stored email:', storedEmail);
                setEmail(storedEmail);
                setEmailLoaded(true);
            } else {
                console.log('❌ No email found, redirecting to registration');
                setEmailLoaded(true);
                // Small delay to prevent immediate redirect during SSR
                setTimeout(() => {
                    router.push('/register');
                }, 100);
            }
        }
    }, [searchParams, router]);

    // Timer countdown effect
    useEffect(() => {
        if (timeLeft > 0 && !canResend) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft <= 0) {
            setCanResend(true);
        }
    }, [timeLeft, canResend]);

    // Clear messages after some time
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleCodeChange = useCallback((index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            
            // Clear messages when user starts typing
            if (error) setError('');
            if (success) setSuccess('');
            
            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }
        }
    }, [code, error, success]);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) {
                (prevInput as HTMLInputElement).focus();
            }
        }
    }, [code]);

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('يرجى إدخال الرمز المكون من 6 أرقام');
            return;
        }

        if (!email.trim()) {
            setError('البريد الإلكتروني غير متوفر. يرجى المحاولة مرة أخرى.');
            return;
        }

        setIsVerifying(true);
        setError('');
        setSuccess('');

        try {
            console.log('🔐 Verifying code:', fullCode);
            console.log('📧 For email:', email);

            const response = await verifyEmail(fullCode, email.trim());
            
            console.log('📄 Full verification response:', response);
            
            if (response.success === true || (response?.status === 'success')) {
                console.log('✅ Verification successful:', response);
                
                setSuccess('تم تفعيل الحساب بنجاح! جاري تحويلك...');
                
                setTimeout(() => {
                    router.push('/login?verified=true');
                }, 2000);
                
            } else {
                console.log('❌ Verification failed - response indicates failure');
                console.log('📄 Failure response:', response);
                
                let errorMessage = 'فشل في التحقق من الرمز. يرجى المحاولة مرة أخرى.';
                
                if (response.message) {
                    if (response.message.includes('Invalid') || response.message.includes('invalid')) {
                        errorMessage = 'الرمز غير صحيح. يرجى التحقق من الرمز المدخل.';
                    } else if (response.message.includes('expired') || response.message.includes('not found')) {
                        errorMessage = 'الرمز منتهي الصلاحية أو غير صحيح. يرجى طلب رمز جديد.';
                    } else if (response.message.includes('already verified')) {
                        errorMessage = 'الحساب مفعل بالفعل';
                        setSuccess('الحساب مفعل بالفعل. جاري تحويلك...');
                        setTimeout(() => router.push('/login'), 2000);
                        return;
                    } else {
                        errorMessage = response.message;
                    }
                }
                
                setError(errorMessage);
                
                setCode(['', '', '', '', '', '']);
                setTimeout(() => {
                    const firstInput = document.getElementById('code-0');
                    if (firstInput) {
                        (firstInput as HTMLInputElement).focus();
                    }
                }, 100);
            }
            
        } catch (error: any) {
            console.error('❌ Verification failed with exception:', error);
            
            let errorMessage = 'فشل في التحقق من الرمز. يرجى المحاولة مرة أخرى.';
            
            if (error.message) {
                if (error.message.includes('404')) {
                    errorMessage = 'خطأ في الخدمة. يرجى المحاولة لاحقاً أو التواصل مع الدعم.';
                } else if (error.message.includes('Invalid') || error.message.includes('invalid')) {
                    errorMessage = 'الرمز غير صحيح. يرجى التحقق من الرمز المدخل.';
                } else if (error.message.includes('expired') || error.message.includes('not found')) {
                    errorMessage = 'الرمز منتهي الصلاحية أو غير صحيح. يرجى طلب رمز جديد.';
                } else if (error.message.includes('already verified')) {
                    errorMessage = 'الحساب مفعل بالفعل';
                    setSuccess('الحساب مفعل بالفعل. جاري تحويلك...');
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                } else if (error.message.includes('Network')) {
                    errorMessage = 'خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            setError(errorMessage);
            
            if (!error.message?.includes('Network')) {
                setCode(['', '', '', '', '', '']);
                setTimeout(() => {
                    const firstInput = document.getElementById('code-0');
                    if (firstInput) {
                        (firstInput as HTMLInputElement).focus();
                    }
                }, 100);
            }
            
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        console.log('🔄 Attempting to resend code...');
        console.log('📧 Current email state:', email);
        console.log('📧 Email trimmed:', email?.trim());
        console.log('📧 Email loaded:', emailLoaded);

        // Double-check email availability
        let emailToUse = email?.trim();
        
        if (!emailToUse) {
            // Try to get email again as backup
            const emailParam = searchParams?.get('email');
            const currentUser = getCurrentUser();
            const storedEmail = localStorage.getItem('userEmail');
            const storedUser = localStorage.getItem('user');
            
            emailToUse = email || emailParam || currentUser?.email || storedEmail || '';
            
            if (!emailToUse && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    emailToUse = parsedUser?.email;
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }

            async function example1() {
              try {
                const result = await resendVerificationCode('ahmed@example.com');
                console.log('Success:', result.message);
              } catch (error) {
                if (error instanceof APIError) {
                  console.error(`API Error (${error.status}):`, error.message);
                } else {
                  console.error('Unexpected error:', error);
                }
              }
            }
            
            console.log('📧 Backup email found:', emailToUse);
        }

        if (!emailToUse) {
            console.error('❌ No email available for resend');
            setError('لا يمكن إعادة الإرسال. البريد الإلكتروني غير متوفر. يرجى العودة للصفحة السابقة.');
            return;
        }

        // Update the email state if we found it from backup
        if (emailToUse !== email) {
            setEmail(emailToUse);
        }

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            console.log('📤 Resending verification code to:', emailToUse);
            
            const response = await resendVerificationCode(emailToUse);
            
            console.log('✅ Code resent successfully:', response);
            
            // Reset form state
            setCode(['', '', '', '', '', '']);
            setTimeLeft(60);
            setCanResend(false);
            
            // Show success message
            setSuccess('تم إرسال رمز التحقق الجديد إلى بريدك الإلكتروني');
            
            // Focus first input after a short delay
            setTimeout(() => {
                const firstInput = document.getElementById('code-0');
                if (firstInput) {
                    (firstInput as HTMLInputElement).focus();
                }
            }, 100);
            
        } catch (error: any) {
            console.error('❌ Resend failed:', error);
            
            let errorMessage = 'فشل في إعادة إرسال الرمز. يرجى المحاولة مرة أخرى.';
            
            if (error.message) {
                if (error.message.includes('already verified')) {
                    errorMessage = 'الحساب مفعل بالفعل';
                    setSuccess('الحساب مفعل بالفعل. جاري تحويلك...');
                    setTimeout(() => router.push('/login'), 2000);
                    return;
                } else if (error.message.includes('not found')) {
                    errorMessage = 'البريد الإلكتروني غير موجود في النظام';
                } else if (error.message.includes('Too many requests') || error.message.includes('429')) {
                    errorMessage = 'تم إرسال طلبات كثيرة. يرجى الانتظار قبل المحاولة مرة أخرى.';
                } else if (error.message.includes('Network')) {
                    errorMessage = 'خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            setError(errorMessage);
            
        } finally {
            setIsResending(false);
        }
    };

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Don't render until email is loaded
    if (!emailLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-[95%] xs:max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[850px] min-h-[280px] xs:min-h-[300px] sm:min-h-[350px] md:min-h-[380px] lg:min-h-[400px] rounded-[16px] xs:rounded-[20px] sm:rounded-[22px] lg:rounded-[24px] gap-3 xs:gap-4 sm:gap-6 lg:gap-8 p-3 xs:p-4 sm:p-5 lg:p-6 bg-card backdrop-blur-sm shadow-lg border border-white/20 mx-2 xs:mx-4 sm:mx-6 lg:mx-auto"
            style={{
                backdropFilter: "blur(4px)"
            }}
        >
            {/* Logo and Instruction Section */}
            <div className="flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-4 w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[368px] min-h-[80px] xs:min-h-[90px] sm:min-h-[100px] lg:min-h-[124px]">
                {/* Logo Section */}
                <LogoSection />

                {/* Instruction Text */}
                <InstructionSection email={email} />
            </div>

            {/* Success Message */}
            {success && (
                <div className="w-full max-w-[400px] p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-center text-sm font-medium">
                        {success}
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="w-full max-w-[400px] p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-center text-sm font-medium">
                        {error}
                    </p>
                </div>
            )}

            {/* Code Input Fields */}
            <CodeInputSection
                code={code}
                onCodeChange={handleCodeChange}
                onKeyDown={handleKeyDown}
            />

            {/* Verify Button */}
            <VerifyButtonSection
                onVerify={handleVerify}
                isDisabled={code.join('').length !== 6 || isVerifying || isResending}
                isLoading={isVerifying}
            />

            {/* Resend Timer */}
            <ResendTimerSection
                timeLeft={timeLeft}
                onResend={handleResend}
                canResend={canResend && !isResending && !isVerifying}
                isLoading={isResending}
                formatTime={formatTime}
            />

            {/* Email Display */}
            {email && (
                <div className="text-center mt-2">
                    <p className="text-sm text-gray-600">
                        تم الإرسال إلى: <span className="font-medium text-primary-600">{email}</span>
                    </p>
                </div>
            )}

            {/* Debug Info (Remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-400 text-center mt-4 p-2 bg-gray-50 rounded">
                    <p>Debug: Email = "{email}", Loaded = {emailLoaded.toString()}</p>
                </div>
            )}
        </div>
    );
>>>>>>> 27a89a7d70c63156f33cc74f599967b9c0894c0e
};

export default React.memo(ActiveCodePage);