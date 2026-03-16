"use client";
import React, { useState } from "react";
import { useTranslations } from 'next-intl';
import { getLocale } from "@/services/api/language";

// styles
import styles from "@/components/UI/Chekout/Style.module.css";

// components
import { Button } from "@/components/UI/Buttons/Button";
import { PaymentData } from "@/components/UI/Chekout/Cash";
import Alert, { AlertButton } from "@/components/UI/Alert/alert";

// services
import { useRouter } from "next/navigation";
import { orderService, CreateOrderData } from "@/services/checkout/order";
import { getAuthToken } from "@/services/auth/login";

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
  paymentData,
}) => {
  const router = useRouter();
  const isRTL = getLocale() === 'ar'
  const t = useTranslations('checkout.summary');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    show: boolean;
    message: string;
    type: "warning" | "error" | "info" | "success";
    buttons: AlertButton[];
  }>({
    show: false,
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlert = (
    message: string,
    type: "warning" | "error" | "info" | "success" = "info",
    buttons?: AlertButton[],
  ) => {
    setAlertConfig({
      show: true,
      message,
      type,
      buttons: buttons || [
        {
          label: t('alerts.ok'),
          onClick: () => setAlertConfig((prev) => ({ ...prev, show: false })),
          variant: "primary",
        },
      ],
    });
  };

  const handleSubmit = async () => {
    if (!addressData) {
      setError(t('alerts.selectAddress'));
      showAlert(t('alerts.error'), "warning");
      return;
    }

    if (!paymentData || !paymentData.paymentWay) {
      setError(t('alerts.selectPayment'));
      showAlert(t('alerts.error'), "warning");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error(t('alerts.loginRequired'));
      orderService.setToken(token);

      const nameParts = addressData.name.split(" ");
      const firstName = addressData.firstName || nameParts[0] || "";
      const lastName = addressData.lastName || nameParts.slice(1).join(" ") || "";

      const orderData: CreateOrderData = {
        firstName,
        lastName,
        phoneNumber: addressData.phone,
        address: addressData.address,
        city: addressData.city || addressData.governorate || "",
        region: addressData.governorate || addressData.city || "",
        paymentStatus: paymentData.paymentStatus,
        paymentWay: paymentData.paymentWay,
        paymentWith: paymentData.paymentWith,
        NumOperation: paymentData.NumOperation,
        image: paymentData.image,
      };

      const response = await orderService.createOrder(orderData);

      showAlert(
        t('alerts.success', { orderId: response.data.orderId }),
        "success",
        [
          {
            label: t('alerts.viewOrders'),
            onClick: () => {
              setAlertConfig((prev) => ({ ...prev, show: false }));
              router.push(`/order/${response.data.orderId}`);
            },
            variant: "primary",
          },
        ],
      );
    } catch (error: any) {
      console.error("Error creating order:", error);
      setError(error.message || t('alerts.error'));
      showAlert(t('alerts.error'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {alertConfig.show && (
        <Alert
          message={alertConfig.message}
          type={alertConfig.type}
          setClose={() => setAlertConfig((prev) => ({ ...prev, show: false }))}
          buttons={alertConfig.buttons}
        />
      )}

      <div className={styles.SummaryContainer} style={{direction: isRTL ? 'rtl' : 'ltr'}}>
        <span className={styles.title}>{t('title')}</span>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", width: "100%" }}>
          <span className={styles.details}>{t('itemCount', { count: numberItems })}</span>
          <span className={styles.price}>{Total} {t('currency')}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", width: "100%" }}>
          <span className={styles.details}>{t('delivery')}</span>
          <span className={styles.price}>{t('deliveryNote')}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingTop: "8px", borderTop: "1px solid var(--black16)", width: "100%" }}>
          <span className={styles.details} style={{ fontWeight: 600 }}>{t('total')}</span>
          <span className={styles.price} style={{ fontWeight: 600, fontSize: "18px" }}>
            {Total + delivery} {t('currency')}
          </span>
        </div>

        <Button
          variant="custom"
          fullWidth
          rounded
          size="lg"
          className={styles.button}
          onClick={handleSubmit}
          disabled={disabled || isSubmitting}
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </div>
    </>
  );
};

export default Summary;