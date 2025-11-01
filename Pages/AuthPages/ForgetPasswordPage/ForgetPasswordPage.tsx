"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoSection from './sections/LogoSection/Logo';
import InstructionSection from './sections/InstructionSection/InstructionSection';
import NextButtonSection from './sections/NextButtonSection/NextButtonSection';
import InputsFieldsSection from './sections/InputsFieldsSection/InputsFieldsSection';
import CodeInputSection from '../ActiveCodePage/sections/CodeInputSection/CodeInputSection';
import VerifyButtonSection from '../ActiveCodePage/sections/VerifyButtonSection/VerifyButtonSection';
import ResendTimerSection from '../ActiveCodePage/sections/ResendTimerSection/ResendTimerSection';

type FormState = { password: string; confirmPassword: string };

export default function ForgetPasswordPage() {
  const router = useRouter();
  // Steps: 1) get email, 2) enter active code, 3) set new password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper: fetch with timeout to avoid hanging requests
  const fetchWithTimeout = async (
    input: RequestInfo | URL,
    init?: RequestInit,
    timeoutMs = 15000
  ): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...(init || {}), signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [step, timeLeft]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const isPwdDisabled = useMemo(() => {
    // Allow common special characters including '#'
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return (
      submitting ||
      !formData.password ||
      !formData.confirmPassword ||
      formData.password !== formData.confirmPassword ||
      formData.password.length < 8 ||
      !strongPasswordRegex.test(formData.password)
    );
  }, [formData, submitting]);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (error) setError('');
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement | null;
      if (prevInput) prevInput.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (submitting) return;
    const normal = code.join('');
    const emailTrimmed = email.trim();
    if (normal.length !== 6) {
      setError('يرجى إدخال الرمز الكامل (6 أرقام)');
      return;
    }
    const reversed = [...code].reverse().join('');
    try {
      setSubmitting(true);
      setError('');
      // Try multiple payload variants to match backend expectations
      const typeVariants = ['passwordReset', 'resetPassword', 'PasswordReset', 'Passwordreset'];
      const variants: Array<Record<string, any>> = [];
      for (const t of typeVariants) {
        variants.push(
          { email: emailTrimmed, otp: normal, type: t },
          { email: emailTrimmed, otp: reversed, type: t },
          { email: emailTrimmed, OTP: normal, type: t },
          { email: emailTrimmed, OTP: reversed, type: t },
          { email: emailTrimmed, code: normal, type: t },
          { email: emailTrimmed, code: reversed, type: t },
          { email: emailTrimmed, verificationCode: normal, type: t },
          { email: emailTrimmed, verificationCode: reversed, type: t },
          { email: emailTrimmed, otpCode: normal, type: t },
          { email: emailTrimmed, otpCode: reversed, type: t },
          { email: emailTrimmed, otp: Number(normal), type: t },
          { email: emailTrimmed, otp: Number(reversed), type: t },
          { email: emailTrimmed, otp: normal, Type: t },
          { email: emailTrimmed, OTP: normal, Type: t },
        );
      }

      let success = false;
      let lastErrorMessage = 'فشل التحقق من الرمز. تأكد من ترتيب الأرقام من اليسار إلى اليمين.';
      for (const body of variants) {
        const res = await fetchWithTimeout('https://a2z-backend.fly.dev/app/v1/users/OTPVerification?lang=en', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) { success = true; break; }
        try { const data = await res.json(); if (data?.message) lastErrorMessage = data.message as string; console.warn('[OTPVerification] attempt failed with body:', body, 'response:', data); } catch (e) { console.warn('[OTPVerification] attempt failed and response not JSON. Body:', body); }
      }
      if (!success) throw new Error(lastErrorMessage);
      setStep(3);
    } catch (err: any) {
      setError(typeof err?.message === 'string' ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    const emailTrimmed = email.trim();
    try {
      setSubmitting(true);
      setError('');
      const res = await fetchWithTimeout('https://a2z-backend.fly.dev/app/v1/users/OTPResend', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, type: 'passwordReset' })
      });
      if (!res.ok) {
        let message = 'فشل إرسال الرمز. حاول مرة أخرى.';
        try { const data = await res.json(); if (data?.message) message = data.message as string; console.warn('OTPResend error:', data); } catch {}
        throw new Error(message);
      }
      setCode(['', '', '', '', '', '']);
      setTimeLeft(60);
      setCanResend(false);
    } catch (err: any) {
      setError(typeof err?.message === 'string' ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextFromEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email) {
      setEmailError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('بريد إلكتروني غير صالح');
      return;
    }
    try {
      setSubmitting(true);
      setEmailError('');
      const emailTrimmed = email.trim();
      const res = await fetchWithTimeout('https://a2z-backend.fly.dev/app/v1/users/forgetPassword?lang=en', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed })
      });
      if (!res.ok) {
        let message = 'تعذر إرسال رمز التحقق.';
        try { const data = await res.json(); if (data?.message) message = data.message as string; } catch {}
        throw new Error(message);
      }
      setStep(2);
      setTimeLeft(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setEmailError(typeof err?.message === 'string' ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isPwdDisabled) return;
    try {
      setSubmitting(true);
      setError('');
      const emailTrimmed = email.trim();
      const res = await fetchWithTimeout('https://a2z-backend.fly.dev/app/v1/users/ResetPassword?lang=en', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: emailTrimmed, Newpassword: formData.password })
      });
      if (!res.ok) {
        let message = 'تعذر إعادة تعيين كلمة المرور';
        try { const data = await res.json(); if (data?.message) message = data.message as string; console.warn('ResetPassword error:', data); } catch {}
        throw new Error(message);
      }
      router.push('/login');
    } catch (err: any) {
      setError(typeof err?.message === 'string' ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[95%] xs:max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[850px] min-h-[280px] xs:min-h-[300px] sm:min-h-[350px] md:min-h-[380px] lg:min-h-[400px] rounded-[16px] xs:rounded-[20px] sm:rounded-[22px] lg:rounded-[24px] gap-3 xs:gap-4 sm:gap-6 lg:gap-8 p-3 xs:p-4 sm:p-5 lg:p-6 bg-card  backdrop-blur-sm shadow-lg border border-black16 mx-2 xs:mx-4 sm:mx-6 lg:mx-auto">
      <div className="flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-4 w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[368px] min-h-[80px] xs:min-h-[90px] sm:min-h-[100px] lg:min-h-[124px]">
        <LogoSection />
        <InstructionSection />
      </div>
      {step === 1 ? (
        <div className="w-full max-w-[420px]">
          <label htmlFor="email" className="block text-sm font-medium text-black87 mb-2">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            placeholder="example@mail.com"
            className="w-full rounded-lg border border-black16 bg-white px-3 py-2 text-black87 placeholder-black60 focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="email"
            inputMode="email"
          />
          {emailError && (
            <p className="mt-2 text-sm text-red-600">{emailError}</p>
          )}
          <div className="mt-4">
            <NextButtonSection
              onClick={handleNextFromEmail}
              disabled={submitting || !email}
            />
          </div>
        </div>
      ) : step === 2 ? (
        <>
          <CodeInputSection
            code={code}
            onCodeChange={handleCodeChange}
            onKeyDown={handleKeyDown}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <VerifyButtonSection
            onVerify={handleVerify}
            isDisabled={code.some((c) => !c) || submitting}
          />
          <ResendTimerSection
            timeLeft={timeLeft}
            onResend={handleResend}
            canResend={canResend}
            formatTime={formatTime}
          />
        </>
      ) : (
        <>
          <InputsFieldsSection 
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
          />
          <NextButtonSection
            onClick={handleSubmit}
            disabled={isPwdDisabled}
          />
        </>
      )}
    </div>
  );
}