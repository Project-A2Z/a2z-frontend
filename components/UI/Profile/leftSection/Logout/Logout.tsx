'use client';

// import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { AuthService } from '@/services/auth/login';
import styles from '@/components/UI/Profile/leftSection/Logout/Logout.module.css';
import { getLocale } from '@/services/api/language';

interface LogoutProps {
  onCancel?: (value: string) => void;
  onLogout?: () => void;
}

export default function Logout({ onCancel }: LogoutProps) {
  const t = useTranslations('profile.left');
  // const router = useRouter();
  const isRtl = getLocale() === 'ar';
  const handleLogout = async () => {
    try {
      sessionStorage.setItem('user_logged_out', 'true');
      sessionStorage.removeItem('social_login_pending');
      await AuthService.logout();
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('❌ Logout error:', error);
      sessionStorage.setItem('user_logged_out', 'true');
      AuthService.clearAuthData();
      window.location.href = '/';
    }
  };

  return (
    <div className={styles.overlay} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className={styles.container} style={{ textAlign: isRtl ? 'right' : 'left' }}>
        <div className={styles.question}  style={{ textAlign: isRtl ? 'right' : 'left' }}>
          {t('logout.question')}
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.logoutButton}`}
            onClick={handleLogout}
          >
            {t('logout.confirm')}
          </button>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={() => onCancel?.('')}
          >
            {t('logout.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}