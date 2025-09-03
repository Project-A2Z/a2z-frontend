import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import styles from './../profile.module.css';

//icons
import CameraIcon from './../../../../public/icons/camera.svg';

interface User {
  name: string;
  image?: string;
}

interface InfoProps {
  user: User;
  onChange?: (updatedUser: User) => void;
}

const Info: React.FC<InfoProps> = ({ user, onChange }) => {
  const [avatar, setAvatar] = useState<string | null>(user.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0);
  };

  return (
    <div className={styles.userInfo}>
      {/* Avatar Section */}
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          {avatar ? (
            <img
              src={avatar}
              alt={`${user.name}'s avatar`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarInitials}>
              {getInitials(user.name)}
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
        {user.name}
      </h2>
    </div>
  );
};

export default Info;