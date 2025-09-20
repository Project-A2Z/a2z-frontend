import React from 'react';

interface CodeInputSectionProps {
    code: string[];
    onCodeChange: (index: number, value: string) => void; // Function to handle when a digit changes
    onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void; // Function to handle keyboard events
}


const CodeInputSection: React.FC<CodeInputSectionProps> = ({ 
    code, 
    onCodeChange, 
    onKeyDown 
}) => {
    return (
        <div className="flex justify-center items-center flex-wrap gap-3 xs:gap-4 sm:gap-6 md:gap-8 w-full px-2">
            <label htmlFor="code-0" className="sr-only">
                رمز التحقق - الرقم الأول
            </label>
            {code.map((digit, index) => (
                <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => onCodeChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(index, e)}
                className="text-primary-500 text-[16px] xs:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] 
                            w-[50px] h-[50px] xs:w-[55px] xs:h-[55px] sm:w-[60px] sm:h-[60px] md:w-[65px] md:h-[65px] lg:w-[70px] lg:h-[70px]
                            text-center font-semibold border-2 border-gray-200 rounded-lg xs:rounded-xl 
                            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 
                            transition-all duration-200 
                            [font-family:Beiruti] font-[600] leading-[100%] tracking-[0%]"
                placeholder=""
                aria-label={`رمز التحقق - الرقم ${index + 1}`}
                inputMode="numeric"
                />
            ))}
        </div>
    );
};

export default React.memo(CodeInputSection);