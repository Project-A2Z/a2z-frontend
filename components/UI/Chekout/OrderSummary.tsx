'use client'
import React, { useState } from "react";
import styles from './Style.module.css'
import { Button } from './../../UI/Buttons/Button'
import { useRouter } from 'next/navigation';
import { orderService, CreateOrderData} from '@/services/checkout/order';
import { getAuthToken } from '@/services/auth/login';
import { PaymentData } from './Cash';
import Alert, { AlertButton } from './../../UI/Alert/alert';

interface Address {
    id: number;
    name: string;
    phone: string;
    address: string;
    firstName?: string;
    lastName?: string;
    governorate?: string;
    city?: string;
}

interface SummaryInter {
    Total: number;
    delivery?: number;
    numberItems: number;
    disabled: boolean;
    addressData?: Address | null;
    paymentData?: PaymentData;
}

const Summary: React.FC<SummaryInter> = ({ 
    Total, 
    delivery = 0, 
    numberItems, 
    disabled,
    addressData,
    paymentData
}) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Alert state
    const [alertConfig, setAlertConfig] = useState<{
        show: boolean;
        message: string;
        type: 'warning' | 'error' | 'info' | 'success';
        buttons: AlertButton[];
    }>({
        show: false,
        message: '',
        type: 'info',
        buttons: []
    });

    const showAlert = (
        message: string, 
        type: 'warning' | 'error' | 'info' | 'success' = 'info',
        buttons?: AlertButton[]
    ) => {
        setAlertConfig({
            show: true,
            message,
            type,
            buttons: buttons || [
                {
                    label: 'حسناً',
                    onClick: () => setAlertConfig(prev => ({ ...prev, show: false })),
                    variant: 'primary'
                }
            ]
        });
    };

    const handleSubmit = async () => {
        // Validate data
        if (!addressData) {
            setError('يرجى تحديد عنوان التوصيل');
            showAlert('يرجى تحديد عنوان التوصيل', 'warning');
            return;
        }

        if (!paymentData || !paymentData.paymentWay) {
            setError('يرجى تحديد طريقة الدفع');
            showAlert('يرجى تحديد طريقة الدفع', 'warning');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Get auth token
            const token = getAuthToken();
            if (!token) {
                throw new Error('يرجى تسجيل الدخول أولاً');
            }
            orderService.setToken(token);

            // Parse name from address
            const nameParts = addressData.name.split(' ');
            const firstName = addressData.firstName || nameParts[0] || '';
            const lastName = addressData.lastName || nameParts.slice(1).join(' ') || '';

            // Prepare order data
            const orderData: CreateOrderData = {
                firstName,
                lastName,
                phoneNumber: addressData.phone,
                address: addressData.address,
                city: addressData.city || addressData.governorate || '',
                region: addressData.governorate || addressData.city || '',
                paymentStatus: paymentData.paymentStatus,
                paymentWay: paymentData.paymentWay,
                paymentWith: paymentData.paymentWith,
                NumOperation: paymentData.NumOperation,
                image: paymentData.image
            };

            //console.log('📦 Creating order:', orderData);

            // Create order
            const response = await orderService.createOrder(orderData);
            
            //console.log('✅ Order created successfully:', response);

            // Show success message with redirect
            showAlert(
                `تم إنشاء الطلب بنجاح! رقم الطلب: ${response.data.orderId}`,
                'success',
                [
                    {
                        label: 'عرض الطلبات',
                        onClick: () => {
                            setAlertConfig(prev => ({ ...prev, show: false }));
                            router.push('/');
                        },
                        variant: 'primary'
                    }
                ]
            );

        } catch (error: any) {
            //console.error('❌ Error creating order:', error);
            const errorMessage = error.message || 'حدث خطأ أثناء إنشاء الطلب';
            setError(errorMessage);
            
            // Show error alert
            showAlert(`خطأ: ${errorMessage}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    //console.log('Summary Component Rendered with:', { Total, delivery, numberItems, disabled, addressData, paymentData });

    return (
        <>
            {/* Custom Alert */}
            {alertConfig.show && (
                <Alert
                    message={alertConfig.message}
                    type={alertConfig.type}
                    setClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                    buttons={alertConfig.buttons}
                />
            )}

            <div className={styles.SummaryContainer}>
                <span className={styles.title}>
                    ملخص الطلب
                </span>

                {/* Row 1: Product count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
                    <span className={styles.details}>عدد المنتجات </span>
                    <span className={`${styles.price} notranslate `}>({numberItems})</span>
                
                    <span className={`${styles.price} `}>  {Total}  ج.م </span>
                    {/* <span className={styles.currency}> ج.م </span> */}
                </div>

                {/* Row 2: Delivery */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', width: '100%' }}>
                    <span className={styles.details}>التوصيل</span>
                    <span className={`${styles.price} `}>يتم التحديد من قبل أحد المسؤولين لاحقا</span>
                </div>

                {/* Row 3: Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingTop: '8px', borderTop: '1px solid var(--black16)', width: '100%' }}>
                    <span className={styles.details} style={{ fontWeight: 600 }}>الإجمالي</span>
                    <span className={`${styles.price} `} style={{ fontWeight: 600, fontSize: '18px' }}>{Total + delivery}  ج.م </span>
                    {/* <span className={styles.currency} style={{ fontWeight: 600, fontSize: '18px' }}></span> */}
                </div>

                {error && (
                    <div className={styles.error} style={{
                        color: '#dc3545',
                        fontSize: '14px',
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#f8d7da',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}
                
                <Button 
                    variant="custom"
                    fullWidth
                    rounded
                    size="lg"
                    className={styles.button}
                    onClick={handleSubmit}
                    disabled={disabled || isSubmitting}
                > 
                    {isSubmitting ? 'جاري الإرسال...' : 'إتمام عملية الشراء'}
                </Button>
            </div>
        </>
    )
}

export default Summary;