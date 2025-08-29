import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Button, IconButton } from '@/components/UI/Buttons/Button';
import type { CartItem } from './types';

type Props = {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
};

const CartItemsList: React.FC<Props> = ({ items, onUpdateQuantity, onRemove }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-12 text-center">
          <img src="/icons/empty-cart.png" alt="السلة فارغة" className="w-56 h-auto mx-auto mb-6" />
          <p className="text-black60 mb-6">لا يوجد منتجات فالسلة</p>
          <Button variant="primary" size="lg" rounded>
            اذهب للتسوق
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-card"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-black87 truncate">{item.name}</h3>
                  <button
                    aria-label="remove item"
                    title="حذف المنتج"
                    onClick={() => onRemove(item.id)}
                    className="text-error hover:bg-red-50 p-1 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <IconButton
                      aria-label="decrease quantity"
                      title="إنقاص الكمية"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      size="sm"
                      className="rounded-full border border-black16 hover:border-primary hover:text-primary"
                      icon={<Minus className="w-4 h-4" />}
                    />
                    <span className="text-lg font-medium text-black87 min-w-[2rem] text-center">{item.quantity}</span>
                    <IconButton
                      aria-label="increase quantity"
                      title="زيادة الكمية"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      size="sm"
                      className="rounded-full border border-black16 hover:border-primary hover:text-primary"
                      icon={<Plus className="w-4 h-4" />}
                    />
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {(item.price * item.quantity).toLocaleString()} ج.م
                    </div>
                    <div className="text-sm text-black60">{item.price.toLocaleString()} ج.م للقطعة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartItemsList;


