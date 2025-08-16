"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import "../../../app/globals.css";
import Image from 'next/image';
import SearchComponent from './../../UI/search/search';
import LanguageSelector from './../../UI/Language/language';
import { Button } from '../../UI/Buttons/Button';
import Logo from './../../../public/icons/logo.svg';
import Heart from './../../../public/icons/emptyHeart.svg';
import Cart from './../../../public/icons/Cart Large 2.svg';
import Notification from './../../../public/icons/notification.svg';

interface HeaderProps {
  className?: string;
  variant?: 'default' | 'auth' | 'minimal' | 'transparent';
  customStyles?: React.CSSProperties;
  showSearch?: boolean;
  showUserActions?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  className = '',
  variant = 'default',
  customStyles = {},
  showSearch = true,
  showUserActions = true
}) => {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'أحمد محمد', avatar: null });
//     const [user, setUser] = useState({ name: '', avatar: null });
  const [data, setData] = useState([]);

  const getUserInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const handleLogin = () => {
    console.log('Redirecting to register...');
    router.push('/register');
  };

  const handleLogout = () => {
    setUser({ name: '', avatar: null });
    console.log('User logged out');
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
    // Add your notification logic here
  };

  // Get variant-specific classes
  const getVariantClass = () => {
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

  return (
    <div className={headerClasses} style={customStyles}>
      <div className={styles.left}>
        {showUserActions && user && user.name ? (
          <>
            <div className={styles.prof}>
              <Link href="/profile">
                <div className={styles.avatar}>
                  {user.avatar ? (
                    <Image src={user.avatar} alt="User Avatar" width={40} height={40} className={styles.avatarImage} />
                  ) : (
                    <span className={styles.initial}>{getUserInitial(user.name)}</span>
                  )}
                  
                </div>  
                
              </Link>
            </div>
            <div className={styles.navs}>
              <Link href="/cart" className={styles.navLink}>
                <Cart className={styles.icon} />
                <span className={styles.navText}>عربة التسوق</span>
              </Link>
              <Link href="/favorites" className={styles.navLink}>
                <Heart className={styles.icon} />
                <span className={styles.navText}>المفضلة</span>
              </Link>
              {/* Using custom Button component for notification */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className={styles.notification_btn}
                leftIcon={<Notification className={styles.icon} />}
              >
                <span className={styles.navText}>الإشعارات</span>
              </Button>
            </div>
          </>
        ) : showUserActions ? (
          <>
            {/* Using custom Button component for login - Fixed */}
            <Button
              variant="primary"
              size="md"
              onClick={handleLogin}
              className={styles.loginButton}
              rounded={true}
            >
              تسجيل الدخول
            </Button>
          </>
        ) : null}
      </div>

      {showSearch && (
        <div className={styles.mid}>
          <SearchComponent data={data} />
        </div>
      )}

      <div className={styles.right}>
        <LanguageSelector />
        <Link href="/" className={styles.logoLink}>
          <Logo className={styles.logo} />
        </Link>
      </div>
    </div>
  );
};

export default Header;