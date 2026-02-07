import React from 'react';
import { Button } from '@/components/UI/Buttons/Button';

interface NextButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
}

const NextButtonSection = ({ onClick, disabled = false }: NextButtonProps) => {
    return (
        <div className="text-center">
            <Button
                variant="primary"
                size="md"
                onClick={onClick}
                state={disabled ? 'disabled' : 'default'}
                disabled={disabled}
                className="w-[100px] h-[36px] xs:w-[110px] xs:h-[38px] sm:w-[120px] sm:h-[40px] md:w-[127px] md:h-[43px] bg-primary hover:bg-primary-600 text-white rounded-[24px] xs:rounded-[28px] sm:rounded-[32px] transition-all duration-200 transform hover:scale-105 active:scale-95 text-[14px] xs:text-[15px] sm:text-[16px] shadow-brand hover:shadow-brand-lg"
            >
                متابعة
            </Button>
        </div>
    );
};

export default React.memo(NextButtonSection);