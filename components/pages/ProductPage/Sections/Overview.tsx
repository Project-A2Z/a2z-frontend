"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  BadgeCheck,
} from "lucide-react";
import { Minus, Plus } from "lucide-react";
import { CustomImage } from "@/components/UI/Image/Images";
import { cartService, checkProductUnitConflict } from "@/services/api/cart";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import Alert from "@/components/UI/Alert/alert";
import { ProductVariant} from "@/services/api/products";

// Import the FavoritesContext directly but mark it as client-side only
let FavoritesContext: any;
if (typeof window !== "undefined") {
  FavoritesContext = require("@/services/favorites/FavoritesContext");
}

type Props = {
  id?: number | string;
  title?: string;
  description?: string;
  imageList?: string[];
  rating?: number;
  ratingCount?: number;
  category?: string;
  /** Replaces isUNIT / isKG / isTON / isLITER / isCUBIC_METER */
  variants?: ProductVariant[];
  /** Advantages/features array ("1 Year Warranty", "Free Shipping", …) */
  advProduct?: string[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return a human-readable Arabic label for a unit name. */
function unitLabel(name: string): string {
  const map: Record<string, string> = {
    piece: "قطعة",
    kg: "كيلو",
    ton: "طن",
    liter: "لتر",
    cubic_meter: "متر مكعب",
    meter: "متر",
    gram: "جرام",
  };
  return map[name.toLowerCase()] ?? name;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Overview: React.FC<Props> = ({
  id = 0,
  title = "Product Title",
  description = "",
  imageList = ["/acessts/NoImage.jpg"],
  rating = 0,
  ratingCount = 0,
  category = "غير محدد",
  variants = [],
  advProduct = [],
}) => {
  const router = useRouter();

  // ── Variant / unit selection ───────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants[0] ?? null
  );

  // Keep selectedVariant in sync if variants prop changes
  useEffect(() => {
    if (variants.length > 0) setSelectedVariant(variants[0]);
  }, [variants]);

  const displayedPrice = selectedVariant?.price ?? 0;
  const stockQty = selectedVariant?.totalQuantity ?? 0;
  const selectedUnitName = selectedVariant?.unitId?.name ?? "unit";

  /**
   * Derive the attributeValueId for the selected variant.
   * The API accepts a single attributeValueId; we take the first one.
   */
  const selectedAttributeValueId: string | undefined = useMemo(
    () => selectedVariant?.attributeLinks?.[0]?.attributeValueId?._id,
    [selectedVariant]
  );

  // Variant attributes label (e.g. "أزرق · لون")
  const variantAttributeLabel = (v: ProductVariant) =>
    v.attributeLinks
      .map((al) => al.attributeValueId?.value ?? "")
      .filter(Boolean)
      .join(" · ");

  // ── Quantity ──────────────────────────────────────────────────────────────
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Reset quantity to 1 when variant changes
  useEffect(() => { setQuantity(1); }, [selectedVariant]);

  // ── Image carousel ────────────────────────────────────────────────────────
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  };
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  };

  useEffect(() => {
    if (imageList.length <= 1 || isHovering || isManualNavigation) return;
    const id = setInterval(nextImage, 3000);
    return () => clearInterval(id);
  }, [imageList.length, isHovering, isManualNavigation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (imageList.length <= 1) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); prevImage(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nextImage(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageList.length]);

  // ── Favorites ─────────────────────────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loved, setLoved] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    cartService.getCart().catch(() => {});
  }, []);

  const favoritesContext = FavoritesContext ? FavoritesContext.useFavorites() : null;

  useEffect(() => {
    if (isClient && favoritesContext && id) {
      setLoved(favoritesContext.isFavorite(id));
    }
  }, [id, isClient, favoritesContext]);

  const toggleFavorite = async () => {
    if (!isMounted) return;
    if (!isAuthenticated()) { setShowLoginAlert(true); return; }
    if (!favoritesContext) { setShowLoginAlert(true); return; }

    const next = !loved;
    setLoved(next);
    try {
      favoritesContext.toggle({
        id,
        name: title,
        price: displayedPrice,
        image: imageList[0] || "/acessts/NoImage.jpg",
      });
    } catch {
      setLoved(!next);
    }
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (stockQty === 0 || isAdding || !selectedVariant) return;

    // ✅ NEW: conflict check uses variantId (_id) instead of product id
    const variantId = selectedVariant._id;
    const conflict = checkProductUnitConflict(variantId, selectedUnitName);
    if (conflict) return;

    if (!isAuthenticated()) { router.push("/login"); return; }

    try {
      setIsAdding(true);

      // ✅ NEW: send variantId + attributeValueId (instead of productId + unit)
      await cartService.addToCart({
        variantId,
        quantity,
        unit: selectedUnitName,
        ...(selectedAttributeValueId && { attributeValueId: selectedAttributeValueId }),
      });

      await cartService.getCart();
      router.push("/cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <section className="bg-white max-w-[95%] mx-auto rounded-2xl border shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── Image carousel ── */}
          <div className="lg:col-span-4">
            <div
              className="w-full max-w-sm mx-auto lg:mx-0 aspect-square bg-card rounded-xl overflow-hidden flex items-center justify-center relative animate-in fade-in duration-500"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <CustomImage
                key={currentImageIndex}
                src={imageList[currentImageIndex] || "/acessts/download (47).jpg"}
                alt={`${title} - Image ${currentImageIndex + 1}`}
                fill
                objectFit="contain"
                priority
                fallbackSrc="/acessts/download (47).jpg"
                className="w-full h-full transition-all duration-700 ease-in-out"
              />

              {imageList.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-10" aria-label="Previous image">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-10" aria-label="Next image">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {imageList.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${index === currentImageIndex ? "bg-white scale-125 animate-pulse" : "bg-white/50 hover:bg-white/75"}`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="lg:col-span-8 w-full">

            {/* Title + wishlist */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black87 leading-snug flex-1">
                {title}
              </h1>
              <button
                aria-label={loved ? "remove from wishlist" : "add to wishlist"}
                onClick={toggleFavorite}
                className={`p-2 rounded-full border hover:border-primary transition-colors ${loved ? "text-primary border-primary" : "text-black60"}`}
              >
                <Heart className={`w-5 h-5 ${loved ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Category + price + stock */}
            <div className="flex flex-col items-start justify-between gap-4 mb-3">
              <span className="px-3 py-1 rounded-full border text-sm hover:border-primary hover:text-primary">
                {category}
              </span>

              <div className="text-2xl font-extrabold text-primary">
                {displayedPrice.toLocaleString()} ج.م
                <span className="text-sm font-normal text-black60 mr-2">
                  / {unitLabel(selectedUnitName)}
                </span>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs border ${stockQty > 0 ? "bg-primary text-white border-primary" : "bg-disabled text-white  cursor-not-allowed"}`}>
                {stockQty > 0 ? `متوفر (${stockQty})` : "غير متوفر"}
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className="text-black60 text-sm sm:text-base leading-relaxed mb-3">
                {description}
              </p>
            )}

            {/* Rating stars */}
            <div className="flex items-center gap-2 text-amber-500 mb-4" aria-label={`التقييم ${rating} من 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
              ))}
              <span className="text-black60 text-sm">({ratingCount})</span>
            </div>

            {/* ── Variant selector ── */}
            {variants.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-black60 mb-2">اختر النوع:</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const attrLabel = variantAttributeLabel(v);
                    const label = attrLabel
                      ? `${unitLabel(v.unitId?.name ?? "")} · ${attrLabel}`
                      : unitLabel(v.unitId?.name ?? "");

                    return (
                      <button
                        key={v._id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                          selectedVariant?._id === v._id
                            ? "border-primary text-primary bg-primary/10"
                            : "hover:border-primary hover:text-primary hover:bg-gray-50"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Quantity + add to cart ── */}
            <div className="flex flex-row justify-between flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 border rounded-full px-3 py-1">
                <button aria-label="decrease" onClick={() => setQuantity((p) => Math.max(1, p - 1))} className="p-1 rounded-full hover:bg-black8">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[1.5rem] text-center">{quantity}</span>
                <button aria-label="increase" onClick={() => setQuantity((p) => Math.min(stockQty, p + 1))} className="p-1 rounded-full hover:bg-black8">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={stockQty === 0 || isAdding}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                أضف إلى سلة التسوق
              </button>
            </div>

            {/* ── Advantages / features strip ── */}
            {/* {advProduct.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {advProduct.map((adv, i) => (
                  <span key={adv._id ?? i} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {adv.text ?? JSON.stringify(adv)}
                  </span>
                ))}
              </div>
            )} */}
          </div>
        </div>

        {showLoginAlert && (
          <Alert
            message="يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة."
            setClose={() => setShowLoginAlert(false)}
            buttons={[
              { label: "إلغاء", onClick: () => setShowLoginAlert(false), variant: "ghost" },
              { label: "تسجيل الدخول", onClick: handleLoginConfirm, variant: "primary" },
            ]}
            type="warning"
          />
        )}
      </section>

   
    </>
  );
};

export default React.memo(Overview);