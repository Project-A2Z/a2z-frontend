import React from "react";
import { useTranslations } from "next-intl";
import { getLocale } from "@/services/api/language";

//styles
import styles from '@/components/UI/Profile/leftSection/Orders/order.module.css';

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
const InfoCard: React.FC<InfoCardProps> = ({ orderNumber, orderPrice, address, phone, name, orderDate }) => {
    const t = useTranslations('order.infoCard');
    const isRTL = getLocale() === 'ar';

    return (
        <div className={styles.info_card} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <span>{t('orderNumber')} {orderNumber}</span>
            <span>{t('price')} {orderPrice}</span>
            <span>{t('date')} {orderDate}</span>
            <span>{t('address')} {address}</span>
            <span>{t('phone')} {phone}</span>
            <span>{t('name')} {name}</span>
        </div>
    );
};
export default InfoCard;