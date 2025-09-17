import React from 'react';
import styles from './Payments.module.css';
import { useRouter } from 'next/navigation';

// Payment record data type
interface PaymentRecord {
  id: string;
  date: string;
  orderNumber: string;
  amount: number;
  status: string;
  description: string;
}

// Mock data based on the image
const mockPaymentRecords: PaymentRecord[] = [
  {
    id: '1',
    date: '20\\12\\2025',
    orderNumber: 'ORD-001',
    amount: 65000,
    status: 'عرض التفاصيل',
    description: 'كاش + دفعة أولية'
  },
  {
    id: '2',
    date: '20\\12\\2025',
    orderNumber: 'ORD-002',
    amount: 65000,
    status: 'عرض التفاصيل',
    description: 'كاش + دفعة أولية'
  },
  {
    id: '3',
    date: '20\\12\\2025',
    orderNumber: 'ORD-003',
    amount: 65000,
    status: 'عرض التفاصيل',
    description: 'كاش + دفعة أولية'
  },
  {
    id: '4',
    date: '20\\12\\2025',
    orderNumber: 'ORD-004',
    amount: 65000,
    status: 'عرض التفاصيل',
    description: 'كاش + دفعة أولية'
  }
];

const PaymentRecords: React.FC = () => {
    const router = useRouter()
  const handleViewDetails = (orderNumber: string) => {
    // console.log(`Viewing details for record: ${recordId}`);
    router.push(`/order/${orderNumber}`)
    
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>مدفوعاتك</h1>
      </div>

      {/* Payment Records List */}
      <div className={styles.recordsList}>
        {mockPaymentRecords.map((record) => (
          <div key={record.id} className={styles.recordItem}>
            <div className={styles.recordContent}>
              {/* Top section - Date on the right */}
              <div className={styles.topSection}>
                <div className={styles.dateSection}>
                  <span className={styles.date}>{record.date}</span>
                </div>
              </div>
              
              {/* Dividing line */}
              <div className={styles.divider}></div>
              
              {/* Bottom section - Order details on right, button on left */}
              <div className={styles.bottomSection}>
                {/* Order details on the right */}
                <div className={styles.orderDetails}>
                  <div className={styles.orderNumber}>
                    رقم الطلب: {record.orderNumber}
                  </div>
                  <div className={styles.amount}>
                    ج{record.amount.toLocaleString()}
                  </div>
                  <div className={styles.description}>
                    {record.description}
                  </div>
                </div>
                
                {/* Action button on the left */}
                <div className={styles.actionSection}>
                  <button
                    className={styles.viewDetailsBtn}
                    onClick={() => handleViewDetails(record.orderNumber)}
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentRecords;