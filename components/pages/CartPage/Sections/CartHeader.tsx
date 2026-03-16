import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getLocale } from '@/services/api/language';

type Props = {
  itemCount: number;
};

const CartHeader: React.FC<Props> = ({ itemCount }) => {
  const t = useTranslations("cart");
  const isRTL = getLocale() === 'ar'; // Example for Arabic, adjust as needed
  return (
    <div className="bg-white shadow-sm border-b  sticky top-0 z-10" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-black87 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            {t("title")}
          </h1>
          {itemCount > 0 && (
            <div className="text-sm text-black60">
              {t("itemCount", { count: itemCount })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartHeader);