'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react'; // Import NextAuth signOut
import styles from './Logout.module.css';

interface LogoutProps {
  onCancel?: (value: string) => void;
  onLogout?: () => void;
}

export default function Logout({ onCancel, onLogout }: LogoutProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      // Call your custom logout function (clears localStorage)
      if (onLogout) {
        await onLogout();
      }
      
      // Sign out from NextAuth (clears Google/Facebook session)
      //console.log('🚪 Signing out from NextAuth...');
      await signOut({ 
        redirect: false // Don't redirect automatically
      });
      
      //console.log('✅ NextAuth signout complete');
      
      // Redirect to login page
      router.push('/login');
      
    } catch (error) {
      //console.error('❌ Logout error:', error);
      // Still try to redirect even if there's an error
      router.push('/login');
    }
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