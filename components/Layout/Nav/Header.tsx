"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Header.module.css';
import "../../../app/globals.css";
// import Dock from './Dock';

// Components
import SearchComponent from './../../UI/search/search';
import LanguageSelector from './../../UI/Language/language';
import { Button } from '../../UI/Buttons/Button';

// Icons
import Logo from './../../../public/icons/logo.svg';
import Heart from './../../../public/icons/Header/Heart.svg';
import Cart from './../../../public/icons/Header/Cart Large 2.svg';
import Notification from './../../../public/icons/Header/Bell Bing.svg';
import SearchIcon from './../../../public/icons/Header/Rounded Magnifer.svg'; // 
import  MessageCircle  from './../../../public/icons/Header/float-btn.svg';
import MessIcon from './../../../public/icons/Header/float-btn (1).svg'

interface HeaderProps {
  className?: string;
  variant?: 'default' | 'auth' | 'minimal' | 'transparent';
  customStyles?: React.CSSProperties;
  showSearch?: boolean;
  showUserActions?: boolean;
  dataSearch?: any[]; // Assuming this is the data for search component
}

// Already a function component! Here's the cleaned up version:
function Header({ 
  className = '',
  variant = 'default',
  customStyles = {},
  showSearch = true,
  showUserActions = true
  , dataSearch = []
}: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'أحمد محمد', avatar: null as string | null });
  // const [user, setUser] = useState({ name: '', avatar: null as string | null });
  const [data, setData] = useState(dataSearch);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [chat , setChat ] = useState(false)
  const [open , setOpen] = useState(false)

  // const items = [
  //   { icon  : <Heart className={styles.icon} />, label: 'المفضلة', link: '/favorites' },
  //   { icon  : <Cart className={styles.icon} />, label: 'عربة التسوق', link: '/cart' },
  //   { icon  : <Notification className={styles.icon} />, label: '  الإشعارات', link: '/notifications' },

  // ]

  const getUserInitial = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const handleLogin = (): void => {
    console.log('Redirecting to register...');
    router.push('/register');
  };

  const handleLogout = (): void => {
    setUser({ name: '', avatar: null });
    console.log('User logged out');
  };

  const handleChat = () => {
    setChat(!chat)
    setOpen(!open)
  }

  const handleNotificationClick = (): void => {
    console.log('Notification clicked');
    // Add your notification logic here
  };

  const handleSearchClick = (): void => {
    console.log('Search clicked');
    setIsSearchModalOpen(true);
    // Add your search logic here - could open a modal, navigate to search page, etc.
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
  const isAuthenticated = user?.name;

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
              {isAuthenticated ? (
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
                    <Link href="/profile">
                      <div className={styles.avatar} onClick={()=> router.push('/profile')}>
                        {user.avatar ? (
                          <Image 
                            src={user.avatar} 
                            alt="User Avatar" 
                            width={40} 
                            height={40} 
                            className={styles.avatarImage} 
                          />
                        ) : (
                          <span className={styles.initial}>
                            {getUserInitial(user.name)}
                          </span>
                        )}
                      </div>  
                    </Link>
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
            
            {isAuthenticated && (
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
              
              <MessIcon onClick={ handleChat}/>

            ):(
              <MessageCircle onClick={ handleChat}/>
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
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
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