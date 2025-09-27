'use client';

import { useRouter } from 'next/navigation';
import styles from './Logout.module.css';
import { on } from 'events';

interface LogoutProps {
  onCancel?: (value : string) => void;
  onLogout?: () => void;
}

export default function Logout({ onCancel , onLogout}: LogoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    onLogout?.();
    router.push('/');
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel('');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.question}>
          هل تريد تسجيل الخروج ؟
        </div>
        
        <div className={styles.buttonGroup}>
          <button 
            className={`${styles.button} ${styles.logoutButton}`}
            onClick={handleLogout}
          >
            تسجيل الخروج
          </button>
          
          <button 
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}