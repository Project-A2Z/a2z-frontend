import React from 'react';
import { Button } from '@/components/UI/Buttons';

interface VerifyButtonSectionProps {
  onVerify: () => void;
  isDisabled: boolean;
  isLoading?: boolean;
}

const VerifyButtonSection: React.FC<VerifyButtonSectionProps> = ({ 
  onVerify, 
  isDisabled, 
  isLoading = false 
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
        {isLoading ? 'جاري التحقق...' : 'تحقق'}
      </Button>
    </div>
  );
};

export default React.memo(VerifyButtonSection);