'use client';

import React, { useState } from 'react';
import { Button } from '@/components/UI//Buttons/Button';
import Input from '@/components/UI//Inputs/Input';
import styles from '@/components/UI/Profile/leftSection/PassChange/pass.module.css';

// Eye icons for password visibility toggle
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22,4 12,14.01 9,11.01" />
  </svg>
);

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ModalProps {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

interface PassChangeProps {
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalIcon} ${styles[type]}`}>
          {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        </div>
        
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        
        <button 
          className={`${styles.modalButton} ${styles[type]}`}
          onClick={onClose}
        >
          موافق
        </button>
      </div>
    </div>
  );
};

const PassChange: React.FC<PassChangeProps> = ({ onChangePassword }) => {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PasswordFormData>>({});
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleInputChange = (field: keyof PasswordFormData) => (
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون على الأقل 8 أحرف';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    if (formData.currentPassword === formData.newPassword && formData.currentPassword.trim()) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية';
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
      // Call the password change API
      await onChangePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      console.log('Password changed successfully');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success modal
      showModal(
        'success',
        'تم بنجاح!',
        'تم تغيير كلمة المرور بنجاح. يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.'
      );
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Extract error message
      let errorMessage = 'فشل في تغيير كلمة المرور. يرجى التأكد من صحة كلمة المرور الحالية والمحاولة مرة أخرى.';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show error modal
      showModal(
        'error',
        'فشل في التحديث',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconClick = (field: 'current' | 'new' | 'confirm') => {
    togglePasswordVisibility(field);
  };

  return (
    <>
      <div className={styles.container_form}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>تغيير كلمة المرور</h1>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <Input
                type={showPasswords.current ? "text" : "password"}
                placeholder="أدخل كلمة المرور القديمة"
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                icon={showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                onIconClick={() => handleIconClick('current')}
                error={!!errors.currentPassword}
                className={styles.input}
              />
              {errors.currentPassword && (
                <span className={styles.errorText}>{errors.currentPassword}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type={showPasswords.new ? "text" : "password"}
                placeholder="أدخل كلمة المرور الجديدة"
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                icon={showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                onIconClick={() => handleIconClick('new')}
                error={!!errors.newPassword}
                className={styles.input}
              />
              {errors.newPassword && (
                <span className={styles.errorText}>{errors.newPassword}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="تأكيد كلمة المرور الجديدة"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                icon={showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                onIconClick={() => handleIconClick('confirm')}
                error={!!errors.confirmPassword}
                className={styles.input}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                state={isLoading ? 'loading' : 'default'}
                loadingText="جاري التحديث..."
                fullWidth
                className={styles.submitButton}
                rounded={true}
                onClick={handleSubmit}
              >
                متابعة
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Modal */}
      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </>
  );
};

export default PassChange;