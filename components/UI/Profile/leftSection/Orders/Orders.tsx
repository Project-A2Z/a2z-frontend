import React from 'react';

//styles
import styles from '@/components/UI/Profile/leftSection/Orders/order.module.css';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

//components
import OrderFilter, { FilterOption } from '@/components/UI/Profile/leftSection/Orders/OrderFilter';

//icons 
import { Package } from 'lucide-react';
import Box from '@/public/icons/order.svg'

// Import the correct interfaces from the service
import { OrderItem } from '@/services/profile/orders';

interface OrdersProps {
  orders: OrderItem[];  
}

const Orders: React.FC<OrdersProps> = ({orders}) => {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);

  // console.log('📦 Orders received in Orders component:', orders);
  
  const filterOptions: FilterOption[] = [
    { 
      id: '1', 
      label: 'قيد المراجعة', 
      value: 'Under review', 
      count: orders.filter(order => order.status === 'Under review').length 
    },
    { 
      id: '2', 
      label: 'تمت المراجعة', 
      value: 'reviewed', 
      count: orders.filter(order => order.status === 'reviewed').length 
    },
    { 
      id: '3', 
      label: 'تم التجهيز', 
      value: 'prepared', 
      count: orders.filter(order => order.status === 'prepared').length 
    },
    { 
      id: '4', 
      label: 'تم الشحن', 
      value: 'shipped', 
      count: orders.filter(order => order.status === 'shipped').length 
    },
    { 
      id: '5', 
      label: 'تم التسليم', 
      value: 'delivered', 
      count: orders.filter(order => order.status === 'delivered').length 
    },
    { 
      id: '6', 
      label: 'ملغي', 
      value: 'cancelled', 
      count: orders.filter(order => order.status === 'cancelled').length 
    }
  ];

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    if (selectedFilters.length === 0) {
      return orders;
    }
    
    return orders.filter(order => {
      return selectedFilters.includes(order.status);
    });
  }, [orders, selectedFilters]);

  const handleFilterChange = (newFilters: string[]) => {
    setSelectedFilters(newFilters);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return styles.statusDelivered;
      case 'Under review':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'prepared':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      case 'reviewed':
        return styles.statusReviewed;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Under review': return 'قيد المراجعة';
      case 'reviewed': return 'تمت المراجعة';
      case 'prepared': return 'تم التجهيز';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  // Calculate total price from cart
  const getOrderTotal = (order: OrderItem): number => {
    const cartTotal = typeof order.cartId === 'object' ? order.paymentDetails?.totalPrice : 0;
    return (cartTotal ?? 0) + order.deliveryPrice;
  };

  return (
    <div className={styles.container_orders_new}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>طلباتك</h1>

        <OrderFilter
          options={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          multiSelect={true}
          showClearAll={true}
          clearAllText="الكل"
          variant="outline"
          size="sm"
        />
      </div>

      {/* Orders List */}
      <div className={styles.ordersList_new}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>لم يتم العثور على طلبات</p>
            <p className={styles.emptySubtitle}>جرب تعديل مرشحات البحث</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderItem_new}>
              <div className={styles.orderContent_new}>
                <Box className={styles.orderIcon_new} />
                
                <div className={styles.orderInfo_new}>
                  <div className={styles.orderNumber_new}>
                    رقم الطلب: {order.orderId}
                  </div>
                  <div className={styles.orderPrice_new}>
                    السعر: {getOrderTotal(order).toFixed(2)} ج
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
                    عرض التفاصيل
                  </button>

                  <div className={styles.orderDate_new}>
                    تم تقديم الطلب في: {new Date(order.createdAt).toLocaleDateString('ar-EG')}
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