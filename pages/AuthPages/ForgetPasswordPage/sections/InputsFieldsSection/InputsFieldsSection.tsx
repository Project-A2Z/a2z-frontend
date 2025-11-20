import Input from '@/components/UI/Inputs/Input';
import React, { useState } from 'react';
import { Eye, EyeClosed } from 'lucide-react';

interface InputsFieldsSectionProps {
    formData?: { password: string; confirmPassword: string };
    onInputChange?: (field: 'password' | 'confirmPassword', value: string) => void;
    error?: string;
}

export default function InputsFieldsSection({ 
    formData = { password: '', confirmPassword: '' }, 
    onInputChange = () => {}, 
    error = '' 
}: InputsFieldsSectionProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Safely handle input changes
    const handleInputChange = (field: 'password' | 'confirmPassword', value: string) => {
        if (onInputChange) {
            onInputChange(field, value);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 w-full max-w-[320px] xs:max-w-[340px] sm:max-w-[368px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[802px] mx-auto">
            {/* New Password Input */}
            <Input
                type={showPassword ? "text" : "password"}
                value={formData?.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="ادخل كلمة المرور الجديدة"
                icon={showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                iconPosition="left"
                onIconClick={() => setShowPassword(!showPassword)}
                dir="rtl"
                error={!!error}
                className="w-full h-[44px] rounded-[32px] border border-[#D6D6D6] bg-card text-right px-6 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 tracking-wide"
            />
            
            {/* Confirm Password Input */}
            <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData?.confirmPassword || ''}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="تأكيد كلمة المرور الجديدة"
                icon={showConfirmPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                iconPosition="left"
                onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                dir="rtl"
                error={!!error}
                className="w-full h-[44px] rounded-[32px] border border-[#D6D6D6] bg-card text-right px-6 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 tracking-wide"
            />
            
            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
}