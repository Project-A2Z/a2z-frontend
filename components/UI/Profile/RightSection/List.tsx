'use client';
import React , {useState}from 'react';
import styles from './../profile.module.css';




interface AccountListProps {
  onItemClick?: (item: string) => void;
}

const AccountList: React.FC<AccountListProps> = ({ onItemClick }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const menuItems = [
    'تفاصيل الحساب',
    'تغيير كلمة المرور',
    'عناوينك',
    'طلباتك',
    'رسائلك',
    'مدفوعاتك',
    'تسجيل الخروج'
  ];

  const handleItemClick = (item: string, index: number) => {
    setSelectedIndex(index);
    onItemClick?.(item);
  };

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
              }`}
              onClick={() => handleItemClick(item, index)}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountList;