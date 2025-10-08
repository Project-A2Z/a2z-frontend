'use client'
import React, { useState, useEffect } from "react"
import { useSearchParams } from 'next/navigation'
import styles from './Checkout.module.css'

//components 
import Delivery from "@/components/UI/Chekout/Delivery"
import AddComponent from "@/components/UI/Chekout/Address"
import Cash, { PaymentData } from "@/components/UI/Chekout/Cash"
import OrderSummary from './../../components/UI/Chekout/OrderSummary'

// Import Address Service
import { AddressService, Address as ApiAddress } from '@/services/profile/address'

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
    const [editDelivery, setEditDelivery] = useState(true)
    const [editPayment, setEditPayment] = useState(true)
    
    // Payment data state
    const [paymentData, setPaymentData] = useState<PaymentData | undefined>();
    
    // Loading and error states
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
    const [addressError, setAddressError] = useState<string | null>(null)
    
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

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [def, setDef] = useState<Address | null>(null);

    // Function to convert API address to component Address format
    const convertApiAddressToLocal = (apiAddress: ApiAddress): Address => {
        return {
            id: parseInt(apiAddress._id) || 0,
            name: `${apiAddress.firstName} ${apiAddress.lastName}`,
            phone: apiAddress.phoneNumber,
            address: `${apiAddress.address}, ${apiAddress.city}, ${apiAddress.region}`,
            isDefault: apiAddress.isDefault || false,
            firstName: apiAddress.firstName,
            lastName: apiAddress.lastName,
            governorate: apiAddress.region,
            city: apiAddress.city
        };
    };

    // Load addresses from cache or API
    const loadAddresses = async (forceRefresh = false) => {
        setIsLoadingAddresses(true);
        setAddressError(null);

        try {
            if (!AddressService.isAuthenticated()) {
                console.log('⚠️ User not authenticated, using empty addresses');
                setAddresses([]);
                setDef(null);
                setIsLoadingAddresses(false);
                return;
            }

            if (!forceRefresh) {
                const cachedAddresses = AddressService.getCachedAddresses();
                if (cachedAddresses && cachedAddresses.length > 0) {
                    console.log('✅ Using cached addresses:', cachedAddresses.length);
                    const convertedAddresses = cachedAddresses.map(convertApiAddressToLocal);
                    setAddresses(convertedAddresses);
                    
                    const defaultAddr = convertedAddresses.find(addr => addr.isDefault);
                    setDef(defaultAddr || convertedAddresses[0]);
                    
                    setIsLoadingAddresses(false);
                    return;
                }
            }

            console.log('🌐 Fetching addresses from API');
            const apiAddresses = await AddressService.getAddresses(forceRefresh);
            
            if (apiAddresses && apiAddresses.length > 0) {
                console.log('✅ Loaded addresses from API:', apiAddresses.length);
                const convertedAddresses = apiAddresses.map(convertApiAddressToLocal);
                setAddresses(convertedAddresses);
                
                const defaultAddr = convertedAddresses.find(addr => addr.isDefault);
                setDef(defaultAddr || convertedAddresses[0]);
            } else {
                console.log('📭 No addresses found');
                setAddresses([]);
                setDef(null);
            }

        } catch (error: any) {
            console.error('❌ Error loading addresses:', error);
            setAddressError(error.message || 'فشل تحميل العناوين');
            
            const cachedAddresses = AddressService.getCachedAddresses();
            if (cachedAddresses && cachedAddresses.length > 0) {
                console.log('⚠️ Using cached addresses as fallback');
                const convertedAddresses = cachedAddresses.map(convertApiAddressToLocal);
                setAddresses(convertedAddresses);
                const defaultAddr = convertedAddresses.find(addr => addr.isDefault);
                setDef(defaultAddr || convertedAddresses[0]);
            } else {
                setAddresses([]);
                setDef(null);
            }
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    // Load checkout data from URL
    useEffect(() => {
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

    // Load addresses on component mount
    useEffect(() => {
        loadAddresses();
    }, []);

    // Update disabled state based on edit modes
    useEffect(() => {
        setDisabled(editDelivery || editPayment);
    }, [editDelivery, editPayment]);

    // Function to refresh addresses
    const handleRefreshAddresses = async () => {
        await loadAddresses(true);
    };

    // Handle payment data change
    const handlePaymentDataChange = (data: PaymentData) => {
        setPaymentData(data);
        console.log('💳 Payment data updated:', data);
    };

    // Show loading state for checkout data
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
            
            <div className={styles.right}>
                {addressError && addresses.length > 0 && (
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ color: '#856404', fontSize: '14px' }}>
                            ⚠️ {addressError} (عرض البيانات المخزنة)
                        </span>
                        <button 
                            onClick={handleRefreshAddresses}
                            style={{
                                padding: '6px 16px',
                                backgroundColor: '#ffc107',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            تحديث
                        </button>
                    </div>
                )}
                
                <AddComponent 
                    Addresses={addresses}
                    defaultAdd={def}
                    setDef={setDef}
                    isLoading={isLoadingAddresses}
                    onRefresh={handleRefreshAddresses}
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
                    onPaymentDataChange={handlePaymentDataChange}
                />
            </div>
            
            <div className={styles.left}>
                <OrderSummary 
                    numberItems={itemCount}
                    Total={total}
                    disabled={disabled}
                    addressData={def}
                    paymentData={paymentData}
                />
            </div>
        </div>
    )
}

export default Checkout;