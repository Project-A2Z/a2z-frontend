'use client'
import React, { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import styles from './Checkout.module.css'

//components 
import Delivery from "@/components/UI/Chekout/Delivery"
import AddComponent from "@/components/UI/Chekout/Address"
import Cash from "@/components/UI/Chekout/Cash"
import OrderSummary from './../../components/UI/Chekout/OrderSummary'

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  availability: string;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
  
  firstName?: string;
  lastName?: string;
  governorate?: string;
  city?: string;
}

const Checkout = ({}) => {
    const searchParams = useSearchParams();
    const [disabled, setDisabled] = useState(true)
    const [editDelivery, setEditDelivery] = useState(true) // Start with edit mode true
    const [editPayment, setEditPayment] = useState(true) // Add payment edit state
    
    // Function to format date in Arabic
    const formatDateInArabic = (date: Date) => {
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        
        return `${dayName} ${day} ${month}`;
    }

    // Calculate delivery dates
    const [delivery, setDelivery] = useState(() => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 1); 
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7); 
        
        return {
            price: 1000, 
            start: formatDateInArabic(startDate),
            ends: formatDateInArabic(endDate),
        };
    });

    // State to store the data from URL
    const [checkoutData, setCheckoutData] = useState<{
        itemCount: number;
        total: number;
        hasItems: boolean;
        order: Array<Item>;
    } | null>(null);

    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: 1,
            name: 'Menna Akram',
            phone: '01234567890',
            address: 'شارع الأول 123، الدقي، محافظة الجيزة',
            isDefault: true,
            firstName: 'Menna',
            lastName: 'Akram',
            governorate: 'الجيزة',
            city: 'الدقي'
        },
        {
            id: 2,
            name: 'Menna Akram',
            phone: '01234567890',
            address: 'شارع الورد 456، المعادي، محافظة القاهرة',
            firstName: 'Menna',
            lastName: 'Akram',
            governorate: 'القاهرة',
            city: 'المعادي'
        },
        {
            id: 3,
            name: 'Menna Akram',
            phone: '01234567890',
            address: 'شارع الحرية 321، المطرية، محافظة الشرقية',
            firstName: 'Menna',
            lastName: 'Akram',
            governorate: 'الشرقية',
            city: 'المطرية'
        },
        {
            id: 4,
            name: 'Menna Akram',
            phone: '01234567890',
            address: 'شارع النيل 789، المنيل، محافظة الأقصر',
            firstName: 'Menna',
            lastName: 'Akram',
            governorate: 'الأقصر',
            city: 'المنيل'
        }
    ]);
  
    // State to store the default address ID
    const [def, setDef] = useState<Address>(addresses[0]);

    useEffect(() => {
        // Get the data from URL parameters
        const dataParam = searchParams?.get('data');
        
        if (dataParam) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(dataParam));
                setCheckoutData(decodedData);
            } catch (error) {
                console.error('Error parsing checkout data:', error);
            }
        }
    }, [searchParams]);

    // Set default address when addresses are loaded
    useEffect(() => {
        const defaultAddress = addresses.find(address => address.isDefault);
        if (defaultAddress) {
            setDef(defaultAddress);
        }
    }, [addresses]);

    // Update disabled state based on edit modes
    useEffect(() => {
        // Enable order summary only when both delivery and payment are not in edit mode
        setDisabled(editDelivery || editPayment);
    }, [editDelivery, editPayment]);

    // Show loading or error state if no data
    if (!checkoutData) {
        return (
            <div className={styles.Container}>
                <div>Loading checkout data...</div>
            </div>
        );
    }

    const { itemCount, total, hasItems, order } = checkoutData;

    return (
        <div className={styles.Container}>
            <div className={styles.left}>
                <OrderSummary 
                    numberItems={itemCount}
                    Total={total}
                    disabled={disabled}
                />
                
            </div>
            <div className={styles.right}>
                <AddComponent 
                    Addresses={addresses}
                    defaultAdd={def}
                    setDef={setDef}
                />
                <Delivery 
                    deliveryInfo={delivery}
                    orders={order}
                    editProp={editDelivery}
                    setEditProp={setEditDelivery}
                />
                <Cash 
                    Total={total}
                    editProp={editPayment}
                    setEditProp={setEditPayment}
                />
            </div>
        </div>
    )
}

export default Checkout;