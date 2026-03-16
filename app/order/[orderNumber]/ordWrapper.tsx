"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./order.module.css";
import { useTranslations } from "next-intl";
import { getLocale } from "@/services/api/language";

//components
import OrderStepper from "@/components/UI/Profile/leftSection/Orders/OrderStepper";
import type { OrderStatus } from "@/components/UI/Profile/leftSection/Orders/OrderStepper";
import InfoCard from "@/components/UI/Profile/leftSection/Orders/InfoCard";
import ItemCard from "@/components/UI/Profile/leftSection/Orders/ItemCard";

// Import order service
import orderService, { OrderItem } from "@/services/profile/orders";

// Status mapping from API to component
const mapOrderStatus = (apiStatus: OrderItem["status"]): OrderStatus => {
  const statusMap: Record<OrderItem["status"], OrderStatus> = {
    "Under review": "Under review",
    reviewed: "reviewed",
    prepared: "prepared",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
  };

  return statusMap[apiStatus] || "pending";
};

export default function ordWrapper() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderNumber as string;
  const isRTL = getLocale() === "ar";

  const t = useTranslations('order.orderDetails');

  // State management
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError(t("errors.missingId"));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to get from cache first by fetching all orders
        const allOrders = await orderService.getUserOrders();
        const foundOrder = allOrders.find(
          (o) => o._id === orderId || o.orderId === orderId,
        );

        if (foundOrder) {
          //console.log("✅ Order found in cache:", foundOrder);
          // console.log("order items (from cache)", foundOrder.cartId?.items);
          setOrder(foundOrder);
        } else {
          // If not found in list, try to fetch specific order details
          const orderDetails = await orderService.getOrderDetails(orderId);
          //console.log("✅ Order details fetched:", orderDetails);
          setOrder(orderDetails);
          // console.log("order items", orderDetails.cartId?.items);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("errors.fetchFailed"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();

  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content_wrapper}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content_wrapper}>
          <div className={styles.error}>
            <p className={styles.error_message}>⚠️ {error}</p>
            <button
              onClick={() => router.back()}
              className={styles.back_button}
            >
             {t("backToOrders")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div className={styles.container } style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <div className={styles.content_wrapper}>
          <div className={styles.error}>
            <p className={styles.error_message}>الطلب غير موجود</p>
            <button
              onClick={() => router.back()}
              className={styles.back_button}
            >
             {t('errors.notFound')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get full address
  const fullAddress = `${order.address.address}, ${order.address.city}, ${order.address.region}`;
  const fullName = `${order.address.firstName} ${order.address.lastName}`;

  return (
    <div className={styles.container} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className={styles.content_wrapper}>
        <span className={styles.title} style={{textAlign: isRTL ? 'right' : 'left'}}> {t('title' )} {order.orderId}</span>

        <div className={styles.stepper}>
          <OrderStepper currentStatus={mapOrderStatus(order.status)} />
        </div>

        <div className={styles.info_order}>
          <div className={styles.information_section}>
            <InfoCard
              orderNumber={order.orderId}
              orderPrice={`${
                order.deliveryPrice + (order.paymentDetails?.totalPrice ?? 0)
              } ${t('pound')}`}
              orderDate={formatDate(order.createdAt)}
              address={fullAddress}
              phone={order.address.phoneNumber}
              name={fullName}
            />
          </div>

          <div className={styles.Items_container}>
            <span className={styles.items_title}> {t('itemsSectionTitle')}</span>
            <div className={styles.items_list}>
              {order.cartId?.items?.length > 0 ? (
                order.cartId.items
                  .filter(
                    (item) =>
                      item?.variantId !== null && item?.variantId !== undefined,
                  )
                  .map((item) => (
                    <ItemCard
                      key={item._id}

                      id={item.variantId?.productId?._id || ""}
                      image={
                        !item.variantId?.productId?.imageList?.length
                          ? ["/acessts/NoImage.jpg"]
                          : item.variantId.productId.imageList
                      }
                      name={item.variantId?.productId?.name || t('itemCard.unavailable')}
                      price={`${item.variantId?.price || 0} ${t('pound')}`}
                    />
                  ))
              ) : (
                <p className={styles.no_items}> {t('orderDetails.noItems')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
