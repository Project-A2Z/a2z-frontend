import React from 'react';
import { Button } from '@/components/UI/Buttons';

interface ResendTimerSectionProps {
  timeLeft: number;
  onResend: () => void;
  canResend: boolean;
  isLoading?: boolean;
  formatTime: (seconds: number) => string;
}

const ResendTimerSection: React.FC<ResendTimerSectionProps> = React.memo(({ 
  timeLeft, 
  onResend, 
  canResend, 
  isLoading = false,
  formatTime 
}) => {
  // Ensure formatTime is always a function
  const safeFormatTime = React.useCallback((seconds: number): string => {
    if (typeof formatTime === 'function') {
      return formatTime(seconds);
    }
    // Fallback formatting if formatTime is not provided
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [formatTime]);

  return (
    <div className="text-center space-y-2">
      {canResend ? (
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
      ) : (
        <p className="text-gray-600 text-sm">
          إعادة الإرسال متاحة خلال:{' '}
          <span className="font-mono font-bold text-primary-600">
            {safeFormatTime(timeLeft)}
          </span>
        </p>
      )}
    </div>
  );
});

ResendTimerSection.displayName = 'ResendTimerSection';

export default ResendTimerSection;