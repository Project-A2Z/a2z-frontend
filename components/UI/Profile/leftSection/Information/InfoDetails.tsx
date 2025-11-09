'use client';

import React, { useState } from 'react';

// Components
import { Button } from '@/components/UI/Buttons/Button';
import Input from '@/components/UI/Inputs/Input';
import Alert, { AlertButton } from '@/components/UI/Alert/alert';

// Styles
import styles from '@/components/UI/Profile/leftSection/Information/info.module.css';

// Services
import { UpdateProfileData , updateUserProfile} from '@/services/profile/profile';

// Icons
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

interface InfoDetailsProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const AccountForm: React.FC<InfoDetailsProps> = ({firstName , lastName , email , phone}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: firstName ||'',
    lastName: lastName||'',
    email: email ||'',
    phone: phone ||'',
  });

  const [edit , setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Alert state
  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: 'warning' | 'error' | 'info' | 'success';
    buttons: AlertButton[];
  }>({
    show: false,
    message: '',
    type: 'info',
    buttons: []
  });

  const showAlert = (
    message: string, 
    type: 'warning' | 'error' | 'info' | 'success' = 'info',
    buttons?: AlertButton[]
  ) => {
    setAlertConfig({
      show: true,
      message,
      type,
      buttons: buttons || [
        {
          label: 'حسناً',
          onClick: () => setAlertConfig(prev => ({ ...prev, show: false })),
          variant: 'primary'
        }
      ]
    });
  };

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
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else {
      // Remove all non-digit characters except the + sign
      const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
      
      // Check if phone starts with +201 or 01 and has appropriate length
      const isValidFormat = /^(\+201|01)\d{9}$/.test(cleanPhone);
      
      if (!isValidFormat) {
        newErrors.phone = 'يرجى إدخال رقم هاتف صحيح (يجب أن يبدأ برقم 01 أو +201)';
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
      let payload: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,  
        // email: formData.email,
        phoneNumber: formData.phone,
      };
      
      await updateUserProfile(payload);
      
      //console.log('Form submitted:', formData);
      showAlert('تم تحديث بيانات الحساب بنجاح!', 'success');
      setEdit(false);
    } catch (error) {
      //console.error('Error submitting form:', error);
      showAlert('فشل تحديث بيانات الحساب. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIconClick = (field: string) => {
    //console.log(`Icon clicked for ${field}`);
    // Add any icon click logic here
  };

  return (
    <>
      {/* Custom Alert */}
      {alertConfig.show && (
        <Alert
          message={alertConfig.message}
          type={alertConfig.type}
          setClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
          buttons={alertConfig.buttons}
        />
      )}

      <div className={styles.container_form}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>تفاصيل الحساب</h1>
          
          <form  className={styles.form}>
            <div className={styles.inputGroup}>
              <Input
                type="text"
                placeholder="الاسم الأول"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                icon={<UserIcon />}
                onIconClick={() => handleIconClick('firstName')}
                error={!!errors.firstName}
                readOnly={!edit}
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
                readOnly={!edit}
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
                readOnly={!edit}
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
                readOnly={!edit}
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
                          type="button"
                          variant="primary"
                          size="lg"
                          state={isLoading ? 'loading' : 'default'}
                          loadingText="جاري التحديث..."
                          leftIcon={<EditIcon />}
                          fullWidth
                          className={styles.submitButton}
                          rounded ={true}
                          onClick={(e) => {
                              e.preventDefault();
                              if (validateForm()) {
                                  handleSubmit(e);
                              }
                          }}
                          >
                          حفظ 
                      </Button>
                  </>
                 ) : ( 
                  <>
                      <Button
                          type="button"
                          variant="primary"
                          size="lg"
                          state={isLoading ? 'loading' : 'default'}
                          loadingText="جاري التحديث..."
                          leftIcon={<EditIcon />}
                          fullWidth
                          className={styles.submitButton}
                          rounded ={true}
                          onClick={(e) => {
                              e.preventDefault();
                              setEdit(true);
                          }}
                          >
                          تعديل البيانات
                      </Button>
                  </>
                   )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountForm;