"use client";
import React, { useState, useEffect } from "react";
import CartHeader from "./Sections/CartHeader";
import CartItemsList from "./Sections/CartItemsList";
import OrderSummary from "./Sections/OrderSummary";
import RelatedProducts from "@/components/UI/RelatedProducts/RelatedProducts";
import { cartService, getClientCartItems } from "@/services/api/cart";
import { isAuthenticated } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations("cart");

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!isAuthenticated()) return;

        await cartService.getCart();
        const processedItems = await getClientCartItems();

        const unitMap: Record<string, string> = {
          unit: t("units.unit"),
          kg: t("units.kg"),
          ton: t("units.ton"),
          liter: t("units.liter"),
          cubic_meter: t("units.cubic_meter"),
        };

        const mapped: CartItem[] = processedItems.map((it: any) => {
          const p = it.product || {};

          const selectedUnit = unitMap[it.unit] || it.unit || t("units.unit");

          let imageUrl = "/acessts/NoImage.jpg";
          const imageSources = p.imageList || p.images || p.image || [];

          if (Array.isArray(imageSources) && imageSources.length > 0) {
            const firstImage = imageSources[0];
            if (typeof firstImage === "string") {
              imageUrl = firstImage;
            } else if (firstImage?.url) {
              imageUrl = firstImage.url;
            }
          } else if (typeof imageSources === "string") {
            imageUrl = imageSources;
          }

          if (!imageUrl || imageUrl === "/acessts/NoImage.jpg") {
            imageUrl =
              p.thumbnail ||
              p.mainImage ||
              p.coverImage ||
              p.imageUrl ||
              "/acessts/NoImage.jpg";
          }

          if (
            imageUrl &&
            !imageUrl.startsWith("http") &&
            !imageUrl.startsWith("blob:") &&
            !imageUrl.startsWith("data:")
          ) {
            const cleanPath = imageUrl.replace(/^\/+/, "");
            if (
              cleanPath.startsWith("public/") ||
              cleanPath.startsWith("uploads/") ||
              cleanPath.startsWith("acessts/")
            ) {
              imageUrl = `/${cleanPath}`;
            } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
              imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
            } else {
              imageUrl = `/${cleanPath}`;
            }
          }

          const availability =
            (p.stockQty ?? p.quantity ?? 0) > 0
              ? t("availability.inStock")
              : t("availability.outOfStock");

          return {
            id: String(it._id),
            name: p.name || p.title || t("item.defaultName"),
            price: it.price || 0,
            quantity: it.quantity || 1,
            image: imageUrl,
            unit: selectedUnit,
            availability,
            category: p.category,
          };
        });

        setCartItems(mapped);
        console.log("Fetched and processed cart items:", mapped);
      } catch (error: any) {
        console.error("Error fetching cart items:", error);
        if (error?.response?.status === 401) return;
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await cartService.removeFromCart(id);
        setCartItems((items) => items.filter((item) => item.id !== id));
        return;
      }
      await cartService.updateCartItem(id, newQuantity);
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (e) {
      console.error("Failed to update cart item quantity", e);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Failed to remove cart item", e);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-black87">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-beiruti pt-5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div
          className={`grid ${cartItems.length > 0 ? "lg:grid-cols-12" : "w-full"} gap-4 md:gap-6 mt-24`}
        >
          <div
            className={`${cartItems.length > 0 ? "lg:col-span-8 xl:col-span-9" : "w-full"}`}
          >
            <div
              className={`bg-white flex flex-col gap-2 ${cartItems.length === 0 ? "mt-14 sm:mt-20" : ""}`}
            >
              {cartItems.length > 0 && (
                <CartHeader itemCount={cartItems.length} />
              )}
              <div className="mt-0">
                <CartItemsList
                  items={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              </div>
            </div>
          </div>

          {cartItems.length > 0 && (
            <div
              className="lg:col-span-4 xl:col-span-3 justify-self-center w-full"
            >
              <div className="sticky top-32 space-y-4">
                <OrderSummary
                  order={cartItems}
                  itemCount={cartItems.length}
                  total={subtotal}
                  hasItems={cartItems.length > 0}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-12">
          <RelatedProducts />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CartPage);