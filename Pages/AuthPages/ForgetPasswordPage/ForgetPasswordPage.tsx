"use client";

import React, { useMemo, useState } from 'react';
import LogoSection from './sections/LogoSection/Logo';
import InstructionSection from './sections/InstructionSection/InstructionSection';
import NextButtonSection from './sections/NextButtonSection/NextButtonSection';
import InputsFieldsSection from './sections/InputsFieldsSection/InputsFieldsSection';
import { resetPassword } from '@/services/auth/authService';

type FormState = { password: string; confirmPassword: string };

export default function ForgetPasswordPage() {
    const [formData, setFormData] = useState<FormState>({
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (field: keyof FormState, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const isDisabled = useMemo(() => {
        return (
            submitting ||
            !formData.password ||
            !formData.confirmPassword ||
            formData.password !== formData.confirmPassword ||
            formData.password.length < 6
        );
    }, [formData, submitting]);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isDisabled) return;
        try {
            setSubmitting(true);
            await resetPassword({ password: formData.password });
            // TODO: navigate or show success toast
        } catch (err) {
            setError((err as Error).message || 'حدث خطأ غير متوقع');
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
            <InputsFieldsSection 
                formData={formData}
                onInputChange={handleInputChange}
                error={error}
            />
            <NextButtonSection
                onClick={handleSubmit}
                disabled={isDisabled}
            />
        </div>
    );
}