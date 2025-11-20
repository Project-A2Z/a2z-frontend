import React from 'react';
import { Button } from '@/components/UI/Buttons/Button';

interface VerifyButtonSectionProps {
    onVerify: () => void;
    isDisabled: boolean;
}

const VerifyButtonSection: React.FC<VerifyButtonSectionProps> = ({ 
    onVerify, 
    isDisabled 
}) => {
    return (
        <div className="text-center">
            <Button
                onClick={onVerify}
                disabled={isDisabled}
                className="w-[100px] h-[36px] xs:w-[110px] xs:h-[38px] sm:w-[120px] sm:h-[40px] md:w-[127px] md:h-[43px] bg-disabled hover:bg-secondary1 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 xs:py-2.5 sm:py-3 px-4 xs:px-5 sm:px-6 rounded-[24px] xs:rounded-[28px] sm:rounded-[32px] transition-all duration-200 transform hover:scale-105 active:scale-95 text-[14px] xs:text-[15px] sm:text-[16px]"
            >
                تحقق
            </Button>
        </div>
    );
};

export default React.memo(VerifyButtonSection);