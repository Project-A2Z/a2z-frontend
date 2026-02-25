"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import styles from "./Header.module.css";
import "./../../../app/globals.css";

// Import your authentication service
import {
  getCurrentUser,
  isUserAuthenticated,
  UserStorage,
  AuthService,
} from "../../../services/auth/login";

// Import products service
import {
  getProductsWithState,
  Product,
} from "../../../services/product/products";

// Components
import SearchComponent from "./../../UI/search/search";
import NotificationsComponent from "./../../UI/notification/notification";
import { Button } from "../../UI/Buttons/Button";

// Services
import { getUnreadNotificationsCount } from "../../../services/notifications/notification";
import cartService from "@/services/api/cart";

// Icons
import Logo from "@/public/logo/logo2.webp.png";
import Heart from "./../../../public/icons/Header/Heart.svg";
import Cart from "./../../../public/icons/Header/Cart Large 2.svg";
import Notification from "./../../../public/icons/Header/Bell Bing.svg";
import SearchIcon from "./../../../public/icons/Header/Rounded Magnifer.svg";
import MessageCircle from "./../../../public/icons/Header/float-btn.svg";
import MessIcon from "./../../../public/icons/Header/float-btn (1).svg";
import LanguageSelector from "@/components/UI/Language/language";

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

// ─── Navigation tabs definition ────────────────────────────────────────────────
const NAV_TABS = [
  { id: "home", label: "الرئيسية", href: "/" },
  // { id: "services", label: "الخدمات", href: "/#services" },
  { id: "products", label: "المنتجات", href: "/#products" },
  { id: "about", label: "من نحن", href: "/about" },
  { id: "contact", label: "تواصل معنا", href: "#footer" },
] as const;

type TabId = (typeof NAV_TABS)[number]["id"];

function Header({
  className = "",
  variant = "default",
  customStyles = {},
  showSearch = true,
  showUserActions = true,
  dataSearch = [],
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // ─── User state ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [chat, setChat] = useState(false);
  const [open, setOpen] = useState(false);

  // ─── Nav tab state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  // Derive active tab from current pathname
  useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    // else if (pathname?.startsWith("/services")) setActiveTab("services");
    else if (pathname?.startsWith("/products")) setActiveTab("products");
    else if (pathname?.startsWith("/about")) setActiveTab("about");
  }, [pathname]);

  // Update sliding indicator position whenever activeTab or window size changes
  const updateIndicator = useCallback(() => {
    const activeIndex = NAV_TABS.findIndex((t) => t.id === activeTab);
    const el = tabRefs.current[activeIndex];
    const nav = navRef.current;
    if (!el || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicatorStyle({
      width: elRect.width,
      left: elRect.left - navRect.left,
    });
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  // ─── Handle tab click ─────────────────────────────────────────────────────────
  const handleTabClick = (tab: (typeof NAV_TABS)[number]) => {
    setActiveTab(tab.id);

    // "تواصل معنا" → scroll to footer
    if (tab.id === "contact") {
      const footer = document.querySelector("footer");
      if (footer) {
        footer.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // Hash links (products, services, about) → navigate then scroll
    if (tab.href.startsWith("/#")) {
      const sectionId = tab.href.slice(2); // e.g. "products"
      if (pathname === "/") {
        // Already on homepage — just scroll
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Navigate to homepage first; scroll happens via hash
        router.push(tab.href);
      }
      return;
    }

    router.push(tab.href);
  };

  // ─── Auth effects (unchanged from original) ──────────────────────────────────
  useEffect(() => {
    const handleSocialAuth = async () => {
      if (session?.backendToken && session?.user?.backendUser) {
        UserStorage.saveUser(session.user.backendUser);
        UserStorage.saveToken(session.backendToken);
        setUser(session.user.backendUser);
        setIsLoading(false);
        AuthService.startTokenMonitoring(() => {
          setUser(null);
          router.push("/login");
        });
      }
    };
    if (status !== "loading") handleSocialAuth();
  }, [session, status]);

  useEffect(() => {
    const loadUserData = () => {
      try {
        setIsLoading(true);
        if (isUserAuthenticated()) {
          setUser(getCurrentUser());
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (status !== "loading") loadUserData();
  }, [status]);

  useEffect(() => {
    const loadCachedProducts = async () => {
      try {
        setIsProductsLoading(true);
        setProducts(await getProductsWithState());
      } catch {
        setProducts([]);
      } finally {
        setIsProductsLoading(false);
      }
    };
    loadCachedProducts();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    const fetchUnreadCount = async () => {
      if (!user || !isMounted) return;
      try {
        const count = await getUnreadNotificationsCount();
        if (isMounted) setUnreadCount(count);
      } catch {}
    };
    if (user) {
      fetchUnreadCount();
      intervalId = setInterval(() => {
        if (isMounted) fetchUnreadCount();
      }, 300000);
    }
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    const fetchCartCount = async () => {
      if (!user || !isMounted) return;
      try {
        const count = await cartService.getCartItemCount();
        if (isMounted) setCartCount(count);
      } catch {}
    };
    if (user) {
      fetchCartCount();
      intervalId = setInterval(() => {
        if (isMounted) fetchCartCount();
      }, 300000);
    } else {
      setCartCount(0);
    }
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "auth_token") {
        if (isUserAuthenticated()) setUser(getCurrentUser());
        else setUser(null);
      }
    };
    const handleTokenExpiry = () => {
      setUser(null);
      router.push("/login");
    };
    const handleAuthUpdate = () => {
      if (isUserAuthenticated()) setUser(getCurrentUser());
      else setUser(null);
    };
    const handleCartUpdate = async () => {
      try {
        setCartCount(await cartService.getCartItemCount());
      } catch {}
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tokenExpired", handleTokenExpiry);
    window.addEventListener("authUpdated", handleAuthUpdate);
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenExpired", handleTokenExpiry);
      window.removeEventListener("authUpdated", handleAuthUpdate);
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [router]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getUserInitial = (firstName: string, lastName: string) =>
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : (firstName || lastName || "U").charAt(0).toUpperCase();

  const getUserDisplayName = (firstName: string, lastName: string) =>
    `${firstName} ${lastName}`.trim();

  const handleLogin = () => router.push("/login");
  const handleChat = () => {
    setChat(!chat);
    setOpen(!open);
  };
  const handleNotificationClick = () => setIsNotificationsOpen(true);
  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false);
    if (user)
      getUnreadNotificationsCount().then(setUnreadCount).catch(console.error);
  };
  const handleSearchClick = () => setIsSearchModalOpen(true);

  const getVariantClass = () => {
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

  const headerWrapperClasses =
    `${styles.headerWrapper} ${getVariantClass()} ${className}`.trim();
  const isAuthenticated = user !== null && !isLoading;

  // ─── Loading skeleton ─────────────────────────────────────────────────────────
  if ((isLoading || status === "loading") && showUserActions) {
    return (
      <div className={headerWrapperClasses} style={customStyles}>
        <header className={styles.header}>
          <div className={styles.left}>
            <Link href="/" className={styles.logoLink}>
              <img src="/icons/logo.svg" alt="Logo" className={styles.logo} />
            </Link>
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
        {/* Skeleton nav */}
        <div className={styles.subNav} aria-hidden="true" />
      </div>
    );
  }

  const searchData = products.length > 0 ? products : dataSearch;

  return (
    <>
      {/* ── Wrapper keeps header + sub-nav together as a single fixed block ── */}
      <div className={headerWrapperClasses} style={customStyles}>
        {/* ── Main header bar ── */}
        <header className={styles.header}>
          <div className={styles.left}>
            <Link href="/" className={styles.logoLink}>
              <img src={Logo.src} alt="Logo" className={styles.logo} />
            </Link>
          </div>

          <LanguageSelector />

          {showSearch && (
            <div className={styles.mid}>
              <SearchComponent data={searchData} />
            </div>
          )}

          <div className={styles.right}>
            {showSearch && !isAuthenticated && (
              <div className={styles.mobileSearchBtn}>
                <button
                  onClick={handleSearchClick}
                  className={styles.searchIconBtn}
                  aria-label="البحث"
                >
                  <SearchIcon className={styles.searchIcon} />
                </button>
              </div>
            )}

            {showUserActions && (
              <>
                {isAuthenticated && user ? (
                  <>
                    <nav className={styles.navs}>
                      <div
                        className={`${styles.notification_btn} ${
                          unreadCount > 0 ? styles.hasNotification : ""
                        }`}
                        onClick={handleNotificationClick}
                      >
                        <Notification className={styles.icon} />
                        <span className={styles.navText}>الإشعارات</span>
                      </div>

                      <Link href="/favorites" className={styles.navLink}>
                        <Heart className={styles.icon} />
                        <span className={styles.navText}>المفضلة</span>
                      </Link>

                      <Link
                        href="/cart"
                        className={`${styles.navLink} ${
                          cartCount > 0 ? styles.hasNotification : ""
                        }`}
                      >
                        <Cart className={styles.icon} />
                        <span className={styles.navText}>عربة التسوق</span>
                      </Link>
                    </nav>

                    <div className={styles.prof}>
                      <div className={styles.userDropdown}>
                        <div
                          className={styles.avatar}
                          onClick={() => router.push("/profile")}
                          title={getUserDisplayName(
                            user.firstName,
                            user.lastName,
                          )}
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

        {/* ── Secondary sliding-indicator nav ── */}
        <div className={styles.subNav} ref={navRef} dir="rtl">
          {NAV_TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[index] = el;
              }}
              onClick={() => handleTabClick(tab)}
              className={`${styles.subNavItem} ${
                activeTab === tab.id ? styles.subNavItemActive : ""
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Sliding bottom border */}
          <span
            className={styles.subNavIndicator}
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
            }}
          />
        </div>
      </div>

      {/* ── Bottom Navigation for Mobile ── */}
      {showUserActions && user && (
        <nav className={styles.bottomNav}>
          {chat ? (
            <MessIcon
              onClick={handleChat}
              aria-label="فتح الدردشة"
              className={styles.MessageCircle}
            />
          ) : (
            <MessageCircle
              onClick={handleChat}
              aria-label="فتح الدردشة"
              className={styles.MessageCircle}
            />
          )}

          <div className={styles.bottomNavContent}>
            {isAuthenticated && user && (
              <>
                {showSearch && (
                  <button
                    onClick={handleSearchClick}
                    className={styles.bottomNavItem}
                    aria-label="البحث"
                  >
                    <SearchIcon className={styles.bottomNavIcon} />
                    <span className={styles.bottomNavText}>البحث</span>
                  </button>
                )}

                <button
                  onClick={handleNotificationClick}
                  className={styles.bottomNavItem}
                  aria-label="الإشعارات"
                >
                  <Notification className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>الإشعارات</span>
                  {unreadCount > 0 && (
                    <span className={styles.bottomNavBadge} />
                  )}
                </button>

                <Link
                  href="/favorites"
                  className={styles.bottomNavItem}
                  aria-label="المفضلة"
                >
                  <Heart className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>المفضلة</span>
                </Link>

                <Link
                  href="/cart"
                  className={styles.bottomNavItem}
                  aria-label="السلة"
                >
                  <Cart className={styles.bottomNavIcon} />
                  <span className={styles.bottomNavText}>السلة</span>
                  {cartCount > 0 && <span className={styles.bottomNavBadge} />}
                </Link>
              </>
            )}
          </div>

          {open && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-primary text-white p-4 text-center relative">
                  <h2 className="text-lg font-bold">للشكاوى والاستفسارات</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200 transition-colors"
                    aria-label="إغلاق"
                  >
                    ✕
                  </button>
                </div>
                <form className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="الاسم"
                      defaultValue={
                        user
                          ? getUserDisplayName(user.firstName, user.lastName)
                          : ""
                      }
                      className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="رقم الهاتف"
                      defaultValue={user?.phoneNumber || ""}
                      className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    defaultValue={user?.email || ""}
                    className="w-full rounded-full border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                  <textarea
                    rows={4}
                    placeholder="اكتب الشكوى أو الاستفسار لنتمكن من تقديم المساعدة"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                    required
                  />
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
