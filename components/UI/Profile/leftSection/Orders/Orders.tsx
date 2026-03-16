import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { getLocale } from '@/services/api/language';

// Components
import OrderFilter, { FilterOption } from '@/components/UI/Profile/leftSection/Orders/OrderFilter';
import Box from '@/public/icons/order.svg';

// Styles
import styles from '@/components/UI/Profile/leftSection/Orders/order.module.css';

// Services
import { OrderItem } from '@/services/profile/orders';

interface OrdersProps {
  orders: OrderItem[];
}

const Orders: React.FC<OrdersProps> = ({ orders }) => {
  const t = useTranslations('profile.left');
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
  const isRtl = getLocale() === 'ar';


  const filterOptions: FilterOption[] = [
    { id: '1', label: t('orders.filter.underReview'), value: 'Under review', count: orders.filter(o => o.status === 'Under review').length },
    { id: '2', label: t('orders.filter.reviewed'),   value: 'reviewed',      count: orders.filter(o => o.status === 'reviewed').length },
    { id: '3', label: t('orders.filter.prepared'),   value: 'prepared',      count: orders.filter(o => o.status === 'prepared').length },
    { id: '4', label: t('orders.filter.shipped'),    value: 'shipped',       count: orders.filter(o => o.status === 'shipped').length },
    { id: '5', label: t('orders.filter.delivered'),  value: 'delivered',     count: orders.filter(o => o.status === 'delivered').length },
    { id: '6', label: t('orders.filter.cancelled'),  value: 'cancelled',     count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = useMemo(() => {
    if (selectedFilters.length === 0) return orders;
    return orders.filter(order => selectedFilters.includes(order.status));
  }, [orders, selectedFilters]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':    return styles.statusDelivered;
      case 'Under review': return styles.statusProcessing;
      case 'shipped':      return styles.statusShipped;
      case 'prepared':     return styles.statusPending;
      case 'cancelled':    return styles.statusCancelled;
      case 'reviewed':     return styles.statusReviewed;
      default:             return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Under review': return t('orders.filter.underReview');
      case 'reviewed':     return t('orders.filter.reviewed');
      case 'prepared':     return t('orders.filter.prepared');
      case 'shipped':      return t('orders.filter.shipped');
      case 'delivered':    return t('orders.filter.delivered');
      case 'cancelled':    return t('orders.filter.cancelled');
      default:             return status;
    }
  };

  const getOrderTotal = (order: OrderItem): number => {
    const cartTotal = typeof order.cartId === 'object' ? order.paymentDetails?.totalPrice : 0;
    return (cartTotal ?? 0) + order.deliveryPrice;
  };

  return (
    <div className={styles.container_orders_new} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className={styles.header} style={{ textAlign: isRtl ? 'right' : 'left' }}>
        <h1 className={styles.title} style={{textAlign: isRtl ? 'right' : 'left'}}>{t('orders.title')}</h1>
        <OrderFilter
          options={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          multiSelect={true}
          showClearAll={true}
          clearAllText={t('orders.filter.all')}
          variant="outline"
          size="sm"
        />
      </div>

      <div className={styles.ordersList_new}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>{t('orders.empty.title')}</p>
            <p className={styles.emptySubtitle}>{t('orders.empty.subtitle')}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className={styles.orderItem_new}>
              <div className={styles.orderContent_new}>
                <Box className={styles.orderIcon_new} />

                <div className={styles.orderInfo_new}>
                  <div className={styles.orderNumber_new}>
                    {t('orders.orderNumber')} {order.orderId}
                  </div>
                  <div className={styles.orderPrice_new}>
                    {t('orders.price')} {getOrderTotal(order).toFixed(2)} {t('orders.currency')}
                  </div>
                  <span className={`${styles.statusBadge_new} ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className={styles.orderRight_new}>
                  <button
                    className={styles.viewDetails_new}
                    onClick={() => router.push(`/order/${order.orderId}`)}
                  >
                    {t('orders.viewDetails')}
                  </button>
                  <div className={styles.orderDate_new}>
                    {t('orders.placedAt')} {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;