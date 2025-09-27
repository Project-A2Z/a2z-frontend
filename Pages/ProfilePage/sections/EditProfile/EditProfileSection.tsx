'use client';
import React, { useState } from 'react';
import styles from './../../profile.module.css';

//components
import InfoDetails from '../../../../components/UI/Profile/leftSection/Information/InfoDetails';
import PassChange from '../../../../components/UI/Profile/leftSection/PassChange/PassChange';
import Address from '@/components/UI/Profile/leftSection/Address/Address';
import Orders from '@/components/UI/Profile/leftSection/Orders/Orders';
// import MessageComponent from '@/components/UI/Profile/leftSection/Messages/Messages';
import MessagesList from '@/components/UI/Profile/leftSection/Messages/MessagesList';
import Payments from '@/components/UI/Profile/leftSection/Payments/Payments';
import Welcome from '@/components/UI/Profile/leftSection/Welcome/Welcome';
import Logout from '@/components/UI/Profile/leftSection/Logout/Logout';

//interfaces and services
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


interface EditProfileSectionProps {
  box: string;
  setBox?: (value: string) => void;
  className?: any; 
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
  user?: User | null;
}

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ box, setBox  ,user , setUser}) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
  // const [user, setUser] = useState<User | null>(null);


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('🚪 Starting logout process...');
      console.log('📦 Before logout - localStorage:', {
        user: localStorage.getItem('user_data'),
        token: localStorage.getItem('auth_token'),
        refreshToken: localStorage.getItem('refresh_token')
      });
      
      // Call the logout function from your auth service
      await logoutUser();
      
      console.log('📦 After logout - localStorage:', {
        user: localStorage.getItem('user_data'),
        token: localStorage.getItem('auth_token'),
        refreshToken: localStorage.getItem('refresh_token')
      });
      
      // Clear user state in parent component if setUser is provided
      if (setUser) {
        setUser(null);
      }
      
      console.log('✅ Logout successful!');
      
      // Force reload to ensure all components reset
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Manual cleanup if the logout function fails
      console.log('🧹 Manually clearing localStorage...');
      try {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        
        // Also try the AuthService method
        AuthService.clearAuthData();
        
        if (setUser) {
          setUser(null);
        }
        
        console.log('📦 After manual cleanup - localStorage:', {
          user: localStorage.getItem('user_data'),
          token: localStorage.getItem('auth_token'),
          refreshToken: localStorage.getItem('refresh_token')
        });
        
        // Force page reload to login
        window.location.href = '/login';
        
      } catch (clearError) {
        console.error('❌ Failed to clear auth data:', clearError);
        // Last resort - just redirect and let login page handle it
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
        return <InfoDetails />;
      case 'تغيير كلمة المرور':
        return <PassChange />;
      case 'عناوينك':
        return <Address />;
      case 'طلباتك':
        return <Orders />;
      case 'رسائلك':
        return <MessagesList />;
      case 'مدفوعاتك':
        return <Payments />;
      case 'تسجيل الخروج':
        return <Logout onCancel={setBox} onLogout={handleLogout} />; 
      default:
        return <Welcome name='أحمد' />;
    }
  };

  return (
    <div className={styles.edit_profile_section}>
      {renderComponent()}
    </div>
  );
}

export default EditProfileSection;