import { Button } from '@/components/UI/Buttons';
import React from 'react';


interface ResendTimerSectionProps {
    timeLeft: number;
    canResend: boolean;
    onResend: () => void;
}

const ResendTimerSection: React.FC<ResendTimerSectionProps> = ({ 
    timeLeft, 
    canResend, 
    onResend 
}) => {
    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="text-center w-full">
            {!canResend ? (
                <p className="text-black60 text-xs xs:text-sm sm:text-base font-medium leading-tight tracking-normal font-[Beiruti]">
                إعادة ارسال بعد{" "}
                <span className="text-primary font-medium">
                    {formatTime(timeLeft)}
                </span>
                </p>
            ) : (
                <span
                onClick={onResend}
                className="inline-block cursor-pointer text-secondary1 bg-[rgba(247,255,238,0.5)] hover:bg-[rgba(247,255,238,0.7)] 
                            text-xs xs:text-sm sm:text-base font-bold transition-colors duration-200 
                            font-[Beiruti] px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-md xs:rounded-lg"
                >
                إعادة إرسال
                </span>
            )}
        </div>
    );
};

export default React.memo(ResendTimerSection);