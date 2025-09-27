'use client';
import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { useRouter } from 'next/navigation';
//components
import Header from '@/components/Layout/Nav/Header';
import TopMetrics from './sections/TopScetion/Top';
import InformationSection from './sections/informationSection.tsx/InformationSection';
import AccountList from '@/components/UI/Profile/RightSection/List';
import EditProfileSection from './sections/EditProfile/EditProfileSection';
// import Footer from '../HomePage/sections/FooterSection/Footer';
import { getCurrentUser, isUserAuthenticated, logoutUser } from './../../services/auth/login';

//icons
import Heart from './../../public/icons/HeartProf.svg';
import Cart from './../../public/icons/CartProf.svg';
import Star from './../../public/icons/StarProf.svg';

//interfaces
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

const ProfilePage = () => {
  const router = useRouter();
  const [box, setBox] = useState(''); // Default empty string will show Welcome component
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMain, setShowMobileMain] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

   // Load user data from localStorage when component mounts
  useEffect(() => {
    const loadUserData = () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated and get user data
        if (isUserAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
          console.log('✅ User data loaded:', userData);
        } else {
          setUser(null);
          console.log('ℹ️ No user found or not authenticated');
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data' || e.key === 'auth_token') {
        // Reload user data when storage changes
        if (isUserAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mobile navigation
  const handleMobileNavigation = (selectedBox : any) => {
    setBox(selectedBox);
    if (isMobile && selectedBox) {
      setShowMobileMain(true);
    }
  };

  const handleMobileBack = () => {
    setShowMobileMain(false);
    setBox('');
  };

  // Back button SVG icon
  const BackIcon = () => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );

  return (
    <div className={styles.profile_page}>  
      {/* <Header /> */}
      
      <TopMetrics
        metrics={[
          {
            icon: <Heart />,
            number: 120,
            title: 'المنتجات المفضلة',
            className: styles.metric1,
            onClick: () => { router.push('/favorites'); }
          },
          {
            icon: <Cart />,
            number: 350,
            title: 'عدد الطلبات',
            className: styles.metric2,
            onClick: () => { router.push('/'); }
          },
          {
            icon: <Star />,
            number: 104,
            title: 'التقييمات',
            className: styles.metric3,
            onClick: () => { router.push('/'); }
          },
        ]}
        className={styles.metric_card}
      />

      <div className={styles.mid}>
        <div className={`${styles.right_section} ${isMobile && showMobileMain ? styles.mobile_hidden : ''}`}>
        <InformationSection userProp={user}/>
        <hr />
        <AccountList 
          onItemClick={handleMobileNavigation} 
          user={user} 
          setUser={setUser} 
        />
      </div>

      <div className={`${styles.main} ${isMobile && showMobileMain ? styles.mobile_active : ''}`}>
        {/* Mobile Back Button */}
        {isMobile && showMobileMain && (
          <div className={styles.mobile_back_button} onClick={handleMobileBack}>
            <BackIcon />
            <span>العودة</span>
          </div>
        )}
        
        <EditProfileSection box={box} setBox={setBox}  />
      </div>
      </div>

      {/* <Footer/> */}
    </div>
  );
}

export default ProfilePage;