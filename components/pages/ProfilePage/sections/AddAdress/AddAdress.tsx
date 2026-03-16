"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import  { getLocale } from "@/services/api/language"
import { Button } from "@/components/UI/Buttons/Button";
import Input from "@/components/UI/Inputs/Input";
import { ChevronDown, MapPin, Edit3 } from "lucide-react";
import dynamic from 'next/dynamic';
import styles from "./../../profile.module.css";
import {
  AddressService,
  AddressError,
} from "@/services/profile/address";
const MapLocationPicker = dynamic(
  () => import('@/components/UI/Profile/leftSection/Address/Location_map'),
  { 
    ssr: false,
    loading: () => <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري تحميل الخريطة...</div>
  }
);
// import { locationData } from '@/public/data/locationData';
import { is } from "date-fns/locale";

// const LOCATION_DATA = locationData as Record<string, string[]>;

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
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = useTranslations('Address')
  const isRTL = getLocale() === 'ar';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={styles.container_drop} ref={dropdownRef} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <label className={styles.label}>{label}</label>
      <div className={styles.buttonContainer}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            ${styles.dropdownButton}
            ${isOpen ? styles.dropdownButtonOpen : ""}
            ${disabled ? styles.dropdownButtonDisabled : ""}
            ${error ? "border-red-500" : ""}
          `}
        >
          <ChevronDown
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}` }
            style={{textAlign : isRTL? 'right' : 'left'
            }}
          />
          <span
            className={`
            ${styles.buttonText}
            ${!value && !disabled ? styles.buttonTextPlaceholder : ""}
            ${disabled ? styles.buttonTextDisabled : ""}
          `}
          >
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
                  ${index === 0 ? styles.optionButtonFirst : ""}
                  ${index === options.length - 1 ? styles.optionButtonLast : ""}
                  ${value === option ? styles.optionButtonSelected : ""}
                `}
                style={{direction : isRTL ? 'rtl' : 'ltr' }}
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

// Storage key for form draft
const DRAFT_STORAGE_KEY = 'addressFormDraft';

// Separate component that uses useSearchParams
function AddressFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Address')


  const isEditMode = searchParams?.get("mode") === "edit";
  const addressId = searchParams?.get("id");

  const [inputMethod, setInputMethod] = useState<"manual" | "map">("manual");
  const [showMap, setShowMap] = useState(false);
  const [mapLocation, setMapLocation] = useState<Location | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const locationData = t.raw('LocationData') as Record<string, string[]>;

  // Initialize with URL params only (for SSR compatibility)
  const getInitialFormData = (): AddressFormData => {
    return {
      firstName: searchParams?.get("firstName") || "",
      lastName: searchParams?.get("lastName") || "",
      phoneNumber: searchParams?.get("phoneNumber") || "",
      address: searchParams?.get("address") || "",
      governorate:
        searchParams?.get("governorate") || searchParams?.get("region") || "",
      city: searchParams?.get("city") || "",
      isDefault: searchParams?.get("isDefault") === "true" || false,
    };
  };

  const [formData, setFormData] = useState<AddressFormData>(getInitialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const isRTL = getLocale() === 'ar';


  // Load draft from localStorage after hydration (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    
    // Only load draft for new addresses, not edit mode
    if (isEditMode) return;

    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // Only use saved draft if it has some meaningful data
        if (parsed.firstName || parsed.lastName || parsed.address) {
          setHasSavedDraft(true);
          
          // Restore form data
          setFormData({
            firstName: parsed.firstName || "",
            lastName: parsed.lastName || "",
            phoneNumber: parsed.phoneNumber || "",
            address: parsed.address || "",
            governorate: parsed.governorate || "",
            city: parsed.city || "",
            isDefault: parsed.isDefault || false,
          });
          
          // Restore map location if it exists
          if (parsed.mapLocation) {
            setMapLocation(parsed.mapLocation);
          }
          
          // Restore input method and map visibility
          if (parsed.inputMethod) {
            setInputMethod(parsed.inputMethod);
            setShowMap(parsed.showMap || false);
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved draft:", error);
    }
  }, [isEditMode]);

  const governorateOptions = Object.keys(locationData);
  const cityOptions = formData.governorate
    ? locationData[formData.governorate] || []
    : [];

  // Auto-save form data to localStorage whenever it changes (only for new addresses and after hydration)
  useEffect(() => {
    // Don't save during SSR or before hydration
    if (!isHydrated || isEditMode || isSuccess) return;

    try {
      // Save the complete form state including map location
      const draftData = {
        ...formData,
        mapLocation: mapLocation,
        inputMethod: inputMethod,
        showMap: showMap,
        timestamp: Date.now()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, [formData, mapLocation, inputMethod, showMap, isEditMode, isSuccess, isHydrated]);

  useEffect(() => {
    if (!AddressService.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "governorate" && typeof value === "string"
        ? { city: "" }
        : {}),
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleLocationSelect = (location: Location) => {
    setMapLocation(location);

    setFormData((prev) => ({
      ...prev,
      address: location.address || prev.address,
      city: location.city || prev.city,
      governorate: location.region || prev.governorate,
    }));

    setErrors((prev) => ({
      ...prev,
      address: undefined,
      city: undefined,
      governorate: undefined,
    }));
  };

  const toggleInputMethod = () => {
    if (inputMethod === "manual") {
      setInputMethod("map");
      setShowMap(true);
    } else {
      setInputMethod("manual");
      setShowMap(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('addressForm.fields.firstName.label');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('addressForm.fields.lastName.label');
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('addressForm.fields.phoneNumber.label');
    } else if (!/^[0-9]{11}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = t('addressForm.fields.phoneNumber.invalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('addressForm.fields.address.label');
    }

    if (!formData.governorate.trim()) {
      newErrors.governorate = t('addressForm.fields.governorate.label');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('addressForm.fields.city.label');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasSavedDraft(false);
      // Reset map location as well
      setMapLocation(null);
      setInputMethod("manual");
      setShowMap(false);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!AddressService.isAuthenticated()) {
      setErrors({ general: "يجب تسجيل الدخول للقيام بهذا الإجراء" });
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const basePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        region: formData.governorate,
        ...(formData.isDefault && { isDefault: true }),
      };

      if (isEditMode && addressId) {
        const updatePayload = {
          addressId: addressId,
          ...basePayload,
        };

        await AddressService.updateAddress(updatePayload);
        setIsSuccess(true);
        setTimeout(() => router.back(), 1500);
      } else {
        await AddressService.addAddress(basePayload);
        setIsSuccess(true);
        // Clear draft after successful submission
        clearDraft();
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      if (error instanceof AddressError) {
        if (error.statusCode === 401) {
          setErrors({ general: t('addressForm.errors.sessionExpired') });
          setTimeout(() => router.push("/login"), 1000);
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
          general: `${isEditMode ? t('addressForm.errors.editFailed') : t('addressForm.errors.addFailed')}`,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Only ask to clear draft if there's meaningful data
    const hasData = formData.firstName || formData.lastName || formData.address || formData.phoneNumber;
    
   clearDraft();
    router.back();
  };

 
  const pageTitle = isEditMode ? t('addressForm.pageTitles.edit') : t('addressForm.pageTitles.add');
  const submitButtonText = isEditMode ? t('addressForm.buttons.saveEdit') : t('addressForm.buttons.save');
  const successText = isEditMode ? t('addressForm.success.edited') : t('addressForm.success.saved');

  return (
    <div className={styles.container_newaddress} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className={styles.header}>
        <h2 className={styles.title}>{pageTitle}</h2>
        {isEditMode && (
          <p className={styles.editSubtitle}>{pageTitle}</p>
        )}
        {/* {!isEditMode && hasSavedDraft && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              marginTop: "8px",
              backgroundColor: "#e3f2fd",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "#1976d2" }}>
              📝 تم استرجاع المسودة المحفوظة تلقائياً
            </span>
            <button
              type="button"
              onClick={handleClearDraft}
              style={{
                background: "none",
                border: "none",
                color: "#d32f2f",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "12px",
                padding: "4px 8px",
              }}
            >
              مسح البيانات والبدء من جديد
            </button>
          </div>
        )} */}
      </div>

      {errors.general && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            color: "#c33",
            textAlign: "center",
          }}
        >
          {errors.general}
        </div>
      )}

      {isSuccess && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            backgroundColor: "#e8f5e9",
            border: "1px solid #a5d6a7",
            borderRadius: "8px",
            color: "#2e7d32",
            textAlign: "center",
          }}
        >
          {successText}{t('addressForm.success.redirecting')}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder={t('addressForm.fields.firstName.placeholder')}
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            error={!!errors.firstName}
            className={styles.input}
            disabled={isSubmitting}
             style={{textAlign: isRTL ? 'right' : 'left'}}

          />
          {errors.firstName && (
            <p className={styles.errorText}>{errors.firstName}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder={t('addressForm.fields.lastName.placeholder')}
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            error={!!errors.lastName}
            className={styles.input}
            disabled={isSubmitting}
                        style={{textAlign: isRTL ? 'right' : 'left'}}

          />
          {errors.lastName && (
            <p className={styles.errorText}>{errors.lastName}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <Input
            type="tel"
            placeholder={t('addressForm.fields.phoneNumber.placeholder')}
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            error={!!errors.phoneNumber}
            className={styles.input}
            disabled={isSubmitting}
            maxLength={11}
            style={{textAlign: isRTL ? 'right' : 'left'}}

          />
          {errors.phoneNumber && (
            <p className={styles.errorText}>{errors.phoneNumber}</p>
          )}
        </div>

        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              textAlign: isRTL ? 'right' : 'left',
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
            <Button
              type="button"
              variant={inputMethod === "map" ? "primary" : "outline"}
              size="sm"
              onClick={toggleInputMethod}
              disabled={isSubmitting}
              style={{ minWidth: "140px" }}
              rounded={true}
              leftIcon={
                inputMethod === "manual" ? (
                  <MapPin size={16} style={{ marginLeft: "6px" }} />
                ) : (
                  <Edit3 size={16} style={{ marginLeft: "6px" }} />
                )
              }
            >
              {inputMethod === "manual" ? t('addressForm.inputMethod.useMap') : t('addressForm.inputMethod.useManual')}
            </Button>
          </div>
        </div>

        {inputMethod === "map" && showMap && (
          <div style={{ marginBottom: "24px" }}>
            <MapLocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={mapLocation || undefined}
              height="400px"
            />
          </div>
        )}

        <div className={styles.fieldGroup}>
          <Input
            type="text"
            placeholder={t('addressForm.fields.address.placeholder')}
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            error={!!errors.address}
            className={styles.input}
            disabled={isSubmitting}
                          style={{textAlign: isRTL ? 'right' : 'left'}}

          />
          {errors.address && (
            <p className={styles.errorText}>{errors.address}</p>
          )}
          {inputMethod === "map" && formData.address && mapLocation && (
            <p
              style={{
                fontSize: "12px",
                color: "#4CAF50",
                marginTop: "4px",
                textAlign: isRTL ? 'right' : 'left',
                direction: isRTL ? 'rtl' : 'ltr',
              }}
             
            >
              {t('addressForm.inputMethod.mapFilledNote')}
            </p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <CustomDropdown
            label={t('addressForm.fields.governorate.label')}
            value={formData.governorate}
            options={governorateOptions}
            onChange={(value) => handleInputChange("governorate", value)}
            placeholder={t('addressForm.fields.governorate.placeholder')}
            error={!!errors.governorate}
            disabled={isSubmitting}
          />
          {errors.governorate && (
            <p className={styles.errorText}>{errors.governorate}</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <CustomDropdown
            label={t('addressForm.fields.city.label')}
            value={formData.city}
            options={cityOptions}
            onChange={(value) => handleInputChange("city", value)}
            placeholder={t('addressForm.fields.city.placeholder')}
            disabled={!formData.governorate || isSubmitting}
            error={!!errors.city}
          />
          {errors.city && <p className={styles.errorText}>{errors.city}</p>}
        </div>

        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel} style={{direction: isRTL ? 'rtl' : 'ltr'}}>
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange("isDefault", e.target.checked)}
              className={styles.checkbox}
              disabled={isSubmitting}
            />
            <span className={styles.checkboxText}>
              {isEditMode ? t('addressForm.checkbox.setDefault') : t('addressForm.checkbox.addDefault')}
            </span>
          </label>
          {formData.isDefault && (
            <p
              style={{
                fontSize: "12px",
                color: "#2e7d32",
                marginTop: "4px",
                marginRight: "24px",
              }}
            >
             {t('addressForm.checkbox.defaultNote')}
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
           {t('addressForm.buttons.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            state={isSubmitting ? "loading" : isSuccess ? "success" : "default"}
            loadingText={isEditMode ? t('addressForm.buttons.saveEdit') : t('addressForm.buttons.save')}
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

// Main component with Suspense wrapper
export default function NewAddressForm() {
    const t = useTranslations('Address')
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <p>{t('addressForm.loading.page')}</p>
        </div>
      }
    >
      <AddressFormContent />
    </Suspense>
  );
}