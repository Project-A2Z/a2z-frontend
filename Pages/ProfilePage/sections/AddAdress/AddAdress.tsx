'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './../../../../components/UI/Buttons/Button';
import Input from './../../../../components/UI/Inputs/Input';
import { ChevronDown, MapPin, Edit3 } from 'lucide-react';
import styles from './../../profile.module.css';
import { AddressService, AddressError } from './../../../../services/profile/address';
import MapLocationPicker from './../../../../components/UI/Profile/leftSection/Address/Location_map';

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

interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  region?: string;
}

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
  general?: string;
}

export default function NewAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isEditMode = searchParams?.get('mode') === 'edit';
  const addressId = searchParams?.get('id');
  
  const [inputMethod, setInputMethod] = useState<'manual' | 'map'>('manual');
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState<Location | null>(null);
  
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: searchParams?.get('firstName') || '',
    lastName: searchParams?.get('lastName') || '',
    phoneNumber: searchParams?.get('phoneNumber') || '',
    address: searchParams?.get('address') || '',
    governorate: searchParams?.get('governorate') || searchParams?.get('region') || '',
    city: searchParams?.get('city') || '',
    isDefault: searchParams?.get('isDefault') === 'true' || false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // const [from, setFrom] = useState<string | null>(null);

  const governorateOptions = Object.keys(locationData);
  const cityOptions = formData.governorate ? locationData[formData.governorate] || [] : [];

  useEffect(() => {
    if (!AddressService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [router]);

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'governorate' && typeof value === 'string' ? { city: '' } : {})
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleLocationSelect = (location: Location) => {
    console.log('Map location selected:', location);
    setMapLocation(location);
    
    // Auto-fill form fields from map selection
    setFormData(prev => ({
      ...prev,
      address: location.address || prev.address,
      city: location.city || prev.city,
      governorate: location.region || prev.governorate
    }));

    // Clear related errors
    setErrors(prev => ({
      ...prev,
      address: undefined,
      city: undefined,
      governorate: undefined
    }));
  };

  const toggleInputMethod = () => {
    if (inputMethod === 'manual') {
      setInputMethod('map');
      setShowMap(true);
    } else {
      setInputMethod('manual');
      setShowMap(false);
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
    } else if (!/^[0-9]{11}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'رقم الهاتف يجب أن يكون 11 رقم';
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
      console.log('Form validation failed');
      return;
    }

    if (!AddressService.isAuthenticated()) {
      setErrors({ general: 'يجب تسجيل الدخول للقيام بهذا الإجراء' });
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Build payload without coordinates field
      const basePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        region: formData.governorate,
        ...(formData.isDefault && { isDefault: true })
      };

      if (isEditMode && addressId) {
        console.log('Updating address...', { addressId, ...basePayload });
        
        const updatePayload = {
          addressId: addressId,
          ...basePayload
        };
        
        console.log('Final update payload:', JSON.stringify(updatePayload, null, 2));
        
        const response = await AddressService.updateAddress(updatePayload);
        
        console.log('Address updated successfully:', response);
        setIsSuccess(true);
        setTimeout(() => router.back(), 1500);
      } else {
        console.log('Adding new address...', basePayload);
        
        console.log('Final add payload:', JSON.stringify(basePayload, null, 2));
        
        const response = await AddressService.addAddress(basePayload);
        
        console.log('Address added successfully:', response);
        setIsSuccess(true);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'add'} address:`, error);
      
      if (error instanceof AddressError) {
        if (error.statusCode === 401) {
          setErrors({ general: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.' });
          setTimeout(() => router.push('/login'), 1000);
        } else if (error.errors) {
          const apiErrors: FormErrors = {};
          Object.entries(error.errors).forEach(([key, value]) => {
            apiErrors[key as keyof FormErrors] = value;
          });
          setErrors(apiErrors);
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ 
          general: `حدث خطأ أثناء ${isEditMode ? 'تحديث' : 'إضافة'} العنوان. يرجى المحاولة مرة أخرى.` 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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

      {errors.general && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33',
          textAlign: 'center'
        }}>
          {errors.general}
        </div>
      )}

      {isSuccess && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: '#e8f5e9',
          border: '1px solid #a5d6a7',
          borderRadius: '8px',
          color: '#2e7d32',
          textAlign: 'center'
        }}>
          {successText} جاري التحويل...
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder="الاسم الأول"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={!!errors.firstName}
            className={styles.input}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className={styles.errorText}>{errors.lastName}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="tel"
            placeholder="رقم الهاتف (11 رقم)"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={!!errors.phoneNumber}
            className={styles.input}
            disabled={isSubmitting}
            maxLength={11}
          />
          {errors.phoneNumber && (
            <p className={styles.errorText}>{errors.phoneNumber}</p>
          )}
        </div>

        {/* Toggle between manual and map input */}
        <div style={{ 
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            
            <Button
              type="button"
              variant={inputMethod === 'map' ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleInputMethod}
              disabled={isSubmitting}
              style={{ minWidth: '140px' }}
              rounded={true}
              leftIcon={inputMethod === 'manual' ? 
                          <MapPin size={16} style={{ marginLeft: '6px' }} /> 
                          : 
                          <Edit3 size={16} style={{ marginLeft: '6px' }} />
                        }
            >
              {inputMethod === 'manual' ? (
                <>
                 
                  استخدام الخريطة
                </>
              ) : (
                <>
                  إدخال يدوي
                </>
              )}
            </Button>
          </div>
          
        </div>

        {/* Map Section - LINE 259 AREA */}
        {inputMethod === 'map' && showMap && (
          <div style={{ marginBottom: '24px' }}>
            <MapLocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={mapLocation || undefined}
              height="400px"
            />
          </div>
        )}

        {/* Address Fields */}
        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder="العنوان التفصيلي"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            className={styles.input}
            disabled={isSubmitting}
          />
          {errors.address && (
            <p className={styles.errorText}>{errors.address}</p>
          )}
          {inputMethod === 'map' && formData.address && mapLocation && (
            <p style={{
              fontSize: '12px',
              color: '#4CAF50',
              marginTop: '4px'
            }}>
              تم التعبئة من الخريطة (يمكنك التعديل)
            </p>
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
            disabled={isSubmitting}
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
            disabled={!formData.governorate || isSubmitting}
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
              disabled={isSubmitting}
            />
            <span className={styles.checkboxText}>
              {isEditMode ? 'تعيين كعنوان افتراضي' : 'أضف كعنوان افتراضي'}
            </span>
          </label>
          {formData.isDefault && (
            <p style={{
              fontSize: '12px',
              color: '#2e7d32',
              marginTop: '4px',
              marginRight: '24px'
            }}>
              سيتم إلغاء العنوان الافتراضي الحالي تلقائياً
            </p>
          )}
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