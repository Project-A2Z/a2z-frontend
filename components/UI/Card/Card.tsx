"use client"
import { useMemo, useCallback } from 'react';
import type { StaticImageData } from "next/image";

import styles from './card.module.css'
import { CustomImage } from './../Image/Images'
import Availablity from './Availablity';
import { useFavorites } from '@/services/favorites/FavoritesContext';

// Icons (use static paths to avoid requiring SVGR)
const EHEART_SRC = '/icons/emptyHeart.svg';
const FHEART_SRC = '/icons/FilledHeart.svg';
import { useRouter } from 'next/navigation';

interface CardProps {
    productImg?: string | StaticImageData;
    productName?: string;
    productCategory?: string;
    productPrice?: string;
    productId?: string;
    available?: boolean;
}

// This is already a function component, but here's a cleaner version
function Card({ productImg , productName , productCategory , productPrice , productId , available } : CardProps) {
    const { toggle, isFavorite } = useFavorites();
    const router = useRouter();

    const numericPrice = useMemo(() => {
        const n = parseFloat(String(productPrice ?? '0').replace(/[^0-9.]/g, ''));
        return isNaN(n) ? 0 : n;
    }, [productPrice]);

    const imageSrc: string = useMemo(() => {
        return typeof productImg === 'string' ? productImg : (productImg?.src || '/images/placeholder.jpg');
    }, [productImg]);

    const id = useMemo(() => productId || productName || imageSrc, [productId, productName, imageSrc]);

    const loved = isFavorite(id!);

    const onHeartClick = useCallback(() => {
        if (!id) return;
        toggle({
            id,
            name: productName || 'منتج',
            price: numericPrice,
            image: imageSrc,
        });
    }, [id, toggle, productName, numericPrice, imageSrc]);

    return (
        <div className={styles.card} >
            <div className={styles.cardHeader}>
                <div className={styles.icon}>
                    {loved ? (
                        <img
                            src={FHEART_SRC}
                            onClick={onHeartClick}
                            className={styles.heartIcon}
                            role="button"
                            aria-label="Remove from favorites"
                            alt="favorite"
                        />
                    ) : (
                        <img
                            src={EHEART_SRC}
                            onClick={onHeartClick}
                            className={styles.heartIcon}
                            role="button"
                            aria-label="Add to favorites"
                            alt="not favorite"
                        />
                    )}
                </div>
                
                <div
                    className={styles.cardImage}
                    onClick={() => {
                        const slug = encodeURIComponent(productName || String(productId || ''));
                        router.push(`/product/${slug}`);
                    }}
                >
                    <CustomImage
                    src={imageSrc}
                    alt={productName || 'Product image'}
                    width={192}
                    height={192}
                    rounded="md"
                    className={styles.img}
                    objectFit="cover" 
                />
                </div>
                
                
                <div className={styles.available}>
                    <Availablity available={available} />
                </div>
            </div>
            
            <div className={styles.cardBody}>
                <div className={styles.category}>
                    <span className={styles.categoryText}>{productCategory}</span>
                </div>
                <h2 className={styles.productName}>
                    {productName || 'Product Name'} 
                </h2>
                <h3 className={styles.productName}>{productPrice}ج</h3>
            </div>
            
            
        </div>
    );
}

export default Card;