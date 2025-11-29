import React, { useState, useRef, useCallback, memo } from 'react';

// Styles
import styles from '@/components/UI/Profile/profile.module.css';

// Icons
// import CameraIcon from '@/public/icons/camera.svg';

// Services
import { updateUserProfile, UpdateProfileData } from '@/services/profile/profile';
import { UserStorage } from '@/services/auth/login';

// Instead of importing, use inline SVG
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
    <path d="M3 5a2 2 0 012-2h2l1-1h4l1 1h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
  </svg>
);

export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  image?: string | null;
  phoneNumber: string;
  department?: string | null;
  salary?: number | null;
  dateOfSubmission?: string | null;
  isVerified?: boolean;
  isEmailVerified: boolean;
  address?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  EmailVerificationToken?: string;
  EmailVerificationExpires?: string;
}

interface InfoProps {
  user: User | null;
  onChange?: (updatedUser: User) => void;
  onError?: (error: string) => void;
}

const Info: React.FC<InfoProps> = ({ user, onChange, onError }) => {
  const [avatar, setAvatar] = useState<string | null>(user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * PERFORMANCE: Memoize image upload handler
   */
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        if (onError) {
          onError('نوع الملف غير مدعوم. يجب أن تكون الصورة من نوع JPEG, PNG, GIF, أو WebP');
        }
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        if (onError) {
          onError('حجم الملف كبير جداً. يجب أن لا يتجاوز حجم الصورة 5 ميجابايت');
        }
        return;
      }

      setIsUploading(true);

      try {
        // PERFORMANCE: Preview image immediately for better UX
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setAvatar(imageUrl);
        };
        reader.readAsDataURL(file);

        // Get auth token
        const token = UserStorage.getToken();
        if (!token) {
          throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
        }

        // Get current user data
        const currentUser = UserStorage.getUser();
        if (!currentUser) {
          throw new Error('لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
        }

        // Prepare update data
        const updateData: UpdateProfileData = {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phoneNumber: currentUser.phoneNumber,
          image: file,
        };

        // Upload image
        const response = await updateUserProfile(updateData, token);

        // Update avatar with server URL
        if (response.user.image) {
          setAvatar(response.user.image);
        }

        // Update UserStorage
        UserStorage.updateUser({
          image: response.user.image || null,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phoneNumber: response.user.phoneNumber,
          updatedAt: response.user.updatedAt,
        });

        // Call onChange callback
        if (onChange) {
          const updatedUser = {
            ...user,
            image: response.user.image || null,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            phoneNumber: response.user.phoneNumber,
            updatedAt: response.user.updatedAt,
          };
          onChange(updatedUser);
        }
      } catch (error: any) {
        console.error('❌ Image upload error:', error);

        // Revert avatar preview on error
        setAvatar(user.image || null);

        // Handle errors
        if (onError) {
          let errorMessage = 'فشل في تحديث الصورة الشخصية. يرجى المحاولة مرة أخرى.';

          if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 401) {
            errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
            UserStorage.removeUser();
          } else if (error.status === 400) {
            errorMessage = error.message || 'بيانات غير صحيحة. يرجى المحاولة مرة أخرى.';
          }

          onError(errorMessage);
        }
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [user, onChange, onError]
  );

  /**
   * PERFORMANCE: Memoize file input trigger
   */
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * PERFORMANCE: Memoize user initials calculation
   */
  const getUserInitial = useCallback(
    (firstName?: string, lastName?: string): string => {
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      } else if (firstName) {
        return firstName.charAt(0).toUpperCase();
      } else if (lastName) {
        return lastName.charAt(0).toUpperCase();
      }
      return 'U';
    },
    []
  );

  // Handle null user case
  if (!user) {
    return (
      <div className={styles.userInfo}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <div className={styles.avatarInitials}>U</div>
          </div>
        </div>
        <h2 className={styles.username}>Loading...</h2>
      </div>
    );
  }

  return (
    <div className={styles.userInfo}>
      {/* Avatar Section */}
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          {avatar ? (
            <img
              src={avatar}
              alt={`${user.firstName} ${user.lastName}'s avatar`}
              className={styles.avatarImage}
              // PERFORMANCE: Add loading="lazy" for images below the fold
              loading="eager" // This is above fold, so load immediately
              // PERFORMANCE: Prevent layout shift with explicit dimensions
              width={120}
              height={120}
            />
          ) : (
            <div className={styles.avatarInitials}>
              {getUserInitial(user.firstName, user.lastName)}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className={styles.uploadButton}
          aria-label="Upload new avatar"
          title={isUploading ? 'جاري التحميل...' : 'تحديث الصورة الشخصية'}
        >
          {isUploading ? (
            <div className={styles.spinner}></div>
          ) : (
            <CameraIcon />
          )}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className={styles.hiddenInput}
          aria-hidden="true"
        />
      </div>

      {/* Username */}
      <h2 className={styles.username}>
        {user.firstName} {user.lastName}
      </h2>
    </div>
  );
};

// PERFORMANCE: Memoize component to prevent unnecessary re-renders
export default memo(Info, (prevProps, nextProps) => {
  // Only re-render if user data actually changed
  if (!prevProps.user && !nextProps.user) return true;
  if (!prevProps.user || !nextProps.user) return false;

  return (
    prevProps.user._id === nextProps.user._id &&
    prevProps.user.firstName === nextProps.user.firstName &&
    prevProps.user.lastName === nextProps.user.lastName &&
    prevProps.user.image === nextProps.user.image
  );
});