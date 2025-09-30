"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import InstructionSection from './sections/InstructionSection/InstructionSection';
import CodeInputSection from './sections/CodeInputSection/CodeInputSection';
import VerifyButtonSection from './sections/VerifyButtonSection/VerifyButtonSection';
import ResendTimerSection from './sections/ResendTimerSection/ResendTimerSection';

const API_BASE = 'https://a2z-backend.fly.dev/app/v1/users';

const ActiveCodePage = () => {
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
};

export default React.memo(ActiveCodePage);