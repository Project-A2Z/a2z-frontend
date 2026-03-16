'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getLocale } from "@/services/api/language";
//styles
import styles from '@/components/UI/Profile/leftSection/Orders/order.module.css';
import Image, { StaticImageData } from "next/image";

interface ItemCardProps {
  id : string;
  image: string | string[] ;
  name: string;
  price: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ image, name, price , id}) => {
  const [imageError, setImageError] = useState(false);
  // console.log('ItemCard props - image:', image, 'name:', name, 'price:', price, 'id:', id);
  const t = useTranslations('order.itemCard');
  const isRTL = getLocale() === 'ar';
  const router = useRouter();

    const handleCardClick = () => {
      router.push(`/product/${id}`);
    };


  // Extract first image URL from array or use string directly
  const getImageSrc = () => {
    if (Array.isArray(image)) {
      return image[0] || '';
    }
    return image;
  };

  const src = getImageSrc();

  // Fallback placeholder
  const placeholderImage = '/acessts/NoImage.jpg';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={styles.item_card} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <Image 
        src={imageError ? placeholderImage : src} 
        alt={name} 
        className={styles.item_image}
        onError={handleImageError}
        width={100}
        height={100}
        priority
        quality={100}
      />
      <div className={styles.item_details}>
        <span className={styles.item_name}>{name}</span>
        <span className={styles.item_price}>{price}</span>
        <span className={styles.more} onClick={handleCardClick}>
         {t('buyAgain')}
        </span>
      </div>
    </div>
  );
};

export default ItemCard;