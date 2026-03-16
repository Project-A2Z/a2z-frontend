import React, { useState, useRef, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';

// Styles
import styles from '@/components/UI/Profile/profile.module.css';

// Icons
import CameraIcon from '@/public/icons/camera.svg';

// Services
import { updateUserProfile, UpdateProfileData } from '@/services/profile/profile';
import { UserStorage } from '@/services/auth/login';

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
  const t = useTranslations('profile.info');

  const [avatar, setAvatar] = useState<string | null>(user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        if (onError) onError(t('errors.invalidType'));
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        if (onError) onError(t('errors.fileTooLarge'));
        return;
      }

      setIsUploading(true);

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setAvatar(imageUrl);
        };
        reader.readAsDataURL(file);

        const token = UserStorage.getToken();
        if (!token) throw new Error(t('errors.tokenNotFound'));

        const currentUser = UserStorage.getUser();
        if (!currentUser) throw new Error(t('errors.userNotFound'));

        const updateData: UpdateProfileData = {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          phoneNumber: currentUser.phoneNumber,
          image: file,
        };

        const response = await updateUserProfile(updateData, token);

        if (response.user.image) setAvatar(response.user.image);

        UserStorage.updateUser({
          image: response.user.image || null,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phoneNumber: response.user.phoneNumber,
          updatedAt: response.user.updatedAt,
        });

        if (onChange) {
          onChange({
            ...user,
            image: response.user.image || null,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            phoneNumber: response.user.phoneNumber,
            updatedAt: response.user.updatedAt,
          });
        }
      } catch (error: any) {
        console.error('❌ Image upload error:', error);
        setAvatar(user.image || null);

        if (onError) {
          let errorMessage = t('errors.uploadFailed');

          if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 401) {
            errorMessage = t('errors.sessionExpired');
            UserStorage.removeUser();
          } else if (error.status === 400) {
            errorMessage = error.message || t('errors.invalidData');
          }

          onError(errorMessage);
        }
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [user, onChange, onError, t]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getUserInitial = useCallback(
    (firstName?: string, lastName?: string): string => {
      if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      if (firstName) return firstName.charAt(0).toUpperCase();
      if (lastName) return lastName.charAt(0).toUpperCase();
      return 'U';
    },
    []
  );

  if (!user) {
    return (
      <div className={styles.userInfo}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <div className={styles.avatarInitials}>U</div>
          </div>
        </div>
        <h2 className={styles.username}>{t('loading')}</h2>
      </div>
    );
  }

  return (
    <div className={styles.userInfo}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          {avatar ? (
            <img
              src={avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className={styles.avatarImage}
              loading="eager"
              width={120}
              height={120}
            />
          ) : (
            <div className={styles.avatarInitials}>
              {getUserInitial(user.firstName, user.lastName)}
            </div>
          )}
        </div>

        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className={styles.uploadButton}
          aria-label={t('avatar.ariaLabel')}
          title={isUploading ? t('avatar.uploadingTitle') : t('avatar.uploadTitle')}
        >
          {isUploading ? <div className={styles.spinner} /> : <CameraIcon />}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          className={styles.hiddenInput}
          aria-hidden="true"
        />
      </div>

      <h2 className={styles.username}>
        {user.firstName} {user.lastName}
      </h2>
    </div>
  );
};

export default memo(Info, (prevProps, nextProps) => {
  if (!prevProps.user && !nextProps.user) return true;
  if (!prevProps.user || !nextProps.user) return false;
  return (
    prevProps.user._id === nextProps.user._id &&
    prevProps.user.firstName === nextProps.user.firstName &&
    prevProps.user.lastName === nextProps.user.lastName &&
    prevProps.user.image === nextProps.user.image
  );
});