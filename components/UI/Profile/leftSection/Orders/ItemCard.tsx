'use client';
import React from "react";

import styles from './order.module.css'

interface ItemCardProps {
image: string;
name: string;
price: string;

}

const ItemCard: React.FC<ItemCardProps> = ({ image, name, price }) => {
    return (
        <div className={styles.item_card}>
            <img src={image} alt={name} className={styles.item_image} />
            <div className={styles.item_details}>
                <span className={styles.item_name}>{name}</span>
                <span className={styles.item_price}>{price}</span>
                <span className={styles.more}>قم بالشراء مرة اخرى</span>
            </div>
        </div>
    )
}
export default ItemCard;