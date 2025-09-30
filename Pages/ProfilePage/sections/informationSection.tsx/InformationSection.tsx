'use client';
import React, { useState, useEffect } from 'react';
import styles from './../../profile.module.css';
import Info from '../../../../components/UI/Profile/RightSection/Info';

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
  userProp: User | null; // Make this nullable to match the parent component
}

const InformationSection: React.FC<InformationSectionProps> = ({ userProp }) => {
  const [user, setUser] = useState<User | null>(userProp);

  // Update local state when userProp changes
  useEffect(() => {
    setUser(userProp);
  }, [userProp]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    // You can also call a parent callback here if needed
    // onUserUpdate?.(updatedUser);
  };

  return (
    <div className={styles.information_section}>
      <Info user={user} onChange={handleUserUpdate} />
    </div>
  );
};

export default InformationSection;