"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoSection from "@/components/pages/AuthPages/ForgetPasswordPage/sections/LogoSection/Logo";
import InstructionSection from "@/components/pages/AuthPages/ForgetPasswordPage/sections/InstructionSection/InstructionSection";
import NextButtonSection from "@/components/pages/AuthPages/ForgetPasswordPage/sections/NextButtonSection/NextButtonSection";
import InputsFieldsSection from "@/components/pages/AuthPages/ForgetPasswordPage/sections/InputsFieldsSection/InputsFieldsSection";
import CodeInputSection from "@/components/pages/AuthPages/ActiveCodePage/sections/CodeInputSection/CodeInputSection";
import VerifyButtonSection from "@/components/pages/AuthPages/ActiveCodePage/sections/VerifyButtonSection/VerifyButtonSection";
import ResendTimerSection from "@/components/pages/AuthPages/ActiveCodePage/sections/ResendTimerSection/ResendTimerSection";
import { useTranslations } from "next-intl";

import { getLangQueryParam, getLocale } from "@/services/api/language";

type FormState = { password: string; confirmPassword: string };

export default function ForgetPasswordPage() {
  const router = useRouter();
  const locale = getLocale();
  const langQuery = getLangQueryParam(locale);
  const t = useTranslations("forgetPassword");

  // Steps: 1) get email, 2) enter active code, 3) set new password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const isPwdDisabled = useMemo(() => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return (
      submitting ||
      !formData.password ||
      !formData.confirmPassword ||
      formData.password !== formData.confirmPassword ||
      formData.password.length < 8 ||
      !strongPasswordRegex.test(formData.password)
    );
  }, [formData, submitting]);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (error) setError("");
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(
        `code-${index - 1}`
      ) as HTMLInputElement | null;
      if (prevInput) prevInput.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Step 1 — Send forget-password OTP to email
  const handleNextFromEmail = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!email) {
      setEmailError(t("email.required"));
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(t("email.invalid"));
      return;
    }
    try {
      setSubmitting(true);
      setEmailError("");
      const res = await fetchWithTimeout(
        `https://a2z-backend--dkreq.fly.dev/app/v1/users/forgetPassword?lang=${langQuery}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );
      if (!res.ok) {
        let message = t("email.sendFailed");
        try {
          const data = await res.json();
          if (data?.message) message = data.message as string;
        } catch {}
        throw new Error(message);
      }
      setStep(2);
      setTimeLeft(60);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
    } catch (err: any) {
      setEmailError(
        typeof err?.message === "string" ? err.message : t("verify.unexpectedError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — Verify OTP  ✅ matches: PATCH /users/OTPVerification { email, OTP, type }
  const handleVerify = async () => {
    if (submitting) return;
    const otpValue = code.join("");
    if (otpValue.length !== 6) {
      setError(t("verify.incomplete"));
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const res = await fetchWithTimeout(
        `https://a2z-backend--dkreq.fly.dev/app/v1/users/OTPVerification${langQuery}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            OTP: otpValue,         // ← capital OTP as required by the API
            type: "passwordReset", // ← exact enum value from the docs
          }),
        }
      );
      if (!res.ok) {
        let message = t("verify.failed");
        try {
          const data = await res.json();
          if (data?.message) message = data.message as string;
        } catch {}
        throw new Error(message);
      }
      setStep(3);
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : t("verify.unexpectedError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — Resend OTP
  const handleResend = async () => {
    if (!email) return;
    try {
      setSubmitting(true);
      setError("");
      const res = await fetchWithTimeout(
        `https://a2z-backend--dkreq.fly.dev/app/v1/users/OTPResend${langQuery}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: email.trim(), type: "passwordReset" }),
        }
      );
      if (!res.ok) {
        let message = t("resend.failed");
        try {
          const data = await res.json();
          if (data?.message) message = data.message as string;
        } catch {}
        throw new Error(message);
      }
      setCode(["", "", "", "", "", ""]);
      setTimeLeft(60);
      setCanResend(false);
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : t("verify.unexpectedError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Step 3 — Reset password
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isPwdDisabled) return;
    try {
      setSubmitting(true);
      setError("");
      const res = await fetchWithTimeout(
        "https://a2z-backend--dkreq.fly.dev/app/v1/users/ResetPassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            Newpassword: formData.password,
          }),
        }
      );
      if (!res.ok) {
        let message = t("resetPassword.failed");
        try {
          const data = await res.json();
          if (data?.message) message = data.message as string;
        } catch {}
        throw new Error(message);
      }
      router.push("/login");
    } catch (err: any) {
      setError(
        typeof err?.message === "string" ? err.message : t("verify.unexpectedError")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[95%] xs:max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[850px] min-h-[280px] xs:min-h-[300px] sm:min-h-[350px] md:min-h-[380px] lg:min-h-[400px] rounded-[16px] xs:rounded-[20px] sm:rounded-[22px] lg:rounded-[24px] gap-3 xs:gap-4 sm:gap-6 lg:gap-8 p-3 xs:p-4 sm:p-5 lg:p-6 bg-card backdrop-blur-sm shadow-lg border border-black16 mx-2 xs:mx-4 sm:mx-6 lg:mx-auto">
      <div className="flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-4 w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[368px] min-h-[80px] xs:min-h-[90px] sm:min-h-[100px] lg:min-h-[124px]">
        <LogoSection />
        <InstructionSection title={t("title")} />
      </div>

      {step === 1 ? (
        <div className="w-full max-w-[420px]">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-black87 mb-2"
          >
            {t("email.label")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder={t("email.placeholder")}
            className="w-full rounded-lg border border-black16 bg-white px-3 py-2 text-black87 placeholder-black60 focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="email"
            inputMode="email"
            dir={t("dir") as string}
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
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <VerifyButtonSection
            onVerify={handleVerify}
            isDisabled={code.some((c) => !c) || submitting}
            loadingText={t("submit.loading")}
            confirmationText={t("submit.default")}
          />
          <ResendTimerSection
            timeLeft={timeLeft}
            onResend={handleResend}
            canResend={canResend}
            formatTime={formatTime}
            loadingText={t("submit.resend.loading")}
            confirmationText={t("submit.resend.button")}
            resendText={t("submit.resend.label")}
            timerText={t("submit.resend.timer")}
          />
        </>
      ) : (
        <>
          <InputsFieldsSection
            formData={formData}
            onInputChange={handleInputChange}
            error={error}
          />
          <NextButtonSection onClick={handleSubmit} disabled={isPwdDisabled} />
        </>
      )}
    </div>
  );
}