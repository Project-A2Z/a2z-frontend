"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Header.module.css';
import "../../../app/globals.css";

// Import your authentication service
import { getCurrentUser, isUserAuthenticated, logoutUser } from '../../../services/auth/login';

// Components
import SearchComponent from './../../UI/search/search';
import LanguageSelector from './../../UI/Language/language';
import { Button } from '../../UI/Buttons/Button';

// Icons
import Logo from './../../../public/icons/logo.svg';
import Heart from './../../../public/icons/Header/Heart.svg';
import Cart from './../../../public/icons/Header/Cart Large 2.svg';
import Notification from './../../../public/icons/Header/Bell Bing.svg';
import SearchIcon from './../../../public/icons/Header/Rounded Magnifer.svg';
import MessageCircle from './../../../public/icons/Header/float-btn.svg';
import MessIcon from './../../../public/icons/Header/float-btn (1).svg';

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

interface HeaderProps {
  className?: string;
  variant?: 'default' | 'auth' | 'minimal' | 'transparent';
  customStyles?: React.CSSProperties;
  showSearch?: boolean;
  showUserActions?: boolean;
  dataSearch?: any[];
}

function Header({ 
  className = '',
  variant = 'default',
  customStyles = {},
  showSearch = true,
  showUserActions = true,
  dataSearch = [],
}: HeaderProps) {
  const router = useRouter();
  
  // State for user data - will be populated from localStorage
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(dataSearch);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [chat, setChat] = useState(false);
  const [open, setOpen] = useState(false);

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

  const getUserInitial = (firstName: string, lastName: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  };

  const handleLogin = (): void => {
    console.log('Redirecting to login...');
    router.push('/login'); // Changed from /register to /login
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call the logout service to clear localStorage and make API call
      await logoutUser();
      
      // Update local state
      setUser(null);
      
      console.log('✅ User logged out successfully');
      
      // Redirect to home page or login page
      router.push('/');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout API fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = () => {
    setChat(!chat);
    setOpen(!open);
  };

  const handleNotificationClick = (): void => {
    console.log('Notification clicked');
    router.push('/notifications');
  };

  const handleSearchClick = (): void => {
    console.log('Search clicked');
    setIsSearchModalOpen(true);
  };

  // Get variant-specific classes
  const getVariantClass = (): string => {
    switch (variant) {
      case 'auth':
        return styles.headerAuth;
      case 'minimal':
        return styles.headerMinimal;
      case 'transparent':
        return styles.headerTransparent;
      default:
        return '';
    }
  };

  // Combine all classes
  const headerClasses = `${styles.header} ${getVariantClass()} ${className}`.trim();

  // Check if user is authenticated
  const isAuthenticated = user !== null && !isLoading;

  // Show loading state during initial load
  if (isLoading && showUserActions) {
    return (
      <header className={headerClasses} style={customStyles}>
        <div className={styles.left}>
          <Link href="/" className={styles.logoLink}>
            <Logo className={styles.logo} />
          </Link>
          <LanguageSelector />
        </div>

        {showSearch && (
          <div className={styles.mid}>
            <SearchComponent data={data} />
          </div>
        )}

        <div className={styles.right}>
          <div className={styles.loadingSpinner}>
            {/* You can replace this with your loading component */}
            <span>...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Main Header */}
      <header className={headerClasses} style={customStyles}>
        <div className={styles.left}>
          <Link href="/" className={styles.logoLink}>
            <Logo className={styles.logo} />
          </Link>
          <LanguageSelector />
        </div>

        {showSearch && (
          <div className={styles.mid}>
            <SearchComponent data={data} />
          </div>
        )}

        <div className={styles.right}>
          {showUserActions && (
            <>
              {isAuthenticated && user ? (
                <>
                  <nav className={styles.navs}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNotificationClick}
                      className={styles.notification_btn}
                      leftIcon={<Notification className={styles.icon} />}
                    >
                      <span className={styles.navText}>الإشعارات</span>
                    </Button>
                   
                    <Link href="/favorites" className={styles.navLink}>
                      <Heart className={styles.icon} />
                      <span className={styles.navText}>المفضلة</span>
                    </Link>
                    
                    <Link href="/cart" className={styles.navLink}>
                      <Cart className={styles.icon} />
                      <span className={styles.navText}>عربة التسوق</span>
                    </Link>
                  </nav>
                  
                  <div className={styles.prof}>
                    <div className={styles.userDropdown}>
                      <div 
                        className={styles.avatar} 
                        onClick={() => router.push('/profile')}
                        title={`${getUserDisplayName(user.firstName, user.lastName)}`}
                      >
                        {user.image ? (
                          <Image 
                            src={user.image} 
                            alt="User Avatar" 
                            width={40} 
                            height={40} 
                            className={styles.avatarImage} 
                          />
                        ) : (
                          <span className={styles.initial}>
                            {getUserInitial(user.firstName, user.lastName)}
                          </span>
                        )}
                        
                      </div>
                      
                    </div>
                  </div>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleLogin}
                  className={styles.loginButton}
                  rounded={true}
                >
                  تسجيل الدخول
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      {showUserActions && (
        <nav className={styles.bottomNav}>
          <div className={styles.bottomNavContent}>
            {/* Search Icon */}
            {showSearch && (
              <button
                onClick={handleSearchClick}
                className={styles.bottomNavItem}
              >
                <SearchIcon className={styles.bottomNavIcon} />
                <span className={styles.bottomNavText}>البحث</span>
              </button>
            )}
            
            {isAuthenticated && user && (
              <>
                {/* Notification */}
                <button
                  onClick={handleNotificationClick}
                  className={styles.bottomNavItem}
                >
                  <Notification className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>الإشعارات</span>
                </button>

                {/* Favorites */}
                <Link href="/favorites" className={styles.bottomNavItem}>
                  <Heart className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>المفضلة</span>
                </Link>
                
                {/* Cart */}
                <Link href="/cart" className={styles.bottomNavItem}>
                  <Cart className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>السلة</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Center Floating Button */}
          <div className={styles.MessageCircle}>
            {chat ? (
              <MessIcon onClick={handleChat}/>
            ):(
              <MessageCircle onClick={handleChat}/>
            )}
            {open && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setOpen(false)}
                  aria-hidden="true"
                />

                {/* Modal Content */}
                <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-primary text-white p-4 text-center relative">
                    <h2 className="text-lg font-bold">للشكاوى والاستفسارات</h2>
                    <button 
                      onClick={() => setOpen(false)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
                      aria-label="إغلاق"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form */}
                  <form className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="الاسم"
                          defaultValue={user ? getUserDisplayName(user.firstName, user.lastName) : ''}
                          className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="رقم الهاتف"
                          defaultValue={user?.phoneNumber || ''}
                          className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        defaultValue={user?.email || ''}
                        className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        placeholder="اكتب الشكوى أو الاستفسار لنتمكن من تقديم المساعدة"
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-6 rounded-full transition-colors"
                      >
                        إرسال
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Full Screen Search Modal */}
      {isSearchModalOpen && (
        <SearchComponent 
          data={data} 
          isModal={true} 
          onClose={() => setIsSearchModalOpen(false)}
        />
      )}
    </>
  );
}

export default Header;