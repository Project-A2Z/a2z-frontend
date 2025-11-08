import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UI/Buttons/Button';

interface Item {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  availability: string;
}

type Props = {
  itemCount: number;
  total: number;
  hasItems: boolean;
  order: Array<Item>;
};

const OrderSummary: React.FC<Props> = ({ itemCount, total, hasItems, order }) => {
  const router = useRouter();
  
  if (!hasItems) return null;

  // Calculate total quantity of all items
  const totalItemQuantity = order.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    const checkoutData = {
      totalItemQuantity,
      total,
      hasItems,
      order
    };
    //console.log('Checkout Data :from cart', checkoutData);
    
    const encodedData = encodeURIComponent(JSON.stringify(checkoutData));
    router.push(`/checkout?data=${encodedData}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6">
      <h2 className="text-xl font-bold text-black87 mb-6 text-center">إجمالي سلة التسوق</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-black87">
          <span className="text-black60">عدد المنتجات</span>
          <span className="font-medium">{totalItemQuantity}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-black60">الإجمالي</span>
          <span className="font-bold text-primary text-xl">{(total).toLocaleString()} ج.م</span>
        </div>
      </div>

      <Button 
        onClick={handleCheckout} 
        fullWidth 
        size="lg" 
        variant="primary" 
        rounded
      >
        تابع عملية الشراء
      </Button>
    </div>
  );
};

export default React.memo(OrderSummary);