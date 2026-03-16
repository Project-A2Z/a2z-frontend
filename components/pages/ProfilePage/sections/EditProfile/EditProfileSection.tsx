'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './../../profile.module.css';
import { useTranslations } from 'next-intl';

// PERFORMANCE: Only import Welcome component (shown by default)
import Welcome from '@/components/UI/Profile/leftSection/Welcome/Welcome';

// A standalone loading fallback component — safe to use inside dynamic()
// because it calls useTranslations inside a proper component render cycle
const LoadingFallback = () => {
  const t = useTranslations('profile.left');
  return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</div>;
};

// PERFORMANCE: Lazy load ALL other components - they load ONLY when clicked
const InfoDetails = dynamic(
  () => import('@/components/UI/Profile/leftSection/Information/InfoDetails'),
  { loading: () => <LoadingFallback />, ssr: false }
);

const PassChange = dynamic(
  () => import('@/components/UI/Profile/leftSection/PassChange/PassChange'),
  { loading: () => <LoadingFallback />, ssr: false }
);

const Address = dynamic(
  () => import('@/components/UI/Profile/leftSection/Address/Address'),
  { loading: () => <LoadingFallback />, ssr: false }
);

const Orders = dynamic(
  () => import('@/components/UI/Profile/leftSection/Orders/Orders'),
  { loading: () => <LoadingFallback />, ssr: false }
);

const MessagesList = dynamic(
  () => import('@/components/UI/Profile/leftSection/Messages/MessagesList'),
  { loading: () => <LoadingFallback />, ssr: false }
);

const Logout = dynamic(
  () => import('@/components/UI/Profile/leftSection/Logout/Logout'),
  { loading: () => <LoadingFallback />, ssr: false }
);

// Services
import { logoutUser, AuthService } from '@/services/auth/login';
import orderService, { OrderItem } from '@/services/profile/orders';
import { updatePassword } from '@/services/profile/profile';
import { signOut } from 'next-auth/react';

interface User {
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
  favoriteItems?: number;
  reviewsCount?: number;
  OrderCount?: number;
}

interface EditProfileSectionProps {
  box: string;
  setBox?: (value: string) => void;
  className?: any;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
  user?: User | null;
}

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ box, setBox, user, setUser }) => {
  // ✅ Hook called inside the component — correct placement
  const t = useTranslations('profile.left');

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (box === 'طلباتك') {
        setIsLoadingOrders(true);
        setOrdersError(null);

        try {
          orderService.debugAuth();
          const apiOrders = await orderService.getUserOrders();
          setOrders(apiOrders);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          setOrdersError(error instanceof Error ? error.message : t('orders.fetchFailed'));
          setOrders([]);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    fetchOrders();
  }, [box, user]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      await signOut({ redirect: false });
      if (setUser) setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ Logout failed:', error);
      try {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        AuthService.clearAuthData();
        try {
          await signOut({ redirect: false });
        } catch (signOutError) {
          console.error('❌ NextAuth signout failed:', signOutError);
        }
        if (setUser) setUser(null);
        window.location.href = '/login';
      } catch (clearError) {
        console.error('❌ Failed to clear auth data:', clearError);
        window.location.href = '/login';
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.newPassword,
      });
    } catch (error) {
      console.error('❌ Password change failed:', error);
      throw error;
    }
  };

  const renderComponent = () => {
    if (!box || box === '') {
      return <Welcome name={user?.firstName || ''} />;
    }

    switch (box) {
      case 'تفاصيل الحساب':
        return (
          <InfoDetails
            firstName={user?.firstName || ''}
            lastName={user?.lastName || ''}
            email={user?.email || ''}
            phone={user?.phoneNumber || ''}
          />
        );

      case 'تغيير كلمة المرور':
        return <PassChange onChangePassword={handlePasswordChange} />;

      case 'عناوينك':
        return <Address Addresses={user?.address || []} />;

      case 'طلباتك':
        if (isLoadingOrders) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>{t('orders.loading')}</p>
            </div>
          );
        }
        if (ordersError) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              <p>{t('orders.error', { message: ordersError })}</p>
              <button
                onClick={() => setBox && setBox('طلباتك')}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
              >
                {t('orders.retry')}
              </button>
            </div>
          );
        }
        return <Orders orders={orders} />;

      case 'رسائلك':
        return <MessagesList />;

      case 'تسجيل الخروج':
        return <Logout onCancel={setBox} onLogout={handleLogout} />;

      default:
        return <Welcome name={user?.firstName || ''} />;
    }
  };

  return (
    <div className={styles.edit_profile_section}>
      {renderComponent()}
    </div>
  );
};

export default React.memo(EditProfileSection);