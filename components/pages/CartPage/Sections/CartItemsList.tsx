import React from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { Button, IconButton } from "@/components/UI/Buttons/Button";
import { useRouter } from "next/navigation";
import ActionEmptyState from "@/components/UI/EmptyStates/ActionEmptyState";
import { useTranslations } from "next-intl";
import { getLocale } from "@/services/api/language";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  availability: string;
  category?: string;
};

type Props = {
  items?: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
};

const CartItemImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [imageSource, setImageSource] = React.useState("");
  const [hasError, setHasError] = React.useState(false);
  const isRTL = getLocale() === 'ar'; // Example for Arabic, adjust as needed


  React.useEffect(() => {
    if (!src) {
      setImageSource("/acessts/NoImage.jpg");
      return;
    }

    if (
      src.startsWith("http") ||
      src.startsWith("blob:") ||
      src.startsWith("data:")
    ) {
      setImageSource(src);
      return;
    }

    const cleanPath = src.replace(/^\/+/, "");

    if (cleanPath.startsWith("public/") || cleanPath.startsWith("uploads/")) {
      setImageSource(`/${cleanPath}`);
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      setImageSource(baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSource("/acessts/NoImage.jpg");
    }
  };

  if (!imageSource) {
    return (
      <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
      <img
        src={imageSource}
        alt={alt}
        onError={handleError}
        className="w-full h-full object-contain p-1"
        loading="lazy"
        crossOrigin="anonymous"
      />
    </div>
  );
};

const CartItemsList: React.FC<Props> = React.memo(
  ({ items = [], onUpdateQuantity = () => {}, onRemove = () => {} }) => {
    const router = useRouter();
    const t = useTranslations("cart");
    const  isRtl = getLocale() === 'ar'; // Example for Arabic, adjust as needed

    const cartItems = Array.isArray(items) ? items : [];

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
      if (newQuantity < 1) return;
      onUpdateQuantity(id, newQuantity);
    };

    if (cartItems.length === 0) {
      return (
        <div className="bg-white">
          <div className="p-12 text-center" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            <ActionEmptyState
              imageSrc="/icons/noItems.svg"
              imageAlt={t("empty.message")}
              message={t("empty.message")}
              actionLabel={t("empty.action")}
              actionHref="/"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white w-full" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="divide-y pt-[5px]">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="pt-[3px] sm:p-3 mt-[15px] mb-[15px] rounded-[10px] bg-white border-[2px] border-gray-200 w-full"
            >
              <div className="flex sm:flex-row gap-4">
                <div className="flex-shrink-0 m-auto">
                  <CartItemImage src={item.image} alt={item.name} />
                </div>

                <div className="flex-1 flex justify-between min-w-0">
                  <div className="flex flex-col justify-between items-start w-[35%] mb-2">
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
                      className="text-secondary1 hover:bg-gray-100 w-full sm:w-auto justify-start sm:justify-center sm:px-2"
                    >
                      <span className="text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">
                        {t("item.remove")}
                      </span>
                    </Button>
                  </div>

                  <div className="flex flex-col items-start w-[35%] sm:flex-col sm:items-center pr-[10px] sm:pr-3 justify-between gap-4">
                    <div className="text-left w-[100%] pl-2 sm:pl-3">
                      <div className="text-l font-bold text-black60">
                        {(item.price * item.quantity).toLocaleString()}{" "}
                        {t("item.pricePerUnit", { unit: item.unit })}
                      </div>
                    </div>

                    <div className="w-full flex justify-end pr-2 sm:pr-4">
                      <div className="w-full flex justify-end pr-2 sm:pr-4">
                        <div
                          className="flex items-center justify-end gap-1 sm:gap-3 mb-3 ml-1"
                          dir="ltr"
                        >
                          <IconButton
                            aria-label={t("item.decreaseQty")}
                            title={t("item.decreaseQty")}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 hover:bg-gray-100"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            icon={<Minus className="w-3 h-3 sm:w-4 sm:h-4" />}
                          />
                          <span className="w-6 sm:w-8 text-center text-sm sm:text-base">
                            {Number(item.quantity.toFixed(3))}
                          </span>
                          <IconButton
                            aria-label={t("item.increaseQty")}
                            title={t("item.increaseQty")}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300 hover:bg-gray-100"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            icon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

CartItemsList.displayName = "CartItemsList";

export default React.memo(CartItemsList);