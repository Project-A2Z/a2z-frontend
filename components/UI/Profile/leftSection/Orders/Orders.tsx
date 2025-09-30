import React from 'react';
import styles from './order.module.css';
import { useRouter } from 'next/navigation';
import OrderFilter, { FilterOption } from './OrderFilter';
import { useMemo } from 'react';

//icons 
import { Package } from 'lucide-react';
import Box from './../../../../../public/icons/order.svg'

// Mock order data type
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' |  'loaded' | 'reviewed' ;
  date: string;
  total: number;
  items: number;
}

// Mock data - replace with your actual data source
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'delivered',
    date: '2025-08-30',
    total: 150.00,
    items: 3
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    status: 'processing',
    date: '2025-08-31',
    total: 89.50,
    items: 2
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    status: 'shipped',
    date: '2025-08-29',
    total: 275.25,
    items: 5
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    status: 'pending',
    date: '2025-08-31',
    total: 45.00,
    items: 1
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    status: 'shipped',
    date: '2025-08-28',
    total: 120.75,
    items: 2
  },
  {
    id: '6',
    orderNumber: 'ORD-006',
    status: 'reviewed',
    date: '2025-08-27',
    total: 89.30,
    items: 1
  },
  {
    id: '7',
    orderNumber: 'ORD-007',
    status: 'reviewed',
    date: '2025-08-26',
    total: 203.45,
    items: 4
  },
  {
    id: '8',
    orderNumber: 'ORD-008',
    status: 'pending',
    date: '2025-08-25',
    total: 67.20,
    items: 1
  }
];

interface OrdersProps {
   orders: Order[] | [];  
}


const Orders: React.FC<OrdersProps> = ({orders}) => {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
 const filterOptions: FilterOption[] = [
    
    
    { 
      id: '1', 
      label: 'قيد المراجعة', 
      value: 'processing', 
      count: orders.filter(order => order.status === 'processing').length 
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
      value: 'pending', 
      count: orders.filter(order => order.status === 'pending').length 
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
      return orders; // Show all orders when no filters are selected
    }
    
    return orders.filter(order => {
      return selectedFilters.includes(order.status);
    });
  }, [selectedFilters]);

  const handleFilterChange = (newFilters: string[]) => {
    setSelectedFilters(newFilters);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return styles.statusDelivered;
      case 'processing':
        return styles.statusProcessing;
      case 'shipped':
        return styles.statusShipped;
      case 'pending':
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
      
      case 'processing': return 'قيد المراجعة';
      case 'reviewed': return 'تمت المراجعة';
      case 'pending': return 'تم التجهيز';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
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
                    رقم الطلب: {order.orderNumber}
                  </div>
                  <div className={styles.orderPrice_new}>
                    السعر: {order.total.toFixed(2)} ج
                  </div>
                  <span className={`${styles.statusBadge_new} ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  
                </div>

                <div className={styles.orderRight_new}>
                  
                  <button 
                    className={styles.viewDetails_new}
                    onClick={() => router.push(`/order/${order.orderNumber}`)}
                  >
                    عرض التفاصيل
                  </button>

                  <div className={styles.orderDate_new}>
                    تم تقديم الطلب في: {new Date(order.date).toLocaleDateString()}
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