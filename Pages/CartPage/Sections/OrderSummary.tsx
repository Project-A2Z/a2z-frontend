import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UI/Buttons/Button';

type Props = {
  itemCount: number;
  total: number;
  hasItems: boolean;
};

const OrderSummary: React.FC<Props> = ({ itemCount, total, hasItems }) => {
  const router = useRouter();
  if (!hasItems) return null;
  return (
    <div className="bg-black8 rounded-2xl shadow-sm border p-6 sticky top-6">
      <h2 className="text-xl font-bold text-black87 mb-6 text-center">إجمالي سلة التسوق</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-black87">
          <span className="text-black60">عدد المنتجات</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-black60">الإجمالي</span>
          <span className="font-bold text-primary text-xl">{total.toLocaleString()} ج</span>
        </div>
      </div>

      <Button onClick={() => router.push('/checkout')} fullWidth size="lg" variant="primary" rounded>تابع عملية الشراء</Button>
    </div>
  );
};

export default OrderSummary;


