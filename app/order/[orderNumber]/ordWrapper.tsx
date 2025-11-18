"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./order.module.css";

//components
import OrderStepper from "@/components/UI/Profile/leftSection/Orders/OrderStepper";
import type { OrderStatus } from "@/components/UI/Profile/leftSection/Orders/OrderStepper";
import InfoCard from "@/components/UI/Profile/leftSection/Orders/InfoCard";
import ItemCard from "@/components/UI/Profile/leftSection/Orders/ItemCard";
import img from "@/public/acessts/Frame.png";

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

export default function ordWrapper  ()  {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderNumber as string;

  // State management
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("معرف الطلب غير موجود");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to get from cache first by fetching all orders
        const allOrders = await orderService.getUserOrders();
        const foundOrder = allOrders.find(
          (o) => o._id === orderId || o.orderId === orderId
        );

        if (foundOrder) {
          // console.log('✅ Order found in cache:', foundOrder);
          setOrder(foundOrder);
        } else {
          // If not found in list, try to fetch specific order details
          //console.log('⚠️ Order not found in list, fetching details...');
          const orderDetails = await orderService.getOrderDetails(orderId);
          // console.log('✅ Order details fetched:', orderDetails);
          setOrder(orderDetails);
        }
      } catch (err) {
        //console.error('❌ Error fetching order:', err);
        setError(
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء تحميل تفاصيل الطلب"
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
            <p>جاري تحميل تفاصيل الطلب...</p>
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
              العودة للطلبات
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.content_wrapper}>
          <div className={styles.error}>
            <p className={styles.error_message}>الطلب غير موجود</p>
            <button
              onClick={() => router.back()}
              className={styles.back_button}
            >
              العودة للطلبات
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

  // This is the corrected mapping based on your actual API response structure
  //console.log('Order items:', order.cartId);
  const orderItems =
    order.cartId &&
    typeof order.cartId === "object" &&
    order.cartId.items &&
    Array.isArray(order.cartId.items)
      ? order.cartId.items.map((item) => {
          // item.productId is an object containing: name, imageList, price, etc.
          const product = item.productId;

          // console.log('📦 Mapping order item:', item);

          //console.log('Mapping item:', item);
          //console.log('Product details:', product);

          return {
            id: item._id,
            name: product?.name || "منتج",
            image: product?.imageList?.[0] || img,
            price: `${(product?.price || 0) * (item.itemQty || 1)}`,
            quantity: item.itemQty || 1,
          };
        })
      : [
          {
            id: order._id,
            name: "منتج من الطلب",
            image: img,

            price: `${order.paymentDetails?.totalPrice || 0}  ج.م`,

            quantity: 1,
          },
        ];

  return (
    <div className={styles.container}>
      <div className={styles.content_wrapper}>
        <span className={styles.title}> تفاصيل الطلب {order.orderId} </span>

        <div className={styles.stepper}>
          <OrderStepper currentStatus={mapOrderStatus(order.status)} />
        </div>

        <div className={styles.info_order}>
          <div className={styles.information_section}>
            <InfoCard
              orderNumber={order.orderId}
              orderPrice={`${
                order.deliveryPrice + (order.paymentDetails?.totalPrice ?? 0)
              } ج ` }
              orderDate={formatDate(order.createdAt)}
              address={fullAddress}
              phone={order.address.phoneNumber}
              name={fullName}
            />
          </div>

          <div className={styles.Items_container}>
            <span className={styles.items_title}>المنتجات الخاصة بطلبك</span>
            <div className={styles.items_list}>
              {order.cartId.items.map((item) => (
                <ItemCard
                  key={item._id}
                  image={item.productId.imageList}
                  name={item.productId.name}

                  price={`${item.productId.price} ج.م`}

                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// export default OrderDetails;