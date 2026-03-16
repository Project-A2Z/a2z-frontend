import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/UI/Buttons/Button";
import { useTranslations } from "next-intl";
import { getLocale } from "@/services/api/language";

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
  const t = useTranslations("orderSummary");
  const isRTL = getLocale() === 'ar'; // Example for Arabic, adjust as needed


  if (!hasItems) return null;

  const totalItemQuantity = order.reduce((sum, item) => sum + item.quantity, 0);

  const calculatedTotal = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    const checkoutData = {
      totalItemQuantity,
      total: calculatedTotal,
      hasItems,
      order,
    };

    const encodedData = encodeURIComponent(JSON.stringify(checkoutData));
    router.push(`/checkout?data=${encodedData}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-6" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <h2 className="text-xl font-bold text-black87 mb-6 text-center">
        {t("title")}
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-black87">
          <span className="text-black60">{t("itemCount")}</span>
          <span className="font-medium">{totalItemQuantity}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-black60">{t("total")}</span>
          <span className="font-bold text-primary text-xl">
            {calculatedTotal.toLocaleString()} {t("currency")}
          </span>
        </div>
      </div>

      <Button onClick={handleCheckout} fullWidth size="lg" variant="primary" rounded>
        {t("checkout")}
      </Button>
    </div>
  );
};

export default React.memo(OrderSummary);