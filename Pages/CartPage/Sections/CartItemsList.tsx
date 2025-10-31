import React, { useState } from 'react';
import { Minus, Plus, Trash, X } from 'lucide-react';
import { Button, IconButton } from '@/components/UI/Buttons/Button';
import type { CartItem } from './types';
import { div, h2 } from 'motion/react-client';
import { useRouter } from 'next/navigation';
import ActionEmptyState from '@/components/UI/EmptyStates/ActionEmptyState';

type Props = {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
};

const CartItemImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      if (imgSrc.includes('/uploads/')) {
        setImgSrc(imgSrc.replace(/^\//, ''));
      } else {
        setImgSrc('/acessts/NoImage.jpg');
      }
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-lg bg-white"
    />
  );
};

const CartItemsList: React.FC<Props> = ({ items, onUpdateQuantity, onRemove }) => {
  const router = useRouter();
  
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-12 text-center">
          <ActionEmptyState
            imageSrc="/icons/empty-cart.png"
            imageAlt="السلة فارغة"
            message="لا يوجد منتجات فالسلة"
            actionLabel="اذهب للتسوق"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-sm border bg-white">
       <div className="divide-y pt-[5px] max-h-[60vh] md:max-h-[70vh] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map((item) => (
          <div key={item.id} className="pt-[3px] sm:p-3 mt-[15px] mb-[15px] rounded-[10px] mx-[10px] bg-white border-[2px] border-gray-200">
           <div className="flex sm:flex-row gap-4 ">
              <div className="flex-shrink-0 m-auto">
                <CartItemImage src={item.image} alt={item.name} />
              </div>

              <div className="flex-1 flex justify-between min-w-0 ">

                <div className="flex flex-col justify-between items-start w-[35%] mb-2 ">
                  <h3 className="text-lg font-medium text-black87 truncate">
                    {item.name}
                  </h3>
                  <h4 className="text-[14px] font-medium text-right leading-tight w-[17px] h-[17px] text-black60 font-beiruti mb-2">
                    {item.unit}   
                  </h4>
                  <h4 className="text-[14px] font-medium leading-[1] text-right w-[71px] h-[17px] text-secondary1 font-beiruti mb-2">
                    {item.availability}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    state="default"
                    leftIcon={<Trash className="w-4 h-4 sm:w-5 sm:h-5" />}
                    onClick={() => onRemove(item.id)}
                    className="text-secondary1 hover:bg-gray-100 w-full sm:w-auto justify-start sm:justify-center p-1 sm:px-2"
                  >
                    <span className="text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                      حذف المنتج من السلة
                    </span>
                  </Button>
                </div>

                <div className="flex flex-col items-start justify-start w-[35%] sm:flex-col sm:items-center sm:justify-between gap-4 ">
                  <div className="text-left w-[100%]">
                    <div className="text-xl font-bold text-black60">
                      {(item.price * item.quantity).toLocaleString()} ج.م
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-start gap-3 w-full " dir="ltr">
                   <IconButton
                      aria-label="increase quantity"
                      title="زيادة الكمية"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      size="sm"
                      className="rounded-full border border-black16 hover:border-primary hover:text-primary"
                      icon={<Plus className="w-4 h-4" />}
                    /> 
                    <span className="text-lg font-medium text-black87 min-w-[2rem] text-center">{item.quantity}</span>
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

export default React.memo(CartItemsList);