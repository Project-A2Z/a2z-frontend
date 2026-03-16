"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./../../../components/UI/Buttons/Button";
import Input from "./../../../components/UI/Inputs/Input";
import Logo from "@/public/logo/logo2.webp.png";
import Background from "./../../../components/UI/Background/Background";
import Alert from "@/components/UI/Alert/alert";
import styles from "./../auth.module.css";
import { registerUser, RegisterRequest } from "../../../services/auth/register";
import { useTranslations } from 'next-intl';

export default function RegistrationForm() {
  const router = useRouter();
  const t = useTranslations('register');

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    general?: string;
  }>({});

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [validPass, setValidPass] = useState(false);

  const handelPass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, password: value }));
    const isValid =
      value.length >= 8 &&
      /(?=.*[a-z])/.test(value) &&
      /(?=.*[A-Z])/.test(value) &&
      /(?=.*\d)/.test(value) &&
      /(?=.*[@$!%*?&#])/.test(value);
    setValidPass(isValid);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
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

    if (!formData.firstName.trim())
      newErrors.firstName = t('firstName.required');

    if (!formData.lastName.trim())
      newErrors.lastName = t('lastName.required');

    if (!formData.email.trim()) {
      newErrors.email = t('email.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('email.invalid');
    }

    if (!formData.password) {
      newErrors.password = t('password.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('password.errors.minLength');
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = t('password.errors.lowercase');
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = t('password.errors.uppercase');
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('password.errors.number');
    } else if (!/(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = t('password.errors.special');
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('phone.required');
    } else if (!/^[\+]?[0-9\-\(\)\s]{8,}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = t('phone.invalid');
    }

    return newErrors;
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      /\S+@\S+\.\S+/.test(formData.email) &&
      formData.password &&
      formData.password.length >= 8 &&
      formData.phoneNumber.trim() &&
      /^[\+]?[0-9\-\(\)\s]{8,}$/.test(formData.phoneNumber.trim())
    );
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const registerData: RegisterRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim().replace(/\s+/g, ""),
      };

      const response = await registerUser(registerData);

      if (response.status === "success") {
        setAlertMessage(t('alerts.success'));
        setShowSuccessAlert(true);
      }
    } catch (error: any) {
      let errorMessage = t('alerts.error.default');
      let fieldErrors = {};

      if (error.message && error.message.includes("Network error")) {
        errorMessage = t('alerts.error.network');
      } else if (error.response || error.status) {
        const status = error.status || error.response?.status;

        switch (status) {
          case 400:
            errorMessage = error.message && error.message !== "Registration failed"
              ? error.message
              : t('alerts.error.badRequest');
            if (error.errors) fieldErrors = error.errors;
            break;
          case 409:
            errorMessage = t('alerts.error.conflict');
            break;
          case 422:
            errorMessage = t('alerts.error.unprocessable');
            if (error.errors) fieldErrors = error.errors;
            break;
          case 500:
            errorMessage = t('alerts.error.server');
            break;
          default:
            errorMessage = error.message || t('alerts.error.unknown', { status });
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      const translatedFieldErrors: Record<string, string> = {};
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.keys(fieldErrors).forEach((field: string) => {
          translatedFieldErrors[field] = fieldErrors[field as keyof typeof fieldErrors];
        });
      }

      setErrors({ ...translatedFieldErrors });
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    router.push("/reset-password");
  };

  return (
    <>
      <Background />

      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <img src={Logo.src} alt="Logo" className={styles.logo} />
            <h2 className={styles.title}>{t('title')}</h2>
          </div>

          <div className={styles.form}>
            {errors.general && (
              <div className={styles.errorMessage}>
                <p className={styles.errorText}>{errors.general}</p>
              </div>
            )}

            {/* First Name and Last Name */}
            <div className={styles.nameRow}>
              <div className={styles.inputGroup}>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={t('firstName.placeholder')}
                  error={!!errors.firstName}
                  className={styles.Input}
                  disabled={isLoading}
                  dir={t("dir") as string}
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
                  placeholder={t('lastName.placeholder')}
                  error={!!errors.lastName}
                  className={styles.Input}
                  disabled={isLoading}
                  dir={t("dir") as string}
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
                placeholder={t('email.placeholder')}
                error={!!errors.email}
                className={styles.Input}
                disabled={isLoading}
                dir={t("dir") as string}
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
                onChange={handelPass}
                placeholder={t('password.placeholder')}
                error={!!errors.password}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconPosition="left"
                className={styles.Input}
                disabled={isLoading}
                dir={t("dir") as string}
              />
              {!validPass && (
                <>
                  <div className={styles.passwordRequirements}>
                    <ul className={styles.requirementsList}>
                      <li className={formData.password.length >= 8 ? styles.valid : styles.invalid}>
                        • {t('password.requirements.minLength')}
                      </li>
                      <li className={/(?=.*[A-Z])/.test(formData.password) ? styles.valid : styles.invalid}>
                        • {t('password.requirements.uppercase')}
                      </li>
                      <li className={/(?=.*[a-z])/.test(formData.password) ? styles.valid : styles.invalid}>
                        • {t('password.requirements.lowercase')}
                      </li>
                      <li className={/(?=.*\d)/.test(formData.password) ? styles.valid : styles.invalid}>
                        • {t('password.requirements.number')}
                      </li>
                      <li className={/(?=.*[@$!%*?&#])/.test(formData.password) ? styles.valid : styles.invalid}>
                        • {t('password.requirements.special')}
                      </li>
                    </ul>
                  </div>
                  {errors.password && (
                    <p className={styles.errorText}>{errors.password}</p>
                  )}
                </>
              )}
            </div>

            {/* Phone Number */}
            <div className={styles.inputGroup}>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder={t('phone.placeholder')}
                error={!!errors.phoneNumber}
                className={styles.Input}
                disabled={isLoading}
                dir={t("dir") as string}
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
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? t('submit.loading') : t('submit.default')}
              </Button>
            </div>

            {/* Login Link */}
            <div className={styles.loginSection}>
              <p className={styles.loginText}>
                {t('login.prompt')}{" "}
                <button
                  type="button"
                  className={styles.loginLink}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push("/login");
                  }}
                  disabled={isLoading}
                >
                  {t('login.link')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowSuccessAlert(false)}
          buttons={[
            {
              label: t('alerts.buttons.ok'),
              onClick: handleSuccessConfirm,
              variant: "primary",
            },
          ]}
          type="success"
        />
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <Alert
          message={alertMessage}
          setClose={() => setShowErrorAlert(false)}
          buttons={[
            {
              label: t('alerts.buttons.close'),
              onClick: () => setShowErrorAlert(false),
              variant: "danger",
            },
          ]}
          type="error"
        />
      )}
    </>
  );
}