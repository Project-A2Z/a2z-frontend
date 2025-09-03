"use client"
import { useState } from 'react';
import type { StaticImageData } from "next/image";

import styles from './card.module.css'
import { CustomImage } from './../Image/Images'
import Availablity from './Availablity';

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
    const [loved, setLoved] = useState(false);

    const router = useRouter();
    
    const toggleLoved = () => {
        setLoved(prev => !prev);
    };

    return (
        <div className={styles.card} >
            <div className={styles.cardHeader}>
                <div className={styles.icon}>
                    {loved ? (
                        <img
                            src={FHEART_SRC}
                            onClick={toggleLoved}
                            className={styles.heartIcon}
                            role="button"
                            aria-label="Remove from favorites"
                            alt="favorite"
                        />
                    ) : (
                        <img
                            src={EHEART_SRC}
                            onClick={toggleLoved}
                            className={styles.heartIcon}
                            role="button"
                            aria-label="Add to favorites"
                            alt="not favorite"
                        />
                    )}
                </div>
                
                <div className={styles.cardImage} onClick={() => router.push(`/${productId}`)}>
                    <CustomImage
                    src={
                        typeof productImg === 'string'
                            ? productImg
                            : productImg?.src || '/images/placeholder.jpg'
                    }
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