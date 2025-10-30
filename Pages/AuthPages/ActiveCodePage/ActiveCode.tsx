"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import { Button } from '@/components/UI/Buttons';
import InstructionSection from './sections/InstructionSection/InstructionSection';
import CodeInputSection from './sections/CodeInputSection/CodeInputSection';
import VerifyButtonSection from './sections/VerifyButtonSection/VerifyButtonSection';
import ResendTimerSection from './sections/ResendTimerSection/ResendTimerSection';
import { resendVerificationCode, getCurrentUser } from '../../../services/auth/register';
import { verifyEmail } from '../../../services/auth/register';
import Background from '@/components/UI/Background/Background';
import styles from './sections/ActiveCode.module.css';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

const ActiveCodePage = () => {
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
    const [emailLoaded, setEmailLoaded] = useState(false);

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
            const storedEmail = localStorage.getItem('userEmail');
            
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
            
            if (error) setError('');
            if (success) setSuccess('');
            
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

        let emailToUse = email?.trim();
        
        if (!emailToUse) {
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
            
            console.log('📧 Backup email found:', emailToUse);
        }

        if (!emailToUse) {
            console.error('❌ No email available for resend');
            setError('لا يمكن إعادة الإرسال. البريد الإلكتروني غير متوفر. يرجى العودة للصفحة السابقة.');
            return;
        }

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
            
            setCode(['', '', '', '', '', '']);
            setTimeLeft(60);
            setCanResend(false);
            
            setSuccess('تم إرسال رمز التحقق الجديد إلى بريدك الإلكتروني');
            
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

    if (!emailLoaded) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.headerSection}>
                <LogoSection />
                <InstructionSection email={email} />
            </div>

            {/* Success Message */}
            {success && (
                <div className={`${styles.messageContainer} ${styles.successMessage}`}>
                    <p className={styles.successText}>{success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className={`${styles.messageContainer} ${styles.errorMessage}`}>
                    <p className={styles.errorText}>{error}</p>
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
                <div className={styles.emailDisplay}>
                    <p className={styles.emailText}>
                        تم الإرسال إلى: <span className={styles.emailValue}>{email}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default React.memo(ActiveCodePage);