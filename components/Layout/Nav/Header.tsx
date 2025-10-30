"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ ADD THIS
import Image from "next/image";
import styles from "./Header.module.css";
import "../../../app/globals.css";

// Import your authentication service
import {
  getCurrentUser,
  isUserAuthenticated,
  logoutUser,
  UserStorage,
  AuthService,
} from "../../../services/auth/login";

// Import products service
import { getProductsWithState, Product } from "../../../services/product/products";

// Components
import SearchComponent from "./../../UI/search/search";
import NotificationsComponent from "./../../UI/notification/notification";
import LanguageSelector from "./../../UI/Language/language";
import { Button } from "../../UI/Buttons/Button";

// Services
import { getUnreadNotificationsCount } from "../../../services/notifications/notification";

// Icons
import Logo from "./../../../public/icons/logo.svg";
import Heart from "./../../../public/icons/Header/Heart.svg";
import Cart from "./../../../public/icons/Header/Cart Large 2.svg";
import Notification from "./../../../public/icons/Header/Bell Bing.svg";
import SearchIcon from "./../../../public/icons/Header/Rounded Magnifer.svg";
import MessageCircle from "./../../../public/icons/Header/float-btn.svg";
import MessIcon from "./../../../public/icons/Header/float-btn (1).svg";

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
  variant?: "default" | "auth" | "minimal" | "transparent";
  customStyles?: React.CSSProperties;
  showSearch?: boolean;
  showUserActions?: boolean;
  dataSearch?: any[];
}

function Header({
  className = "",
  variant = "default",
  customStyles = {},
  showSearch = true,
  showUserActions = true,
  dataSearch = [],
}: HeaderProps) {
  const router = useRouter();
  const { data: session, status } = useSession(); // ✅ ADD THIS

  // State for user data
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chat, setChat] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ NEW: Handle session-based auth (for social login)
  useEffect(() => {
    const handleSocialAuth = async () => {
      // Check if we have a session with backend token
      if (session?.backendToken && session?.user?.backendUser) {
        console.log('✅ Header: Backend token found in session, saving to localStorage...');
        
        // Save using UserStorage methods (includes expiry tracking)
        UserStorage.saveUser(session.user.backendUser);
        UserStorage.saveToken(session.backendToken);
        
        // Update local state immediately
        setUser(session.user.backendUser);
        setIsLoading(false);
        
        // Start token monitoring
        AuthService.startTokenMonitoring(() => {
          console.log('🔒 Token expired - user needs to login again');
          setUser(null);
          router.push('/login');
        });
        
        console.log('✅ Header: User state updated from session');
      }
    };

    if (status !== 'loading') {
      handleSocialAuth();
    }
  }, [session, status, router]);

  // ✅ MODIFIED: Load user data from localStorage when component mounts
  useEffect(() => {
    const loadUserData = () => {
      try {
        setIsLoading(true);

        if (isUserAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
          console.log("✅ User data loaded:", userData);
        } else {
          setUser(null);
          console.log("ℹ️ No user found or not authenticated");
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load from localStorage if session is not loading
    if (status !== 'loading') {
      loadUserData();
    }
  }, [status]); // ✅ Add status as dependency

  // Fetch cached products for search
  useEffect(() => {
    const loadCachedProducts = async () => {
      try {
        setIsProductsLoading(true);
        const cachedProducts = await getProductsWithState();
        setProducts(cachedProducts);
        console.log(`✅ Loaded ${cachedProducts.length} products for search`);
      } catch (error) {
        console.error("❌ Error loading cached products:", error);
        setProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    };

    loadCachedProducts();
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchUnreadCount = async () => {
      if (!user || !isMounted) {
        console.log("⏭️ Skipping unread count fetch - no user or unmounted");
        return;
      }

      try {
        console.log("🔔 Fetching unread notification count");
        const count = await getUnreadNotificationsCount();
        
        if (isMounted) {
          setUnreadCount(count);
          console.log(`✅ Unread count updated: ${count}`);
        }
      } catch (error) {
        if (isMounted) {
          console.error("❌ Error fetching unread count:", error);
        }
      }
    };

    if (user) {
      console.log("⏰ Setting up unread count polling (5min interval)");
      
      fetchUnreadCount();

      intervalId = setInterval(() => {
        if (isMounted) {
          fetchUnreadCount();
        }
      }, 300000);
    }

    return () => {
      console.log("🧹 Cleaning up unread count polling");
      isMounted = false;
      
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, [user]);

  // ✅ MODIFIED: Listen for storage changes AND custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "auth_token") {
        if (isUserAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
          console.log("✅ Header: User updated from storage event");
        } else {
          setUser(null);
          console.log("✅ Header: User cleared from storage event");
        }
      }
    };

    // ✅ NEW: Listen for custom token expiry events
    const handleTokenExpiry = () => {
      console.log("🔒 Header: Token expired event received");
      setUser(null);
      router.push('/login');
    };

    // ✅ NEW: Listen for custom auth update events
    const handleAuthUpdate = () => {
      console.log("🔄 Header: Auth update event received");
      if (isUserAuthenticated()) {
        const userData = getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tokenExpired", handleTokenExpiry);
    window.addEventListener("authUpdated", handleAuthUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenExpired", handleTokenExpiry);
      window.removeEventListener("authUpdated", handleAuthUpdate);
    };
  }, [router]);

  const getUserInitial = (firstName: string, lastName: string): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (firstName: string, lastName: string): string => {
    return `${firstName} ${lastName}`.trim();
  };

  const handleLogin = (): void => {
    console.log("Redirecting to login...");
    router.push("/login");
  };

  const handleChat = () => {
    setChat(!chat);
    setOpen(!open);
  };

  const handleNotificationClick = (): void => {
    setIsNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false);
    if (user) {
      getUnreadNotificationsCount().then(setUnreadCount).catch(console.error);
    }
  };

  const handleSearchClick = (): void => {
    setIsSearchModalOpen(true);
  };

  const getVariantClass = (): string => {
    switch (variant) {
      case "auth":
        return styles.headerAuth;
      case "minimal":
        return styles.headerMinimal;
      case "transparent":
        return styles.headerTransparent;
      default:
        return "";
    }
  };

  const headerClasses = `${
    styles.header
  } ${getVariantClass()} ${className}`.trim();
  
  // ✅ MODIFIED: Also check session status
  const isAuthenticated = user !== null && !isLoading;

  // ✅ MODIFIED: Show loading while checking both localStorage and session
  if ((isLoading || status === 'loading') && showUserActions) {
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
            <SearchComponent data={[]} />
          </div>
        )}

        <div className={styles.right}>
          <div className={styles.loadingSpinner}>
            <span>...</span>
          </div>
        </div>
      </header>
    );
  }

  const searchData = products.length > 0 ? products : dataSearch;

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
            <SearchComponent data={searchData} />
          </div>
        )}

        <div className={styles.right}>
          {showUserActions && (
            <>
              {isAuthenticated && user ? (
                <>
                  <nav className={styles.navs}>
                    <div className={styles.notification_btn}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNotificationClick}
                        leftIcon={<Notification className={styles.icon} />}
                      >
                        <span className={styles.navText}>الإشعارات</span>
                      </Button>

                      {unreadCount > 0 && (
                        <div className={styles.unreadIndicator}>
                          {unreadCount > 99
                            ? "99+"
                            : unreadCount > 5
                            ? "5+"
                            : unreadCount}
                        </div>
                      )}
                    </div>

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
                        onClick={() => router.push("/profile")}
                        title={`${getUserDisplayName(
                          user.firstName,
                          user.lastName
                        )}`}
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
                <button
                  onClick={handleNotificationClick}
                  className={styles.bottomNavItem}
                >
                  <Notification className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>الإشعارات</span>

                  {unreadCount > 0 && (
                    <span className={styles.bottomNavBadge}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <NotificationsComponent
                  isOpen={isNotificationsOpen}
                  onClose={handleNotificationsClose}
                  onUnreadCountChange={setUnreadCount}
                />

                <Link href="/favorites" className={styles.bottomNavItem}>
                  <Heart className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>المفضلة</span>
                </Link>

                <Link href="/cart" className={styles.bottomNavItem}>
                  <Cart className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>السلة</span>
                </Link>
              </>
            )}
          </div>

          <div className={styles.MessageCircle}>
            {chat ? (
              <MessIcon onClick={handleChat} />
            ) : (
              <MessageCircle onClick={handleChat} />
            )}
            {open && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setOpen(false)}
                  aria-hidden="true"
                />

                <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
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

                  <form className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="الاسم"
                          defaultValue={
                            user
                              ? getUserDisplayName(
                                  user.firstName,
                                  user.lastName
                                )
                              : ""
                          }
                          className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="رقم الهاتف"
                          defaultValue={user?.phoneNumber || ""}
                          className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        defaultValue={user?.email || ""}
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

      <NotificationsComponent
        isOpen={isNotificationsOpen}
        onClose={handleNotificationsClose}
        onUnreadCountChange={setUnreadCount}
      />

      {isSearchModalOpen && (
        <SearchComponent
          data={searchData}
          isModal={true}
          onClose={() => setIsSearchModalOpen(false)}
        />
      )}
    </>
  );
}

export default Header;