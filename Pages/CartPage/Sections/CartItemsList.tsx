import React from 'react';
import { Minus, Plus, Trash, X } from 'lucide-react';
import { Button, IconButton } from '@/components/UI/Buttons/Button';
import type { CartItem } from './types';
import { div, h2 } from 'motion/react-client';
import { useRouter } from 'next/navigation';

type Props = {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
};

const CartItemsList: React.FC<Props> = ({ items, onUpdateQuantity, onRemove }) => {
  const router = useRouter();
  
  if (items.length === 0) {
    return (
      <div className="bg-black8 rounded-lg shadow-sm border">
        <div className="p-12 text-center">
          <img src="/icons/empty-cart.png" alt="السلة فارغة" className="w-56 h-auto mx-auto mb-6" />
          <p className="text-black60 mb-6">لا يوجد منتجات فالسلة</p>
          <Button onClick={() => router.push('/product')} variant="primary" size="lg" rounded>
            اذهب للتسوق
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm border ">
       <div className="divide-y pt-[5px]  max-h-[60vh] md:max-h-[70vh] overflow-y-auto  bg-black8 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map((item) => (
          <div key={item.id} className=" pt-[3px] sm:p-3 mt-[15px] mb-[15px] rounded-[10px] mx-[10px] bg-black8 border-[2px] border-gray-200">
           <div className="flex  sm:flex-row gap-4 ">
              {/* product images */}
              <div className="flex-shrink-0  m-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-lg bg-card "
                />
              </div>

              <div className="flex-1 flex justify-between min-w-0 ">

                <div className="flex flex-col justify-between items-start w-[35%]  mb-2 ">
                  <h3 className="text-lg font-medium text-black87 truncate">
                    {item.name}
                  </h3>
                  <h4 className="text-[14px] font-medium text-right leading-tight w-[17px] h-[17px] text-black60  font-beiruti mb-2">
                    {item.unit}   
                  </h4>
                  <h4 className="text-[14px] font-medium leading-[1] text-right w-[71px] h-[17px]  text-secondary1 font-beiruti mb-2">
                    {item.availability}
                  </h4>
                  <button
                    aria-label="remove item"
                    title="حذف المنتج من السلة "
                    onClick={() => onRemove(item.id)}
                    className="text-secondary1 flex  -50 p-1 rounded-full transition-colors flex-shrink-0"
                  >
                    <Trash className='w-5 h-5'/>
                    <h4>حذف المنتج من السلة </h4>
                  </button>
                </div>

                <div className="flex flex-col  items-start justify-start  w-[35%] sm:flex-col   sm:items-center sm:justify-between gap-4 ">
                  {/*price  */}
                  <div className="text-left  w-[100%]">
                    <div className="text-xl font-bold text-black60">
                      {(item.price * item.quantity).toLocaleString()} ج.م
                    </div>
                    {/* <div className="text-sm text-black60">{item.price.toLocaleString()} ج.م للقطعة</div> */}
                  </div>
                  
                  {/* + and -  */}
                  <div className="flex items-start justify-start gap-3  w-full " dir="ltr">
                   {/* - */}
                   <IconButton
                      aria-label="increase quantity"
                      title="زيادة الكمية"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      size="sm"
                      className="rounded-full border border-black16 hover:border-primary hover:text-primary"
                      icon={<Plus className="w-4 h-4" />}
                    /> 
                    <span className="text-lg font-medium text-black87 min-w-[2rem] text-center">{item.quantity}</span>
                    {/* + */}
                    <IconButton
                      aria-label="decrease quantity"
                      title="إنقاص الكمية"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      size="sm"
                      className="rounded-full border border-black16 hover:border-primary hover:text-primary"
                      icon={<Minus className="w-4 h-4" />}
                    />
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


