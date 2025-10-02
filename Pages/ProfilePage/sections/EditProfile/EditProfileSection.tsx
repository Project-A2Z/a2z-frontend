'use client';
import React, { useState, useEffect } from 'react';
import styles from './../../profile.module.css';

//components
import InfoDetails from '../../../../components/UI/Profile/leftSection/Information/InfoDetails';
import PassChange from '../../../../components/UI/Profile/leftSection/PassChange/PassChange';
import Address from '@/components/UI/Profile/leftSection/Address/Address';
import Orders from '@/components/UI/Profile/leftSection/Orders/Orders';
import MessagesList from '@/components/UI/Profile/leftSection/Messages/MessagesList';
import Payments from '@/components/UI/Profile/leftSection/Payments/Payments';
import Welcome from '@/components/UI/Profile/leftSection/Welcome/Welcome';
import Logout from '@/components/UI/Profile/leftSection/Logout/Logout';

//interfaces and services
import { logoutUser, AuthService } from './../../../../services/auth/login';
import orderService, { TransformedOrder } from './../../../../services/profile/orders';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orders, setOrders] = useState<TransformedOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Fetch orders when the "طلباتك" tab is selected
  useEffect(() => {
    const fetchOrders = async () => {
      if (box === 'طلباتك') {
        setIsLoadingOrders(true);
        setOrdersError(null);
        
        try {
          // Debug authentication
          console.log('🔍 Starting orders fetch...');
          orderService.debugAuth();
          
          const apiOrders = await orderService.getUserOrders();
          const transformedOrders = orderService.transformOrders(apiOrders);
          setOrders(transformedOrders);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          setOrdersError(error instanceof Error ? error.message : 'فشل في تحميل الطلبات');
          setOrders([]);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    fetchOrders();
    console.log ('user in EditProfileSection', user);
  }, [box]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🚪 Starting logout process...');
      console.log('📦 Before logout - localStorage:', {
        user: localStorage.getItem('user_data'),
        token: localStorage.getItem('auth_token'),
        refreshToken: localStorage.getItem('refresh_token')
      });
      
      await logoutUser();
      
      console.log('📦 After logout - localStorage:', {
        user: localStorage.getItem('user_data'),
        token: localStorage.getItem('auth_token'),
        refreshToken: localStorage.getItem('refresh_token')
      });
      
      if (setUser) {
        setUser(null);
      }
      
      console.log('✅ Logout successful!');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      console.log('🧹 Manually clearing localStorage...');
      try {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        AuthService.clearAuthData();
        
        if (setUser) {
          setUser(null);
        }
        
        console.log('📦 After manual cleanup - localStorage:', {
          user: localStorage.getItem('user_data'),
          token: localStorage.getItem('auth_token'),
          refreshToken: localStorage.getItem('refresh_token')
        });
        
        window.location.href = '/login';
        
      } catch (clearError) {
        console.error('❌ Failed to clear auth data:', clearError);
        window.location.href = '/login';
      }
      
    } finally {
      setIsLoggingOut(false);
    }
  };
 
  // Function to render component based on box value
  const renderComponent = () => {
    switch (box) {
      case 'تفاصيل الحساب':
        return <InfoDetails 
          firstName={user?.firstName || ''}
          lastName={user?.lastName || ''}
          email={user?.email || ''}
          phone={user?.phoneNumber || ''}
        />;
      case 'تغيير كلمة المرور':
        return <PassChange />;
      case 'عناوينك':
        return <Address 
          Addresses={user?.address || []}
        />;
      case 'طلباتك':
        if (isLoadingOrders) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>جاري تحميل الطلبات...</p>
            </div>
          );
        }
        
        if (ordersError) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              <p>خطأ: {ordersError}</p>
              <button 
                onClick={() => setBox && setBox('طلباتك')}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
              >
                إعادة المحاولة
              </button>
            </div>
          );
        }
        
        return <Orders orders={orders} />;
      case 'رسائلك':
        return <MessagesList />;
      case 'مدفوعاتك':
        return <Payments />;
      case 'تسجيل الخروج':
        return <Logout onCancel={setBox} onLogout={handleLogout} />; 
      default:
        return <Welcome name={user?.firstName || ""} />;
    }
  };

  return (
    <div className={styles.edit_profile_section}>
      {renderComponent()}
    </div>
  );
}

export default EditProfileSection;