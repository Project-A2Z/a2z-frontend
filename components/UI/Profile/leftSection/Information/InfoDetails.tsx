'use client';

import React, { useState } from 'react';
import { Button } from '../../../Buttons/Button';
import Input from '../../../Inputs/Input';
import styles from './info.module.css';

// Icons (you can replace these with your preferred icon library)
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const AccountForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'mohamedaboelhawey@gmail.com',
    phone: '0123456789'
  });

  const [edit , setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
  newErrors.phone = 'Phone number is required';
} else {
  // Remove all non-digit characters except the + sign
  const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
  
  // Check if phone starts with +201 or 01 and has appropriate length
  const isValidFormat = /^(\+201|01)\d{9}$/.test(cleanPhone);
  
  if (!isValidFormat) {
    newErrors.phone = 'Please enter a valid phone number (must start with 01 or +201)';
  }
}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle successful submission
      console.log('Form submitted:', formData);
      alert('Account details updated successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to update account details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconClick = (field: string) => {
    console.log(`Icon clicked for ${field}`);
    // Add any icon click logic here
  };

  return (
    <div className={styles.container_form}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>تفاصيل الحساب</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="الاسم الأول"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              icon={<UserIcon />}
              onIconClick={() => handleIconClick('firstName')}
              error={!!errors.firstName}
              className={styles.input}
            />
            {errors.firstName && (
              <span className={styles.errorText}>{errors.firstName}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="text"
              placeholder="الاسم الأخير"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              icon={<UserIcon />}
              onIconClick={() => handleIconClick('lastName')}
              error={!!errors.lastName}
              className={styles.input}
            />
            {errors.lastName && (
              <span className={styles.errorText}>{errors.lastName}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="email"
              placeholder="البريد الإليكتروني"
              value={formData.email}
              onChange={handleInputChange('email')}
              icon={<MailIcon />}
              onIconClick={() => handleIconClick('email')}
              error={!!errors.email}
              className={styles.input}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="tel"
              placeholder="رقم الهاتف"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              icon={<PhoneIcon />}
              onIconClick={() => handleIconClick('phone')}
              error={!!errors.phone}
              className={styles.input}
            />
            {errors.phone && (
              <span className={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div className={styles.buttonGroup}>
            {edit ? (
                <>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        state={isLoading ? 'loading' : 'default'}
                        loadingText="جاري التحديث..."
                        leftIcon={<EditIcon />}
                        fullWidth
                        className={styles.submitButton}
                        rounded ={true}
                        onClick={() => {
                            if (validateForm()) {
                                setEdit(false);
                            }
                        }}
                        >
                        حفظ 
                    </Button>
                </>
               ) : ( 
                <>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        state={isLoading ? 'loading' : 'default'}
                        loadingText="جاري التحديث..."
                        leftIcon={<EditIcon />}
                        fullWidth
                        className={styles.submitButton}
                        rounded ={true}
                        onClick={() => setEdit(edit => !edit)}
                        >
                        تعديل البيانات
                    </Button>
                </>
                 )}
           
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;