import React from 'react';

const InstructionSection = () => {
    return (
        <div className="text-center mb-4 xs:mb-5 sm:mb-6 px-2 xs:px-3 sm:px-4">
            <h2 className="text-[#3E3E3E] text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug tracking-normal [font-family:Beiruti,sans-serif]">
                رجاءاً إدخال رمز التحقق المرسل بالبريد الإلكتروني الخاص بك
            </h2>
        </div>       
    );
};

export default React.memo(InstructionSection);