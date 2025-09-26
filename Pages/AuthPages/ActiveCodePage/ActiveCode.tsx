"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import { Button } from '@/components/UI/Buttons';
import InstructionSection from './sections/InstructionSection/InstructionSection';
import CodeInputSection from './sections/CodeInputSection/CodeInputSection';
import VerifyButtonSection from './sections/VerifyButtonSection/VerifyButtonSection';
import ResendTimerSection from './sections/ResendTimerSection/ResendTimerSection';
import {  resendVerificationCode, getCurrentUser } from '../../../services/auth/register';
import { verifyEmail } from '../../../services/auth/register';
// import {verfyEmail} from '../../../services/auth/register';


const ActiveCodePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');

    // Get email from URL params or current user
    useEffect(() => {
        const emailParam = searchParams?.get('email');
        const currentUser = getCurrentUser();
        
        if (emailParam) {
            setEmail(emailParam);
        } else if (currentUser?.email) {
            setEmail(currentUser.email);
        } else {
            // If no email found, redirect to registration
            console.log('No email found, redirecting to registration');
            router.push('/register');
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
            
            console.log('✅ Verification successful:', response);
            
            // Show success message
            setSuccess('تم تفعيل الحساب بنجاح! جاري تحويلك...');
            
            // Wait a moment for user to see success message, then redirect
            setTimeout(() => {
                router.push('/login?verified=true');
            }, 2000);
            
        } catch (error: any) {
            console.error('❌ Verification failed:', error);
            
            let errorMessage = 'فشل في التحقق من الرمز. يرجى المحاولة مرة أخرى.';
            
            if (error.message) {
                if (error.message.includes('Invalid') || error.message.includes('invalid')) {
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
            
            // Clear the code on error (except for network errors)
            if (!error.message?.includes('Network')) {
                setCode(['', '', '', '', '', '']);
                
                // Focus first input after a short delay
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
        if (!email.trim()) {
            setError('لا يمكن إعادة الإرسال. البريد الإلكتروني غير متوفر.');
            return;
        }

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            console.log('📤 Resending verification code to:', email);
            
            const response = await resendVerificationCode(email.trim());
            
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

            
        </div>
    );
};

export default React.memo(ActiveCodePage);