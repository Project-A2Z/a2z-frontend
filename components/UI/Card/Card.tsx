"use client"
import { useMemo, useCallback, useState } from 'react';
import type { StaticImageData } from "next/image";

import styles from './card.module.css'
import { CustomImage } from './../Image/Images'
import Availablity from './Availablity';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import { isAuthenticated } from '@/utils/auth';
import Alert from './../Alert/alert';



import Img from './../../../public/acessts/Logo-picsart.png'

// const Img = './../../../public/acessts/Logo-picsart.png'

// Icons (use static paths to avoid requiring SVGR)
const EHEART_SRC = '/icons/emptyHeart.svg';
const FHEART_SRC = '/icons/FilledHeart.svg';
import { useRouter } from 'next/navigation';

interface CardProps {
    productImg?: string | StaticImageData ;
    productName?: string;
    productCategory?: string;
    productPrice?: string;
    originalPrice?: string;
    discount?: number;
    productId?: string;
    available?: boolean;
    rating?: number;
    reviewsCount?: number;
    badge?: string; // For "New", "Sale", etc.
    isLoading?: boolean;
}

// Helper function to format price
const formatPrice = (price: string | number | undefined): string => {
    if (!price) return '0';
    const numericPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, ''))
        : price;
    
    if (isNaN(numericPrice)) return '0';
    
    // Format with thousands separator
    return numericPrice.toLocaleString('ar-EG');
};

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Star rating component
const StarRating = ({ rating, reviewsCount }: { rating?: number, reviewsCount?: number }) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={styles.ratingContainer}>
            <div className={styles.stars}>
                {/* Full stars */}
                {Array.from({ length: fullStars }, (_, i) => (
                    <span key={`full-${i}`} className={styles.starFull}>★</span>
                ))}
                {/* Half star */}
                {hasHalfStar && <span className={styles.starHalf}>★</span>}
                {/* Empty stars */}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <span key={`empty-${i}`} className={styles.starEmpty}>☆</span>
                ))}
            </div>
            {reviewsCount && reviewsCount > 0 && (
                <span className={styles.reviewsCount}>({reviewsCount})</span>
            )}
        </div>
    );
};

// This is already a function component, but here's a cleaner version
function Card({ 
    productImg= Img, 
    productName, 
    productCategory, 
    productPrice, 
    originalPrice,
    discount,
    productId, 
    available = true,
    rating,
    reviewsCount,
    badge,
    isLoading = false
}: CardProps) {
    const { toggle, isFavorite } = useFavorites();
    const router = useRouter();
    const [showLoginAlert, setShowLoginAlert] = useState(false);

    const numericPrice = useMemo(() => {
        const n = parseFloat(String(productPrice ?? '0').replace(/[^0-9.]/g, ''));
        return isNaN(n) ? 0 : n;
    }, [productPrice]);

    const numericOriginalPrice = useMemo(() => {
        if (!originalPrice) return null;
        const n = parseFloat(String(originalPrice).replace(/[^0-9.]/g, ''));
        return isNaN(n) ? null : n;
    }, [originalPrice]);

    const imageSrc: string = useMemo(() => {
        return typeof productImg === 'string' ? productImg : (productImg?.src || '/images/placeholder.jpg');
    }, [productImg]);

    const id = useMemo(() => productId || productName || imageSrc, [productId, productName, imageSrc]);

    const loved = isFavorite(id!);

    const discountPercentage = useMemo(() => {
        if (discount) return discount;
        if (numericOriginalPrice && numericPrice) {
            return calculateDiscountPercentage(numericOriginalPrice, numericPrice);
        }
        return 0;
    }, [discount, numericOriginalPrice, numericPrice]);

    const onHeartClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigation when clicking heart
        if (!id || isLoading) return;

        // Check if user is authenticated using UserStorage
        const { UserStorage } = require('@/services/auth/login');
        const user = UserStorage.getUser();

        if (!user) {
            // Show custom alert for unauthenticated users
            setShowLoginAlert(true);
            return;
        }

        // User is authenticated, proceed with toggle
        toggle({
            id,
            name: productName || 'منتج',
            price: numericPrice,
            image: imageSrc,
        });
    }, [id, toggle, productName, numericPrice, imageSrc, isLoading, router]);

    const handleLoginConfirm = useCallback(() => {
        setShowLoginAlert(false);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }, [router]);

    const handleLoginCancel = useCallback(() => {
        setShowLoginAlert(false);
    }, []);

    const handleCardClick = useCallback(() => {
        if (isLoading) return;
        // Prefer navigating by productId for server route /product/[id]
        const target = productId ? String(productId) : (productName || '');
        const slug = encodeURIComponent(target);
        router.push(`/product/${slug}`);
    }, [router, productName, productId, isLoading]);

    // Loading skeleton
    if (isLoading) {
        return (
            <div className={`${styles.card} ${styles.loading}`}>
                <div className={styles.cardHeader}>
                    <div className={styles.skeletonImage}></div>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.skeletonCategory}></div>
                    <div className={styles.skeletonName}></div>
                    <div className={styles.skeletonPrice}></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`${styles.card} ${!available ? styles.unavailable : ''}`}>
                {/* Badges */}
                {badge && (
                    <div className={styles.badge}>
                        {badge}
                    </div>
                )}
                
                {discountPercentage > 0 && (
                    <div className={styles.discountBadge}>
                        -{discountPercentage}%
                    </div>
                )}

                <div className={styles.cardHeader}>
                    <div className={styles.icon}>
                        {loved ? (
                            <img
                                src={FHEART_SRC}
                                onClick={onHeartClick}
                                className={styles.heartIcon}
                                role="button"
                                aria-label="إزالة من المفضلة"
                                alt="مفضل"
                            />
                        ) : (
                            <img
                                src={EHEART_SRC}
                                onClick={onHeartClick}
                                className={styles.heartIcon}
                                role="button"
                                aria-label="إضافة إلى المفضلة"
                                alt="غير مفضل"
                            />
                        )}
                    </div>
                    
                    <div
                        className={styles.cardImage}
                        onClick={handleCardClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleCardClick();
                            }
                        }}
                    >
                        <CustomImage
                            src={imageSrc}
                            alt={productName || 'صورة المنتج'}
                            width={192}
                            height={192}
                            rounded="md"
                            className={styles.img}
                            objectFit="cover" 
                        />
                        
                        {/* Hover overlay */}
                        <div className={styles.hoverOverlay}>
                            <span className={styles.viewDetails}>عرض التفاصيل</span>
                        </div>
                    </div>
                    
                    <div className={styles.available}>
                        <Availablity available={available} />
                    </div>
                </div>
                
                <div className={styles.cardBody}>
                    <div className={styles.category}>
                        <span className={styles.categoryText}>{productCategory || 'غير محدد'}</span>
                    </div>
                    
                    <h2 
                        className={styles.productName}
                        title={productName} // Show full name on hover
                        onClick={handleCardClick}
                    >
                        {productName || 'اسم المنتج'} 
                    </h2>
                    
                    {/* Rating */}
                    <StarRating rating={rating} reviewsCount={reviewsCount} />
                    
                    {/* Price section */}
                    <div className={styles.priceSection}>
                        <div className={styles.currentPrice}>
                            {formatPrice(productPrice)}
                            <span className={styles.currency}>ج</span>
                        </div>
                        
                        {numericOriginalPrice && numericOriginalPrice > numericPrice && (
                            <div className={styles.originalPrice}>
                                {formatPrice(originalPrice)}
                                <span className={styles.currency}>ج</span>
                            </div>
                        )}
                    </div>
                    
                    
                    
                </div>
            </div>

            {/* Login Alert */}
            {showLoginAlert && (
                <Alert
                message="يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة."
                setClose={handleLoginCancel}
                buttons={[
                    { 
                    label: 'إلغاء', 
                    onClick: handleLoginCancel, 
                    variant: 'ghost' 
                    },
                    { 
                    label: 'تسجيل الدخول', 
                    onClick: handleLoginConfirm, 
                    variant: 'primary' 
                    }
                ]}
                type="warning"
            />
            )}
        </>
    );
}

export default Card;