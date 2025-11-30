"use client"
import { useMemo, useCallback, useState } from 'react';
import type { StaticImageData } from "next/image";

import styles from '@/components/UI/Card/card.module.css';

// Components
import { CustomImage } from '@/components/UI/Image/Images';
import Availablity from '@/components/UI/Card/Availablity';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import Alert from '@/components/UI/Alert/alert';

// Import Product type and helper function
import type { Product } from '@/services/product/products';
import { getProductUnitLabel } from '@/services/product/products';

// Sample Image
import Img from '@/public/acessts/NoImage.jpg';

// Icons
const EHEART_SRC = '/icons/emptyHeart.svg';
const FHEART_SRC = '/icons/FilledHeart.svg';
import { useRouter } from 'next/navigation';

interface CardProps {
    productImg?: string | StaticImageData;
    productName?: string;
    productCategory?: string;
    productPrice?: string;
    originalPrice?: string;
    discount?: number;
    productId?: string;
    available?: boolean;
    rating?: number;
    reviewsCount?: number;
    badge?: string;
    isLoading?: boolean;
    // Unit type props - pass the whole product or individual flags
    product?: Product;
    IsKG?: boolean;
    IsTON?: boolean;
    IsLITER?: boolean;
    IsCUBIC_METER?: boolean;
}

// Helper function to format price
const formatPrice = (price: string | number | undefined): string => {
    if (!price) return '0';
    const numericPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, ''))
        : price;
    
    if (isNaN(numericPrice)) return '0';
    
    return numericPrice.toLocaleString('ar-EG');
};

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

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
    isLoading = false,
    product,
    IsKG,
    IsTON,
    IsLITER,
    IsCUBIC_METER
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
        return typeof productImg === 'string' ? productImg : (productImg?.src || '/acessts/NoImage.jpg');
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

    // Get unit label using helper function
    const unitLabel = useMemo(() => {
        if (product) {
            return getProductUnitLabel(product);
        }
        // Fallback to individual props
        const mockProduct: Partial<Product> = {
            IsKG,
            IsTON,
            IsLITER,
            IsCUBIC_METER
        };
        return getProductUnitLabel(mockProduct as Product);
    }, [product, IsKG, IsTON, IsLITER, IsCUBIC_METER]);

    const onHeartClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id || isLoading) return;

        const { UserStorage } = require('@/services/auth/login');
        const user = UserStorage.getUser();

        if (!user) {
            setShowLoginAlert(true);
            return;
        }

        toggle({
            id,
            name: productName || 'منتج',
            price: numericPrice,
            image: imageSrc,
        });
    }, [id, toggle, productName, numericPrice, imageSrc, isLoading]);

    const handleLoginConfirm = useCallback(() => {
        setShowLoginAlert(false);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }, [router]);

    const handleLoginCancel = useCallback(() => {
        setShowLoginAlert(false);
    }, []);

    const handleCardClick = useCallback(() => {
        if (isLoading) return;
        const target = productId ? String(productId) : (productName || '');
        const slug = encodeURIComponent(target);
        router.push(`/product/${slug}`);
    }, [router, productName, productId, isLoading]);

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
                            width={240}
                            height={240}
                            rounded="md"
                            className={styles.img}
                            objectFit="cover"
                            priority
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                        />
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
                        title={productName}
                        onClick={handleCardClick}
                    >
                        {productName || 'اسم المنتج'} 
                    </h2>
                    
                    {/* Price section with unit */}
                    <div className={styles.priceSection}>
                        <div className={styles.currentPrice}>
                            {formatPrice(productPrice)}
                            <span className={styles.currency}> ج.م</span>
                            {unitLabel && (
                                <span className={styles.unitLabel}> / {unitLabel}</span>
                            )}
                        </div>
                        
                        {numericOriginalPrice && numericOriginalPrice > numericPrice && (
                            <div className={styles.originalPrice}>
                                {formatPrice(originalPrice)}
                                <span className={styles.currency}> ج.م</span>
                                {unitLabel && (
                                    <span className={styles.unitLabel}> / {unitLabel}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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