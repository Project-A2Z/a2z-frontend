"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './../../../components/UI/Buttons/Button'; 
import Input from './../../../components/UI/Inputs/Input'; 
import Logo from './../../../public/icons/logo.svg';
import Background from './../../../components/UI/Background/Background'; 
import styles from './../auth.module.css';

export default function RegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phoneNumber?: string;
    } = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب';
    }
    
    return newErrors;
  };

  // Check if all fields are valid
  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password &&
      formData.password.length >= 8 &&
      formData.phoneNumber.trim()
    );
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      // Handle successful form submission
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <>
      {/* Background component - will be behind everything */}
      <Background />
      
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          {/* Logo and Title */}
          <div className={styles.header}>
            <Logo className={styles.logo} />
            <h2 className={styles.title}>إنشاء حساب جديد</h2>
          </div>

          {/* Form */}
          <div className={styles.form}>
            {/* First Name and Last Name */}
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="الاسم الأول"
                  error={!!errors.firstName}
                  className={styles.Input}
                />
                {errors.firstName && (
                  <p className={styles.errorText}>{errors.firstName}</p>
                )}
              </div>
              <div className={styles.inputGroup}>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="الاسم الأخير"
                  error={!!errors.lastName}
                  className={styles.Input}
                />
                {errors.lastName && (
                  <p className={styles.errorText}>{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="البريد الإلكتروني"
                error={!!errors.email}
                className={styles.Input}
              />
              {errors.email && (
                <p className={styles.errorText}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="كلمة المرور"
                error={!!errors.password}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconPosition="left"
                className={styles.Input}
              />
              {errors.password && (
                <p className={styles.errorText}>{errors.password}</p>
              )}
              {/* Show hint only when password is empty or doesn't meet requirements */}
              {(!formData.password || formData.password.length < 8) && (
                <p className={styles.passwordHint}>
                  يجب أن تحتوي كلمة المرور على الأقل على 8 أحرف وأن تكون فريدة ومعقدة
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className={styles.inputGroup}>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="رقم الهاتف"
                error={!!errors.phoneNumber}
                className={styles.Input}
              />
              {errors.phoneNumber && (
                <p className={styles.errorText}>{errors.phoneNumber}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className={styles.submitButtonWrapper}>
              <Button
                variant="custom"
                fullWidth
                rounded
                size="lg"
                className={`${styles.submitButton} ${
                  isFormValid() ? styles.submitButtonValid : styles.submitButtonInvalid
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid()}
              >
                إنشاء حساب
              </Button>
            </div>

            {/* Login Link */}
            <div className={styles.loginSection}>
              <p className={styles.loginText}>
                هل لديك حساب؟{' '}
                <button 
                  type="button"
                  className={styles.loginLink}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/login');
                  }}
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}