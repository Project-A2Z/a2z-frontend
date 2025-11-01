import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import styles from './../profile.module.css';
//icons
import CameraIcon from './../../../../public/icons/camera.svg';
// Import the profile service and UserStorage
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
  onError?: (error: string) => void; // Optional error callback
}

const Info: React.FC<InfoProps> = ({ user, onChange, onError }) => {
  const [avatar, setAvatar] = useState<string | null>(user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      // Preview the image immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setAvatar(imageUrl);
      };
      reader.readAsDataURL(file);

      // Get auth token from UserStorage
      const token = UserStorage.getToken();
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      }

      // Get current user from UserStorage to ensure we have latest data
      const currentUser = UserStorage.getUser();
      if (!currentUser) {
        throw new Error('لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
      }

      //console.log('👤 Current user from UserStorage:', currentUser);

      // ✅ FIX: Include firstName, lastName, and phoneNumber to satisfy API requirement
      const updateData: UpdateProfileData = {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phoneNumber: currentUser.phoneNumber,
        image: file
      };

      //console.log('🚀 Uploading image with user data...', {
<<<<<<< HEAD
      //   firstName: updateData.firstName,
      //   lastName: updateData.lastName,
      //   phoneNumber: updateData.phoneNumber,
      //   hasImage: !!updateData.image
      // });
=======
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phoneNumber: updateData.phoneNumber,
        hasImage: !!updateData.image
      });
>>>>>>> 1f23203 (f1 commit)

      // Call the API to update profile with new image
      const response = await updateUserProfile(updateData, token);

      //console.log('✅ Image uploaded successfully!', response);

      // Update the avatar with the server's image URL
      if (response.user.image) {
        setAvatar(response.user.image);
      }

      // ✅ Update UserStorage with the latest user data
      UserStorage.updateUser({
        image: response.user.image || null,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        phoneNumber: response.user.phoneNumber,
        updatedAt: response.user.updatedAt
      });

      //console.log('💾 UserStorage updated with new user data');

      // Call onChange callback with updated user data
      if (onChange) {
        const updatedUser = {
          ...user,
          image: response.user.image || null,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phoneNumber: response.user.phoneNumber,
          updatedAt: response.user.updatedAt
        };
        onChange(updatedUser);
      }

      // Show success message (optional)
      //console.log('✅ تم تحديث الصورة الشخصية بنجاح');

    } catch (error: any) {
      //console.error('❌ Image upload error:', error);
      
      // Revert avatar preview on error
      setAvatar(user.image || null);

      // Call error callback
      if (onError) {
        let errorMessage = 'فشل في تحديث الصورة الشخصية. يرجى المحاولة مرة أخرى.';
        
        // Handle specific error cases
        if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 401) {
          errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
          // Clear auth data on 401
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
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getUserInitial = (firstName?: string, lastName?: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return 'U';
  };

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

export default Info;