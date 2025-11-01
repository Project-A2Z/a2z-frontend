"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./../../../components/UI/Buttons/Button";
import Input from "./../../../components/UI/Inputs/Input";
import Logo from "./../../../public/icons/logo.svg";
import Background from "./../../../components/UI/Background/Background";
import Alert from "@/components/UI/Alert/alert";
import styles from "./../auth.module.css";
import { registerUser, RegisterRequest } from "../../../services/auth/register";

export default function RegistrationForm() {
  const router = useRouter();
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

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [validPass , setValidPass] = useState(false)

  const handelPass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      password: value,
    }));
    // Check password validity
    const isValid =
      value.length >= 8 &&
      /(?=.*[a-z])/.test(value) &&
      /(?=.*[A-Z])/.test(value) &&
      /(?=.*\d)/.test(value) &&
      /(?=.*[@$!%*?&#])/.test(value);
    setValidPass(isValid);
    //console.log("Password valid:", isValid);
    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error when any field changes
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
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
      newErrors.firstName = "الاسم الأول مطلوب";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "الاسم الأخير مطلوب";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تحتوي على حرف صغير";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تحتوي على حرف كبير";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تحتوي على رقم";
    } else if (!/(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تحتوي على رمز خاص (@$!%*?&#)";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else {
      // Enhanced phone validation - adjust regex based on your requirements
      const phoneRegex = /^[\+]?[0-9\-\(\)\s]{8,}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "رقم الهاتف غير صحيح";
      }
    }

    return newErrors;
  };

  // Enhanced form validation
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
    //console.log("🚀 Starting registration process...");

    // Validate form first
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      //console.log("❌ Form validation failed:", newErrors);
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Clean and prepare data
      const registerData: RegisterRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(), // Ensure lowercase email
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim().replace(/\s+/g, ""), // Remove spaces
      };

      //console.log("📤 Sending registration data:", {
<<<<<<< HEAD
      //   ...registerData,
      //   password: "[HIDDEN]", // Don't log password
      // });
=======
        ...registerData,
        password: "[HIDDEN]", // Don't log password
      });
>>>>>>> 1f23203 (f1 commit)

      const response = await registerUser(registerData);
      //console.log("📥 Registration response:", response);

      if (response.status === "success") {
        //console.log("✅ Registration successful:", response.data.user);

        // Show success message to user
        setAlertMessage(
          "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب."
        );
        setShowSuccessAlert(true);
      }
    } catch (error: any) {
      //console.error("❌ Registration failed:", error);

      // Enhanced error handling with Arabic translations
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.";
      let fieldErrors = {};

      // Handle network errors
      if (error.message && error.message.includes("Network error")) {
        errorMessage =
          "لا يمكن الوصول إلى الخادم. يرجى التحقق من الاتصال بالإنترنت.";
      } else if (error.response || error.status) {
        // Server responded with an error
        const status = error.status || error.response?.status;
        const responseData = error.response?.data;

        //console.log("🔍 Error details:", {
<<<<<<< HEAD
        //   status,
        //   responseData,
        //   errors: error.errors,
        // });
=======
          status,
          responseData,
          errors: error.errors,
        });
>>>>>>> 1f23203 (f1 commit)

        // Handle specific status codes
        switch (status) {
          case 400:
            errorMessage = "البيانات المدخلة غير صحيحة. يرجى مراجعة المعلومات.";
            if (error.message && error.message !== "Registration failed") {
              errorMessage = error.message;
            }
            if (error.errors) {
              fieldErrors = error.errors;
            }
            break;
          case 409:
            errorMessage =
              "البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني آخر.";
            break;
          case 422:
            errorMessage =
              "البيانات المدخلة لا تتوافق مع المتطلبات. يرجى مراجعة المعلومات.";
            if (error.errors) {
              fieldErrors = error.errors;
            }
            break;
          case 500:
            errorMessage = "خطأ في الخادم. يرجى المحاولة لاحقاً.";
            break;
          default:
            errorMessage =
              error.message ||
              `خطأ غير متوقع (${status}). يرجى المحاولة مرة أخرى.`;
        }
      } else {
        // Handle other error types
        errorMessage = error.message || errorMessage;
      }

      // Translate common field errors to Arabic if needed
      const translatedFieldErrors: Record<string, string> = {};
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.keys(fieldErrors).forEach((field: string) => {
          translatedFieldErrors[field] =
            fieldErrors[field as keyof typeof fieldErrors]; // Keep original for now, can add translation logic
        });
      }

      // Set errors
      setErrors({
        ...translatedFieldErrors,
      });

      // Show error alert
      setAlertMessage(errorMessage);
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    router.push("/active-code");
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
            {/* General Error Message */}
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
                  placeholder="الاسم الأول"
                  error={!!errors.firstName}
                  className={styles.Input}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
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
                placeholder="كلمة المرور"
                error={!!errors.password}
                icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onIconClick={() => setShowPassword(!showPassword)}
                iconPosition="left"
                className={styles.Input}
                disabled={isLoading}
              />
              {/* Dynamic password requirements - always visible */}
              {!validPass && (
                <>
                <div className={styles.passwordRequirements}>
                
                <ul className={styles.requirementsList}>
                  <li className={formData.password.length >= 8 ? styles.valid : styles.invalid}>
                    • 8 أحرف على الأقل
                  </li>
                  <li className={/(?=.*[A-Z])/.test(formData.password) ? styles.valid : styles.invalid}>
                    • حرف كبير واحد على الأقل (A-Z)
                  </li>
                  <li className={/(?=.*[a-z])/.test(formData.password) ? styles.valid : styles.invalid}>
                    • حرف صغير واحد على الأقل (a-z)
                  </li>
                  <li className={/(?=.*\d)/.test(formData.password) ? styles.valid : styles.invalid}>
                    • رقم واحد على الأقل (0-9)
                  </li>
                  <li className={/(?=.*[@$!%*?&#])/.test(formData.password) ? styles.valid : styles.invalid}>
                    • رمز خاص واحد على الأقل (@$!%*?&#)
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
                placeholder="رقم الهاتف (مثال: +201234567890)"
                error={!!errors.phoneNumber}
                className={styles.Input}
                disabled={isLoading}
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
                  isFormValid()
                    ? styles.submitButtonValid
                    : styles.submitButtonInvalid
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>
            </div>

            {/* Login Link */}
            <div className={styles.loginSection}>
              <p className={styles.loginText}>
                هل لديك حساب؟{" "}
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
                  تسجيل الدخول
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
              label: "حسناً",
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
              label: "إغلاق",
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