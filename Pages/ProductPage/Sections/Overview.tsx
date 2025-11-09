"use client";
import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Minus, Plus } from "lucide-react";
import { CustomImage } from "@/components/UI/Image/Images";
import { cartService } from "@/services/api/cart";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import Alert from "@/components/UI/Alert/alert";

// Import the FavoritesContext directly but mark it as client-side only
let FavoritesContext: any;

// This will only be executed on the client side
if (typeof window !== 'undefined') {
  FavoritesContext = require('@/services/favorites/FavoritesContext');
}

type Props = {
  id?: number | string;
  title?: string;
  description?: string;
  price?: number;
  imageList?: string[];
  rating?: number;
  ratingCount?: number;
  category?: string;
  stockQty?: number;
  stockType?: "unit" | "kg" | "ton";
};

const Overview: React.FC<Props> = ({
  id = 0,
  title = "Product Title",
  description = "",
  price = 0,
  imageList = ["/acessts/download (47).jpg"],
  rating = 0,
  ratingCount = 0,
  category = "غير محدد",
  stockQty = 0,
  stockType = "unit",
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(stockType);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const router = useRouter();

  // Initialize all state hooks at the top level
  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loved, setLoved] = useState(false);
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  
  // Initialize client-side state
  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
  }, []);
  
  // Always call useFavorites at the top level to maintain hook order
  const favoritesContext = FavoritesContext ? FavoritesContext.useFavorites() : null;
  
  // Update favorite state when id changes or favorites context changes
  useEffect(() => {
    if (isClient && favoritesContext && id) {
      const { isFavorite } = favoritesContext;
      const favoriteStatus = isFavorite(id);
      setIsFavoriteState(favoriteStatus);
      setLoved(favoriteStatus);
    }
  }, [id, isClient, favoritesContext]);

  const unitOptions = {
    unit: "لتر",
    kg: "كيلو",
    ton: "طن",
  };

  const handleUnitSelect = (key: keyof typeof unitOptions) => {
    setSelectedUnit(key);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageList.length) % imageList.length
    );
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setIsManualNavigation(true);
    setTimeout(() => setIsManualNavigation(false), 5000);
  };

  // Auto-play: advance to next image every 3 seconds
  useEffect(() => {
    if (imageList.length <= 1 || isHovering || isManualNavigation) return;

    const autoPlayInterval = setInterval(() => {
      nextImage();
    }, 3000);

    return () => clearInterval(autoPlayInterval);
  }, [imageList.length, isHovering, isManualNavigation]);

  // Keyboard navigation for image slider
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (imageList.length <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevImage();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageList.length]);

  const handleAddToCart = async () => {
    if (stockQty === 0 || isAdding) return;
    try {
      setIsAdding(true);
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }
      await cartService.addToCart({
        productId: String(id),
        quantity,
      });
      router.push("/cart");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isMounted) return;
    
    if (!isAuthenticated()) {
      setShowLoginAlert(true);
      return;
    }
    
    if (!favoritesContext) {
      setShowLoginAlert(true);
      return;
    }
    
    // Optimistically update the UI
    const newLovedState = !loved;
    setLoved(newLovedState);
    
    try {
      // Toggle the favorite in the context
      const { toggle } = favoritesContext;
      toggle({ 
        id, 
        name: title, 
        price, 
        image: imageList[0] || '/acessts/NoImage.jpg' 
      });
    } catch (err) {
      // Revert the UI if the API call fails
      console.error('Failed to toggle favorite:', err);
      setLoved(!newLovedState);
    }
  };

  const handleLoginConfirm = () => {
    setShowLoginAlert(false);
    router.push(
      "/login?redirect=" + encodeURIComponent(window.location.pathname)
    );
  };

  const handleLoginCancel = () => {
    setShowLoginAlert(false);
  };

  return (
    <section className="bg-white max-w-[95%] mx-auto rounded-2xl border shadow-sm p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <div
            className="w-full max-w-sm mx-auto lg:mx-0 aspect-square bg-card rounded-xl overflow-hidden flex items-center justify-center relative animate-in fade-in duration-500"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Main Image */}
            <CustomImage
              src={imageList[currentImageIndex] || "/acessts/download (47).jpg"}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              fill
              objectFit="contain"
              priority={true}
              fallbackSrc="/acessts/download (47).jpg"
              className="w-full h-full transition-all duration-700 ease-in-out"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Navigation Arrows - Only show if there are multiple images */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dots Navigation - Only show if there are multiple images */}
            {imageList.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {imageList.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                      index === currentImageIndex
                        ? "bg-white scale-125 animate-pulse"
                        : "bg-white/50 hover:bg-white/75"
                    } ${
                      !isHovering && !isManualNavigation && imageList.length > 1
                        ? "animate-pulse"
                        : ""
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 w-full">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black87 leading-snug flex-1">
              {title}
            </h1>
            <button
              aria-label={loved ? "remove from wishlist" : "add to wishlist"}
              onClick={toggleFavorite}
              className={`p-2 rounded-full border hover:border-primary transition-colors ${
                loved ? "text-primary border-primary" : "text-black60"
              }`}
            >
              <Heart className={`w-5 h-5 ${loved ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 mb-3">
            <span className="px-3 py-1 rounded-full text-xs border text-sm hover:border-primary hover:text-primary">
              {category}
            </span>
            <div className="text-2xl font-extrabold text-primary">
              {price.toLocaleString()} ج.م
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs border ${
                stockQty > 0
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {stockQty > 0 ? "متوفر في المخزون" : "غير متوفر"}
            </span>
          </div>

          {description && (
            <p className="text-black60 text-sm sm:text-base leading-relaxed mb-3">
              {description}
            </p>
          )}

          <div
            className="flex items-center gap-2 text-amber-500 mb-4"
            aria-label={`التقييم ${rating} من 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.round(rating) ? "text-amber-500" : "text-black16"
                }
              >
                ★
              </span>
            ))}
            <span className="text-black60 text-sm">({ratingCount})</span>
          </div>

          <div className="flex flex-row justify-between flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 order-1">
              {Object.entries(unitOptions).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    handleUnitSelect(key as keyof typeof unitOptions)
                  }
                  className={`w-[90px] h-[35px] px-4 py-1 rounded-full border text-sm transition-colors ${
                    selectedUnit === key
                      ? "border-primary text-primary bg-primary/10"
                      : "hover:border-primary hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 order-2">
              <div className="flex items-center gap-3 border rounded-full px-3 py-1 order-2">
                <button
                  aria-label="decrease"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="p-1 rounded-full hover:bg-black8"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="min-w-[1.5rem] text-center">{quantity}</span>
                <button
                  aria-label="increase"
                  onClick={() =>
                    setQuantity((prev) => Math.min(stockQty, prev + 1))
                  }
                  className="p-1 rounded-full hover:bg-black8"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="order-3 sm:ml-auto">
                <button
                  className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
                  disabled={stockQty === 0 || isAdding}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  أضف إلى سلة التسوق
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Alert */}
      {showLoginAlert && (
        <Alert
          message="يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة."
          setClose={handleLoginCancel}
          buttons={[
            {
              label: "إلغاء",
              onClick: handleLoginCancel,
              variant: "ghost",
            },
            {
              label: "تسجيل الدخول",
              onClick: handleLoginConfirm,
              variant: "primary",
            },
          ]}
          type="warning"
        />
      )}
    </section>
  );
};

export default React.memo(Overview);