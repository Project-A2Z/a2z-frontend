import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import styles from './../profile.module.css';

//icons
import CameraIcon from './../../../../public/icons/camera.svg';

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
}

const Info: React.FC<InfoProps> = ({ user, onChange }) => {
  const [avatar, setAvatar] = useState<string | null>(user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setAvatar(imageUrl);
        setIsUploading(false);
        
        // Call onChange callback with updated user
        if (onChange) {
          onChange({ ...user, image: imageUrl });
        }
      };
      reader.readAsDataURL(file);
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
          accept="image/*"
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