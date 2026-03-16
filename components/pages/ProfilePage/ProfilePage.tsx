"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import styles from "./profile.module.css";
import { useRouter } from "next/navigation";


// Components
import TopMetrics from "./sections/TopScetion/Top";
import InformationSection from "./sections/InformationSection/InformationSection";
import AccountList from "@/components/UI/Profile/RightSection/List";

const EditProfileSection = dynamic(
  () => import("./sections/EditProfile/EditProfileSection"),
  {
    loading: () => (
      <div className={styles.loading_container}>
        <div className={styles.loading_spinner}></div>
        <p>{/* loaded dynamically, no t() available here */}</p>
      </div>
    ),
    ssr: false,
  }
);

// Services
import { getCurrentUser } from "@/services/auth/login";
import { ProfileService } from "@/services/profile/profile";

// Icons
import Heart from "@/public/icons/HeartProf.svg";
import Cart from "@/public/icons/CartProf.svg";
import Star from "@/public/icons/StarProf.svg";

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
  const t = useTranslations("profile.page");
  const router = useRouter();

  const [box, setBox] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMain, setShowMobileMain] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    warningMessage: null as string | null,
    isTokenExpiringSoon: false,
    remainingMinutes: 0,
  });

  useEffect(() => {
    setIsMounted(true);
    const initializeAuth = async () => {
      try {
        const { useAuthMonitor } = await import(
          "@/components/providers/useAuthMonitor"
        );
      } catch (error) {
        console.error("Error loading auth monitor:", error);
      }
    };
    initializeAuth();
  }, []);

  const fetchUserProfile = useCallback(async () => {
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
        setError(t("error.sessionExpired"));
        return;
      }
      if (error.isNetworkError) {
        setError(t("error.networkError"));
      } else {
        setError(error.message || t("error.fetchFailed"));
      }

      const localUser = getCurrentUser();
      if (localUser) setUser(localUser);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isMounted) return;
    const localUser = getCurrentUser();
    if (localUser) {
      setUser(localUser);
      setIsLoading(false);
    }
    fetchUserProfile();
  }, [isMounted, fetchUserProfile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 150);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleMobileNavigation = useCallback(
    (selectedBox: string) => {
      setBox(selectedBox);
      if (isMobile && selectedBox) setShowMobileMain(true);
    },
    [isMobile]
  );

  const handleMobileBack = useCallback(() => {
    setShowMobileMain(false);
    setBox("");
  }, []);

  const BackIcon = useMemo(
    () => () => (
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
    ),
    []
  );

  const handleRetry = useCallback(() => {
    setError(null);
    fetchUserProfile();
  }, [fetchUserProfile]);

  const metricsData = useMemo(
    () => [
      {
        icon: <Heart />,
        number: user?.favoriteItems || 0,
        title: t("metrics.favorites"),
        className: styles.metric1,
        onClick: () => router.push("/favorites"),
      },
      {
        icon: <Cart />,
        number: user?.OrderCount || 0,
        title: t("metrics.orders"),
        className: styles.metric2,
        onClick: () => setBox("طلباتك"),
      },
      {
        icon: <Star />,
        number: user?.reviewsCount || 0,
        title: t("metrics.reviews"),
        className: styles.metric3,
        onClick: () => setBox("رسائلك"),
      },
    ],
    [user?.favoriteItems, user?.OrderCount, user?.reviewsCount, router, t]
  );

  if (isLoading && !user) {
    return (
      <div className={styles.profile_page}>
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}></div>
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={styles.profile_page}>
        <div className={styles.error_container}>
          <div className={styles.error_icon}>⚠️</div>
          <h3>{t("error.title")}</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retry_button}>
            {t("error.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile_page}>
      {authState.warningMessage && (
        <div className={`${styles.error_banner} ${styles.warning_banner}`}>
          <span>⚠️ {authState.warningMessage}</span>
          <button
            onClick={() =>
              setAuthState((prev) => ({ ...prev, warningMessage: null }))
            }
          >
            {t("banner.close")}
          </button>
        </div>
      )}

      {error && user && (
        <div className={styles.error_banner}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>{t("banner.close")}</button>
        </div>
      )}

      <TopMetrics metrics={metricsData} className={styles.metric_card} />

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
          {isMobile && showMobileMain && (
            <div
              className={styles.mobile_back_button}
              onClick={handleMobileBack}
            >
              <BackIcon />
              <span>{t("back")}</span>
            </div>
          )}

          <EditProfileSection
            box={box}
            setBox={setBox}
            user={user}
            setUser={setUser}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfilePage);