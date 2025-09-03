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

interface EditProfileSectionProps {
  box: string;
  setBox?: (value: string) => void;
  className?: any; 
}

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ box, setBox }) => {
 
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
        return <Logout onCancel={setBox} />; 
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