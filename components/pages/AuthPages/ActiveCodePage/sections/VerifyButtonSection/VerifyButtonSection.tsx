import React from 'react';
import { Button } from '@/components/UI/Buttons';


interface VerifyButtonSectionProps {
  onVerify: () => void;
  isDisabled: boolean;
  isLoading?: boolean;
  loadingText?: string;
  confirmationText?: string;
}

const VerifyButtonSection: React.FC<VerifyButtonSectionProps> = ({ 
  onVerify, 
  isDisabled, 
  isLoading = false ,
  loadingText = '',
  confirmationText = ''
}) => {
  return (
    <div className="w-full max-w-[300px]">
      <Button
        variant="custom"
        fullWidth
        rounded
        size="lg"
        onClick={onVerify}
        disabled={isDisabled || isLoading}
        className={`transition-all duration-200 ${
          isDisabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        {isLoading ? loadingText : confirmationText}
      </Button>
    </div>
  );
};

export default React.memo(VerifyButtonSection);