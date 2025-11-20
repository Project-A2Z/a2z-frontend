import React from 'react';

interface InstructionSectionProps {
  step: 1 | 2 | 3;
}

const InstructionSection = ({ step }: InstructionSectionProps) => {
  return (
    <div className="text-center mb-4 xs:mb-5 sm:mb-6 px-2 xs:px-3 sm:px-4">
      <h2 className="text-[#3E3E3E] text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug tracking-normal [font-family:Beiruti,sans-serif]">
        {step === 1 ? 'أدخل بريدك الإلكتروني' : step === 2 ? 'رجاءاً إدخال رمز التحقق المرسل بالبريد الإلكتروني الخاص بك' : 'أدخل كلمة المرور الجديدة'}
      </h2>
    </div>       
  );
};

export default React.memo(InstructionSection);