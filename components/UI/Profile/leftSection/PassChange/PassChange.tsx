'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getLocale } from '@/services/api/language';

// Components
import { Button } from '@/components/UI/Buttons/Button';
import Input from '@/components/UI/Inputs/Input';
import styles from '@/components/UI/Profile/leftSection/PassChange/pass.module.css';

// Icons
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
  okLabel: string;
}

interface PassChangeProps {
  onChangePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, type, title, message, onClose, okLabel }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        <div className={`${styles.modalIcon} ${styles[type]}`}>
          {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        </div>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        <button className={`${styles.modalButton} ${styles[type]}`} onClick={onClose}>
          {okLabel}
        </button>
      </div>
    </div>
  );
};

const PassChange: React.FC<PassChangeProps> = ({ onChangePassword }) => {
  const t = useTranslations('profile.left');
  const isRtl = getLocale() === 'ar';



  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PasswordFormData>>({});

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModal({ isOpen: true, type, title, message });
  };

  const handleInputChange = (field: keyof PasswordFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};

    if (!formData.currentPassword.trim())
      newErrors.currentPassword = t('passChange.fields.current.required');

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t('passChange.fields.new.required');
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('passChange.fields.new.minLength');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = t('passChange.fields.new.complexity');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('passChange.fields.confirm.required');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passChange.fields.confirm.mismatch');
    }

    if (formData.currentPassword === formData.newPassword && formData.currentPassword.trim()) {
      newErrors.newPassword = t('passChange.fields.new.sameAsCurrent');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onChangePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showModal('success', t('passChange.modal.success.title'), t('passChange.modal.success.message'));
    } catch (error: any) {
      showModal(
        'error',
        t('passChange.modal.error.title'),
        error?.message || t('passChange.modal.error.message')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container_form} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={styles.formCard} style={{ textAlign: isRtl ? 'right' : 'left' }}>
          <h1 className={styles.title}>{t('passChange.title')}</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                placeholder={t('passChange.fields.current.placeholder')}
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                icon={showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                onIconClick={() => toggleVisibility('current')}
                error={!!errors.currentPassword}
                className={styles.input}
                style={{textAlign: isRtl ? 'right' : 'left'}}
              />
              {errors.currentPassword && <span className={styles.errorText}>{errors.currentPassword}</span>}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                placeholder={t('passChange.fields.new.placeholder')}
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                icon={showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                onIconClick={() => toggleVisibility('new')}
                error={!!errors.newPassword}
                className={styles.input}
                style={{textAlign: isRtl ? 'right' : 'left'}}
              />
              {errors.newPassword && <span className={styles.errorText}>{errors.newPassword}</span>}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder={t('passChange.fields.confirm.placeholder')}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                icon={showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                onIconClick={() => toggleVisibility('confirm')}
                error={!!errors.confirmPassword}
                className={styles.input}
                style={{textAlign: isRtl ? 'right' : 'left'}}
              />
              {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
            </div>

            <div className={styles.buttonGroup}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                state={isLoading ? 'loading' : 'default'}
                loadingText={t('passChange.buttons.loading')}
                fullWidth
                className={styles.submitButton}
                rounded={true}
                onClick={handleSubmit}
              >
                {t('passChange.buttons.submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        okLabel={t('passChange.buttons.ok')}
      />
    </>
  );
};

export default PassChange;