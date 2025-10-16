'use client';
import React, { useState } from "react";
import Image from "next/image";
import styles from './order.module.css'

interface ItemCardProps {
  image: string | { src: string; alt?: string };
  name: string;
  price: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ image, name, price }) => {
  const [imageError, setImageError] = useState(false);
  
  // Extract image URL and alt text
  const getImageData = () => {
    if (typeof image === 'string') {
      return {
        src: image,
        alt: name
      };
    }
    return {
      src: image.src,
      alt: image.alt || name
    };
  };

  const { src, alt } = getImageData();

  // Fallback placeholder
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="16" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={styles.item_card}>
      <img 
        src={imageError ? placeholderImage : src} 
        alt={alt} 
        className={styles.item_image}
        onError={handleImageError}
      />
      <div className={styles.item_details}>
        <span className={styles.item_name}>{name}</span>
        <span className={styles.item_price}>{price}</span>
        <span className={styles.more}>قم بالشراء مرة اخرى</span>
      </div>
    </div>
  );
};

export default ItemCard;