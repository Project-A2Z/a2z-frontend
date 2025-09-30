'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './../profile.module.css';
import { logoutUser, AuthService } from './../../../../services/auth/login';

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

interface AccountListProps {
  onItemClick?: (item: string) => void;
  user?: User | null;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const AccountList: React.FC<AccountListProps> = ({ onItemClick, user, setUser }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const menuItems = [
    'تفاصيل الحساب',
    'تغيير كلمة المرور',
    'عناوينك',
    'طلباتك',
    'رسائلك',
    'مدفوعاتك',
    'تسجيل الخروج'
  ];

  

  const handleItemClick = async (item: string, index: number) => {
    setSelectedIndex(index);
    
    
    // Call the parent callback for other items
    onItemClick?.(item);
  };

  // Don't render the component if user is not available (optional)
  if (!user) {
    return (
      <div className={styles.container_list}>
        <div className={styles.list}>
          <div className={styles.listItem}>
            جاري تحميل البيانات...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container_list}>
      <div className={styles.list}>
        {menuItems.map((item, index) => {
          const isLogout = item === 'تسجيل الخروج';
          const isSelected = selectedIndex === index;
          
          return (
            <div
              key={index}
              className={`${styles.listItem} ${
                isLogout 
                  ? isSelected 
                    ? styles.logoutSelected 
                    : styles.logout
                  : isSelected 
                    ? styles.selected 
                    : styles.default
              } ${isLoggingOut && isLogout ? styles.loading : ''}`}
              onClick={() => handleItemClick(item, index)}
              style={{
                cursor: isLoggingOut && isLogout ? 'not-allowed' : 'pointer',
                opacity: isLoggingOut && isLogout ? 0.6 : 1
              }}
            >
              {isLoggingOut && isLogout ? (
                <span>
                  جاري تسجيل الخروج...
                  {/* You can add a loading spinner here if you have one */}
                </span>
              ) : (
                item
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountList;