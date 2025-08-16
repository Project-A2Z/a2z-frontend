"use client";

import React, { useState, useEffect } from 'react';
import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import { Button } from '@/components/UI/Buttons';
import InstructionSection from './sections/InstructionSection/InstructionSection';
import CodeInputSection from './sections/CodeInputSection/CodeInputSection';
import VerifyButtonSection from './sections/VerifyButtonSection/VerifyButtonSection';
import ResendTimerSection from './sections/ResendTimerSection/ResendTimerSection';

const ActiveCodePage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
    const [canResend, setCanResend] = useState(false);

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
                const nextInput = document.getElementById(`code-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

 
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    
    const handleVerify = () => {
        const fullCode = code.join('');
        if (fullCode.length === 6) {
            console.log('Verifying code:', fullCode);
            // Add your verification logic here
        }
    };

   
    const handleResend = () => {
        setCode(['', '', '', '', '', '']);
        setTimeLeft(60);
        setCanResend(false);
        // Add your resend logic here
    };


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        {/* Verify Button */}
        <VerifyButtonSection
            onVerify={handleVerify}
            isDisabled={code.length !== 6}
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