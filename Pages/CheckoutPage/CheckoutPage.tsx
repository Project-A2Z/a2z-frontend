'use client';
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import styles from './Checkout.module.css';

// Components 
import Delivery from "@/components/UI/Chekout/Delivery";
import AddComponent from "@/components/UI/Chekout/Address";
import Cash, { PaymentData } from "@/components/UI/Chekout/Cash";
import OrderSummary from "@/components/UI/Chekout/OrderSummary";

// Services
import { AddressService, Address as ApiAddress } from '@/services/profile/address';

// -------------------------
// Types
// -------------------------
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

interface CheckoutData {
  totalItemQuantity: number;
  total: number;
  hasItems: boolean;
  order: Item[];
}

// -------------------------
// Component that uses useSearchParams
// -------------------------
const CheckoutContent: React.FC = () => {
  const searchParams = useSearchParams();

  // UI state
  const [disabled, setDisabled] = useState(true);
  const [editDelivery, setEditDelivery] = useState(true);
  const [editPayment, setEditPayment] = useState(true);

  // Payment state
  const [paymentData, setPaymentData] = useState<PaymentData | undefined>();

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [def, setDef] = useState<Address | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Checkout data from URL
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  // -------------------------
  // Helper: Arabic date formatter
  // -------------------------
  const formatDateInArabic = (date: Date) => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${dayName} ${day} ${month}`;
  };

  // -------------------------
  // Delivery Info
  // -------------------------
  const [delivery, setDelivery] = useState(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    return {
      price: 0,
      start: formatDateInArabic(startDate),
      ends: formatDateInArabic(endDate),
    };
  });

  // -------------------------
  // Convert Address from API
  // -------------------------
  const convertApiAddressToLocal = (apiAddress: ApiAddress): Address => ({
    id: parseInt(apiAddress._id) || 0,
    name: `${apiAddress.firstName} ${apiAddress.lastName}`,
    phone: apiAddress.phoneNumber,
    address: `${apiAddress.address}, ${apiAddress.city}, ${apiAddress.region}`,
    isDefault: apiAddress.isDefault || false,
    firstName: apiAddress.firstName,
    lastName: apiAddress.lastName,
    governorate: apiAddress.region,
    city: apiAddress.city,
  });

  // -------------------------
  // Load Addresses
  // -------------------------
  const loadAddresses = async (forceRefresh = false) => {
    setIsLoadingAddresses(true);
    setAddressError(null);

    try {
      if (!AddressService.isAuthenticated()) {
        setAddresses([]);
        setDef(null);
        return;
      }

      const cached = AddressService.getCachedAddresses();
      if (!forceRefresh && cached?.length) {
        const converted = cached.map(convertApiAddressToLocal);
        setAddresses(converted);
        setDef(converted.find(a => a.isDefault) || converted[0]);
        return;
      }

      const apiAddresses = await AddressService.getAddresses(forceRefresh);
      if (apiAddresses?.length) {
        const converted = apiAddresses.map(convertApiAddressToLocal);
        setAddresses(converted);
        setDef(converted.find(a => a.isDefault) || converted[0]);
      } else {
        setAddresses([]);
        setDef(null);
      }

    } catch (err: any) {
      setAddressError(err.message || 'فشل تحميل العناوين');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // -------------------------
  // Parse Checkout Data from URL
  // -------------------------
  useEffect(() => {
    const dataParam = searchParams?.get('data');
    if (dataParam) {
      try {
        const decoded = decodeURIComponent(dataParam);
        const parsed: CheckoutData = JSON.parse(decoded);
        setCheckoutData(parsed);
      } catch (err) {
        console.error('Failed to parse checkout data:', err);
      }
    }
  }, [searchParams]);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Update button disable state
  useEffect(() => {
    setDisabled(editDelivery || editPayment);
  }, [editDelivery, editPayment]);

  // -------------------------
  // Handlers
  // -------------------------
  const handlePaymentDataChange = (data: PaymentData) => {
    setPaymentData(data);
  };

  const handleRefreshAddresses = async () => {
    await loadAddresses(true);
  };

  // -------------------------
  // UI: Loading or Error
  // -------------------------
  if (!checkoutData) {
    return (
      <div className={styles.Container}>
        <div>Loading checkout data...</div>
      </div>
    );
  }

  const { totalItemQuantity: itemCount, total, order } = checkoutData;

  // -------------------------
  // UI: Main Checkout Layout
  // -------------------------
  return (
    <div className={styles.Container}>
      <div className={styles.right}>
        {addressError && addresses.length > 0 && (
          <div
            style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
                cursor: 'pointer',
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
  );
};

// -------------------------
// Main Component with Suspense
// -------------------------
const Checkout: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '16px' }}>جاري تحميل صفحة الدفع...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
};

export default Checkout;