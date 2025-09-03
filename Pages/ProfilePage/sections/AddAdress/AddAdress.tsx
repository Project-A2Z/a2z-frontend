'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './../../../../components/UI/Buttons/Button';
import Input from './../../../../components/UI/Inputs/Input';
import { ChevronDown } from 'lucide-react';
import styles from './../../profile.module.css';

// Location data
const locationData: { [key: string]: string[] } = {
  'القاهرة': ['المعادي', 'مصر الجديدة', 'الزمالك', 'وسط البلد', 'مدينة نصر', 'العباسية', 'شبرا'],
  'الجيزة': ['الدقي', 'المهندسين', 'العجوزة', 'الهرم', 'بولاق الدكرور', 'إمبابة', 'الوراق'],
  'الإسكندرية': ['سموحة', 'سيدي جابر', 'المنتزه', 'محرم بك', 'كرموز', 'الرمل', 'باكوس'],
  'الشرقية': ['الزقازيق', 'بلبيس', 'أبو حماد', 'فاقوس', 'القرين', 'ديرب نجم', 'المطرية'],
  'الفيوم': ['الفيوم', 'سنورس', 'طامية', 'إطسا', 'يوسف الصديق', 'أبشواي'],
  'دمنهور': ['دمنهور', 'كفر الدوار', 'أبو المطامير', 'الرحمانية', 'إدكو', 'رشيد'],
  'الأقصر': ['الأقصر', 'إسنا', 'أرمنت', 'القرنة', 'الطود']
};

interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.container_drop} ref={dropdownRef}>
      <label className={styles.label}>
        {label}
      </label>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            ${styles.dropdownButton}
            ${isOpen ? styles.dropdownButtonOpen : ''}
            ${disabled ? styles.dropdownButtonDisabled : ''}
            ${error ? 'border-red-500' : ''}
          `}
        >
          <ChevronDown 
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
          <span className={`
            ${styles.buttonText}
            ${!value && !disabled ? styles.buttonTextPlaceholder : ''}
            ${disabled ? styles.buttonTextDisabled : ''}
          `}>
            {value || placeholder}
          </span>
        </button>

        {isOpen && !disabled && (
          <div className={styles.optionsContainer}>
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  ${styles.optionButton}
                  ${index === 0 ? styles.optionButtonFirst : ''}
                  ${index === options.length - 1 ? styles.optionButtonLast : ''}
                  ${value === option ? styles.optionButtonSelected : ''}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AddressFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  governorate: string;
  city: string;
  isDefault: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  governorate?: string;
  city?: string;
}

export default function NewAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if we're in edit mode
  const isEditMode = searchParams?.get('mode') === 'edit';
  const addressId = searchParams?.get('id');
  
  // Initialize form data with URL parameters if in edit mode
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: searchParams?.get('firstName') || '',
    lastName: searchParams?.get('lastName') || '',
    phoneNumber: searchParams?.get('phoneNumber') || '',
    address: searchParams?.get('address') || '',
    governorate: searchParams?.get('governorate') || '',
    city: searchParams?.get('city') || '',
    isDefault: searchParams?.get('isDefault') === 'true'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const governorateOptions = Object.keys(locationData);
  const cityOptions = formData.governorate ? locationData[formData.governorate] || [] : [];

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset city when governorate changes
      ...(field === 'governorate' && typeof value === 'string' ? { city: '' } : {})
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    if (!formData.governorate.trim()) {
      newErrors.governorate = 'المحافظة مطلوبة';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isEditMode) {
        console.log('Address updated successfully:', { id: addressId, ...formData });
      } else {
        console.log('Address added successfully:', formData);
      }
      
      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'save'} address:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  // Page title based on mode
  const pageTitle = isEditMode ? 'تعديل العنوان' : 'أضف عنوان جديد';
  const submitButtonText = isEditMode ? 'حفظ التعديل' : 'حفظ';
  const successText = isEditMode ? 'تم التعديل!' : 'تم الحفظ!';

  return (
    <div className={styles.container_newaddress}>
      <div className={styles.header}>
        <h2 className={styles.title}>{pageTitle}</h2>
        {isEditMode && (
          <p className={styles.editSubtitle}>تعديل بيانات العنوان المحدد</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder="الاسم الأول"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            className={styles.input}
          />
          {errors.firstName && (
            <p className={styles.errorText}>{errors.firstName}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder="الاسم الأخير"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={!!errors.lastName}
            className={styles.input}
          />
          {errors.lastName && (
            <p className={styles.errorText}>{errors.lastName}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="tel"
            placeholder="رقم الهاتف"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={!!errors.phoneNumber}
            className={styles.input}
          />
          {errors.phoneNumber && (
            <p className={styles.errorText}>{errors.phoneNumber}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder="العنوان"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            className={styles.input}
          />
          {errors.address && (
            <p className={styles.errorText}>{errors.address}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <CustomDropdown
            label="المحافظة *"
            value={formData.governorate}
            options={governorateOptions}
            onChange={(value) => handleInputChange('governorate', value)}
            placeholder="اختر المحافظة"
            error={!!errors.governorate}
          />
          {errors.governorate && (
            <p className={styles.errorText}>{errors.governorate}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <CustomDropdown
            label="المدينة *"
            value={formData.city}
            options={cityOptions}
            onChange={(value) => handleInputChange('city', value)}
            placeholder="اختر المدينة"
            disabled={!formData.governorate}
            error={!!errors.city}
          />
          {errors.city && (
            <p className={styles.errorText}>{errors.city}</p>
          )}
        </div>

        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              {isEditMode ? 'تعيين كعنوان افتراضي' : 'أضف كعنوان افتراضي'}
            </span>
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
            rounded={true}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            state={isSubmitting ? 'loading' : isSuccess ? 'success' : 'default'}
            loadingText={isEditMode ? "جاري التعديل..." : "جاري الحفظ..."}
            disabled={isSubmitting}
            className={styles.saveButton}
            rounded={true}
          >
            {isSuccess ? successText : submitButtonText}
          </Button>
        </div>
      </form>
    </div>
  );
}