import React from 'react';

interface InstructionSectionProps {
  email?: string;
}

const InstructionSection: React.FC<InstructionSectionProps> = ({ email }) => {
  return (
    <div className="text-center space-y-2">
      <p className="text-gray-700 text-sm sm:text-base font-medium">
        أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
      </p>
      {email && (
        <p className="text-primary-600 text-xs sm:text-sm font-medium">
          {email}
        </p>
      )}
    </div>
  );
};
export default React.memo(InstructionSection);