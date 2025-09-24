import React from 'react';
import { Button } from '@/components/UI/Buttons';

interface ResendTimerSectionProps {
  timeLeft: number;
  onResend: () => void;
  canResend: boolean;
  isLoading?: boolean;
  formatTime: (seconds: number) => string;
}

const ResendTimerSection: React.FC<ResendTimerSectionProps> = ({ 
  timeLeft, 
  onResend, 
  canResend, 
  isLoading = false,
  formatTime 
}) => {
  return (
    <div className="text-center space-y-2">
      {!canResend ? (
        <p className="text-gray-600 text-sm">
          إعادة الإرسال متاحة خلال: <span className="font-mono font-bold text-primary-600">{formatTime(timeLeft)}</span>
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">
            لم تتلق الرمز؟
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onResend}
            disabled={isLoading}
            className="text-primary-600 border-primary-600 hover:bg-primary-50"
          >
            {isLoading ? 'جاري الإرسال...' : 'إعادة الإرسال'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ResendTimerSection);