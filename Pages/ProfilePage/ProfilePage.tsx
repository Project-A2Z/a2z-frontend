"use client";
import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";

// Components
import TopMetrics from "@/pages/ProfilePage/sections/TopScetion/Top";
import InformationSection from "@/pages/ProfilePage/sections/InformationSection/InformationSection";
import AccountList from "@/components/UI/Profile/RightSection/List";
import EditProfileSection from "@/pages/ProfilePage/sections/EditProfile/EditProfileSection";

// Services
import { getCurrentUser } from "../../services/auth/login";
import { ProfileService } from "../../services/profile/profile";

// Icons
import Heart from "./../../public/icons/HeartProf.svg";
import Cart from "./../../public/icons/CartProf.svg";
import Star from "./../../public/icons/StarProf.svg";

// Interfaces
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
  favoriteItems?: number;
  reviewsCount?: number;
  OrderCount?: number;
}

const ProfilePage = () => {
  const router = useRouter();
  const [box, setBox] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMain, setShowMobileMain] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Auth monitor state
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    warningMessage: null as string | null,
    isTokenExpiringSoon: false,
    remainingMinutes: 0,
  });

  // Initialize auth monitor only on client side
  useEffect(() => {
    setIsMounted(true);

    // Dynamically import and initialize useAuthMonitor
    const initializeAuth = async () => {
      try {
        const { useAuthMonitor } = await import(
          "../../components/providers/useAuthMonitor"
        );

        // This is a simplified version - you may need to adjust based on your actual hook
        // Since hooks can't be called conditionally, you might need to refactor this
        // For now, we'll just set a flag that we're mounted
      } catch (error) {
        console.error("Error loading auth monitor:", error);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Fetch user profile data from API
   */
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ProfileService.getProfile();

      if (response.status === "success" && response.data.user) {
        const profileData = response.data.user;

        const userData: User = {
          _id: profileData._id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber,
          image: profileData.image,
          isEmailVerified: profileData.isEmailVerified,
          address: profileData.addresses || [],
          role: profileData.role,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
          favoriteItems: profileData?.favoriteItems || 0,
          reviewsCount: profileData.reviewsCount || 0,
          OrderCount: profileData.OrderCount || 0,
        };

        setUser(userData);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: any) {
      if (error.statusCode === 401) {
        setError("انتهت صلاحية الجلسة. جاري تسجيل الخروج...");
        return;
      }

      if (error.isNetworkError) {
        setError("خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك.");
      } else {
        setError(error.message || "حدث خطأ أثناء جلب بيانات الملف الشخصي");
      }

      const localUser = getCurrentUser();
      if (localUser) {
        setUser(localUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user data on component mount
   */
  useEffect(() => {
    if (!isMounted) return;

    const localUser = getCurrentUser();
    if (localUser) {
      setUser(localUser);
    }

    fetchUserProfile();
  }, [isMounted]);

  /**
   * Check if screen is mobile size
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Handle mobile navigation
   */
  const handleMobileNavigation = (selectedBox: any) => {
    setBox(selectedBox);
    if (isMobile && selectedBox) {
      setShowMobileMain(true);
    }
  };

  const handleMobileBack = () => {
    setShowMobileMain(false);
    setBox("");
  };

  /**
   * Back button SVG icon
   */
  const BackIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );

  /**
   * Retry button
   */
  const handleRetry = () => {
    setError(null);
    fetchUserProfile();
  };

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className={styles.profile_page}>
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading && !user) {
    return (
      <div className={styles.profile_page}>
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Show error state (only if no user data available)
  if (error && !user) {
    return (
      <div className={styles.profile_page}>
        <div className={styles.error_container}>
          <div className={styles.error_icon}>⚠️</div>
          <h3>حدث خطأ</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retry_button}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile_page}>
      {/* Session warning banner */}
      {authState.warningMessage && (
        <div className={`${styles.error_banner} ${styles.warning_banner}`}>
          <span>⚠️ {authState.warningMessage}</span>
          <button
            onClick={() =>
              setAuthState((prev) => ({ ...prev, warningMessage: null }))
            }
          >
            ✕
          </button>
        </div>
      )}

      {/* Error notification banner */}
      {error && user && (
        <div className={styles.error_banner}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <TopMetrics
        metrics={[
          {
            icon: <Heart />,
            number: user?.favoriteItems || 0,
            title: "المنتجات المفضلة",
            className: styles.metric1,
            onClick: () => {
              router.push("/favorites");
            },
          },
          {
            icon: <Cart />,
            number: user?.OrderCount || 0,
            title: "عدد الطلبات",
            className: styles.metric2,
            onClick: () => {
              setBox("طلباتك");
            },
          },
          {
            icon: <Star />,
            number: user?.reviewsCount || 0,
            title: "التقييمات",
            className: styles.metric3,
            onClick: () => {
              setBox("رسائلك");
            },
          },
        ]}
        className={styles.metric_card}
      />

      <div className={styles.mid}>
        <div
          className={`${styles.right_section} ${
            isMobile && showMobileMain ? styles.mobile_hidden : ""
          }`}
        >
          <InformationSection userProp={user} />
          <hr />
          <AccountList
            onItemClick={handleMobileNavigation}
            user={user}
            setUser={setUser}
          />
        </div>

        <div
          className={`${styles.main} ${
            isMobile && showMobileMain ? styles.mobile_active : ""
          }`}
        >
          {/* Mobile Back Button */}
          {isMobile && showMobileMain && (
            <div
              className={styles.mobile_back_button}
              onClick={handleMobileBack}
            >
              <BackIcon />
              <span>العودة</span>
            </div>
          )}

          {(() => {
            const C = EditProfileSection as unknown as React.ComponentType<{
              box: string;
              setBox: React.Dispatch<React.SetStateAction<string>>;
              user: User | null;
              setUser: React.Dispatch<React.SetStateAction<User | null>>;
            }>;
            return (
              <C box={box} setBox={setBox} user={user} setUser={setUser} />
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
