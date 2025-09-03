import React from 'react';
import { Button } from '@/components/UI/Buttons/Button';

type Props = {
  subtotal: number;
  shipping: number;
  total: number;
  hasItems: boolean;
};

const OrderSummary: React.FC<Props> = ({ subtotal, shipping, total, hasItems }) => {
  if (!hasItems) return null;
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
      <h2 className="text-xl font-bold text-black87 mb-6">ملخص الطلب</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-black60">المجموع الفرعي</span>
          <span className="font-medium text-black87">{subtotal.toLocaleString()} ج.م</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black60">الشحن</span>
          <span className="font-medium text-black87">{shipping.toLocaleString()} ج.م</span>
        </div>
        <hr className="border-black16" />
        <div className="flex justify-between text-lg font-bold">
          <span className="text-black87">المجموع الكلي</span>
          <span className="text-primary">{total.toLocaleString()} ج.م</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button fullWidth size="lg" variant="primary">إتمام الطلب</Button>
        <Button fullWidth size="lg" variant="outline">متابعة التسوق</Button>
      </div>
    </div>
  );
};

export default OrderSummary;


