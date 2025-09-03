import React from "react";
import styles from './order.module.css'

interface InfoCardProps {
    orderNumber: string;
    // id: string;
    // icon: React.ReactNode;
    orderPrice: string;
    orderDate: string;
    address: string;
    phone: string;
    name: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ orderNumber, orderPrice, address, phone, name  , orderDate}) => {
    return (
        <div className={styles.info_card}>
            <span>رقم الطلب: {orderNumber}</span>
            <span>السعر: {orderPrice}</span>
            <span>تم تقديم الطلب في: {orderDate}</span>
            
            <span>العنوان: {address}</span>
            <span>رقم الهاتف: {phone}</span>
            <span>الاسم: {name}</span>

        </div>
    )

}
export default InfoCard;