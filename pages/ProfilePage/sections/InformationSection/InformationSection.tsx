'use client';
import React, { useState, useEffect, memo } from 'react';
import styles from './../../profile.module.css';

// Components
import Info from '../../../../components/UI/Profile/RightSection/Info';

// Interfaces
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

interface InformationSectionProps {
  userProp: User | null;
  onUserUpdate?: (updatedUser: User) => void; // Optional callback for parent
}

const InformationSection: React.FC<InformationSectionProps> = ({ 
  userProp, 
  onUserUpdate 
}) => {
  const [user, setUser] = useState<User | null>(userProp);

  // Update local state when userProp changes
  useEffect(() => {
    setUser(userProp);
  }, [userProp]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Call parent callback if provided
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  return (
    <div className={styles.information_section}>
      <Info user={user} onChange={handleUserUpdate} />
    </div>
  );
};

// PERFORMANCE: Memoize component to prevent unnecessary re-renders
// Only re-render when userProp actually changes
export default memo(InformationSection, (prevProps, nextProps) => {
  // Custom comparison function
  // Only re-render if user data actually changed
  if (!prevProps.userProp && !nextProps.userProp) return true;
  if (!prevProps.userProp || !nextProps.userProp) return false;
  
  return (
    prevProps.userProp._id === nextProps.userProp._id &&
    prevProps.userProp.firstName === nextProps.userProp.firstName &&
    prevProps.userProp.lastName === nextProps.userProp.lastName &&
    prevProps.userProp.image === nextProps.userProp.image &&
    prevProps.userProp.email === nextProps.userProp.email &&
    prevProps.userProp.phoneNumber === nextProps.userProp.phoneNumber
  );
});