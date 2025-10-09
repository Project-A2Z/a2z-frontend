import React from 'react';
import { ShoppingCart } from 'lucide-react';

type Props = {
  itemCount: number;
};

const CartHeader: React.FC<Props> = ({ itemCount }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black87 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            سلة التسوق
          </h1>
          {/* <div className="text-sm text-black60">{itemCount} منتجات</div> */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartHeader);