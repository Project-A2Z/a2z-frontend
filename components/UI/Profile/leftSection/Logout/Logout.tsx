'use client';

import { useRouter } from 'next/navigation';
import styles from './Logout.module.css';

interface LogoutProps {
  onCancel?: (value : string) => void;

}

export default function Logout({ onCancel }: LogoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
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