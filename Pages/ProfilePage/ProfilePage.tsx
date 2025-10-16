"use client";
import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";

// Components
import Header from "@/components/Layout/Nav/Header";
import TopMetrics from "./sections/TopScetion/Top";
import InformationSection from "./sections/informationSection.tsx/InformationSection";
import AccountList from "@/components/UI/Profile/RightSection/List";
import EditProfileSection from "./sections/EditProfile/EditProfileSection";

// Services
import {
  getCurrentUser,
  isUserAuthenticated,
  logoutUser,
} from "./../../services/auth/login";
import { ProfileService, UserProfile } from "./../../services/profile/profile";

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Fetch user profile data from API
   */
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!isUserAuthenticated()) {
        console.log("❌ User not authenticated, redirecting to login...");
        router.push("/login");
        return;
      }

      console.log("🔄 Fetching user profile from API...");

      // Fetch profile from API
      const response = await ProfileService.getProfile();

      if (response.status === "success" && response.data.user) {
        const profileData = response.data.user;
        console.log("✅ Profile data fetched successfully:", profileData);

        // Convert UserProfile to User type for component compatibility
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
        console.log("💾 User state updated with profile data");
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error: any) {
      console.error("❌ Error fetching profile:", error);

      // Handle specific errors
      if (error.statusCode === 401) {
        // Token expired or invalid - redirect to login
        console.log("🔒 Authentication failed, redirecting to login...");
        setError("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");

        // Clear auth data and redirect after a delay
        setTimeout(() => {
          logoutUser();
          router.push("/login");
        }, 2000);
      } else if (error.isNetworkError) {
        setError("خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك.");
      } else {
        setError(error.message || "حدث خطأ أثناء جلب بيانات الملف الشخصي");
      }

      // Fallback to localStorage data if API fails (not auth error)
      if (error.statusCode !== 401) {
        console.log("ℹ️ Falling back to localStorage data...");
        const localUser = getCurrentUser();
        if (localUser) {
          setUser(localUser);
          console.log("💾 Using cached user data from localStorage");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user data on component mount
   */
  useEffect(() => {
    // Initial load - check localStorage first for instant display
    const localUser = getCurrentUser();
    if (localUser) {
      setUser(localUser);
      console.log("💾 Loaded cached user data from localStorage");
    }

    // Then fetch fresh data from API
    fetchUserProfile();
  }, []);

  /**
   * Listen for storage changes (when user logs in/out in another tab)
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "auth_token") {
        console.log("🔄 Storage changed, reloading profile...");

        if (isUserAuthenticated()) {
          fetchUserProfile();
        } else {
          setUser(null);
          router.push("/login");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Check if screen is mobile size
   */
  useEffect(() => {
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

  // Show error state
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
      {/* <Header /> */}

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
              // router.push("/cart");
              setBox("طلباتك");
            },
          },
          {
            icon: <Star />,
            number: user?.reviewsCount || 0,
            title: "التقييمات",
            className: styles.metric3,
            onClick: () => {
              // router.push("/");
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
            // refreshProfile={refreshProfile}
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

          <EditProfileSection
            box={box}
            setBox={setBox}
            user={user}
            setUser={setUser}
            // refreshProfile={refreshProfile}
          />
        </div>
      </div>

      {/* <Footer/> */}
    </div>
  );
};

export default ProfilePage;
