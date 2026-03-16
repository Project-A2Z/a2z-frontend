'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getLocale } from '@/services/api/language';

// styles
import styles from '@/components/UI/Profile/profile.module.css';

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
  const t = useTranslations('profile.list');

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isRtl = getLocale() === 'ar';

  /**
   * `value` is the Arabic key used by EditProfileSection's switch-case — do NOT translate it.
   * `label` is the display text shown to the user — translated via t().
   */
  const menuItems: { value: string; label: string }[] = [
    { value: 'تفاصيل الحساب',      label: t('menu.accountDetails') },
    { value: 'تغيير كلمة المرور',  label: t('menu.changePassword') },
    { value: 'عناوينك',             label: t('menu.addresses') },
    { value: 'طلباتك',              label: t('menu.orders') },
    { value: 'رسائلك',              label: t('menu.messages') },
    // { value: 'مدفوعاتك',          label: t('menu.payments') },
    { value: 'تسجيل الخروج',       label: t('menu.logout') },
  ];

  const handleItemClick = (value: string, index: number) => {
    setSelectedIndex(index);
    onItemClick?.(value);
  };

  if (!user) {
    return (
      <div className={styles.container_list}>
        <div className={styles.list}>
          <div className={styles.listItem}>{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container_list} style={{ textAlign: isRtl ? 'right' : 'left' , direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className={styles.list}>
        {menuItems.map(({ value, label }, index) => {
          const isLogout = value === 'تسجيل الخروج';
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
              onClick={() => handleItemClick(value, index)}
              style={{
                cursor: isLoggingOut && isLogout ? 'not-allowed' : 'pointer',
                opacity: isLoggingOut && isLogout ? 0.6 : 1,
                direction: isRtl ? 'rtl' : 'ltr',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {isLoggingOut && isLogout ? (
                <span>{t('loggingOut')}</span>
              ) : (
                label
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountList;