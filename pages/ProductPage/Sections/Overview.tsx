"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Minus, Plus } from "lucide-react";
import { CustomImage } from "@/components/UI/Image/Images";
import { cartService, checkProductUnitConflict } from "@/services/api/cart";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/utils/auth";
import Alert from "@/components/UI/Alert/alert";

// Import the FavoritesContext directly but mark it as client-side only
let FavoritesContext: any;

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
  isUNIT?: boolean;
  isKG?: boolean;
  isTON?: boolean;
  isLITER?: boolean;
  isCUBIC_METER?: boolean;
};

// Helper function to calculate price based on unit conversion
const calculatePriceForUnit = (basePrice: number, baseUnit: string, targetUnit: string): number => {
  // Define conversion rules
  const conversions: { [key: string]: { [key: string]: number } } = {
    'kg': {
      'kg': 1,
      'ton': 1000,  // 1 ton = 1000 kg, so price * 1000
    },
    'liter': {
      'liter': 1,
      'cubic_meter': 1000,  // 1 cubic meter = 1000 liters, so price * 1000
    },
  };

  // If same unit, return base price
  if (baseUnit === targetUnit) {
    return basePrice;
  }

  // Check if conversion exists
  if (conversions[baseUnit] && conversions[baseUnit][targetUnit]) {
    return basePrice * conversions[baseUnit][targetUnit];
  }

  // Default: return base price if no conversion rule exists
  return basePrice;
};

// Helper function to get base unit (the smallest unit available)
const getBaseUnit = (props: {
  isUNIT?: boolean;
  isKG?: boolean;
  isTON?: boolean;
  isLITER?: boolean;
  isCUBIC_METER?: boolean;
}): string => {
  if (props.isKG) return 'kg';
  if (props.isLITER) return 'liter';
  if (props.isTON) return 'ton';
  if (props.isCUBIC_METER) return 'cubic_meter';
  return 'unit';
};

const Overview: React.FC<Props> = ({
  id = 0,
  title = "Product Title",
  description = "",
  price = 0,
  imageList = ["/placeholder-product.jpg"],
  rating = 0,
  ratingCount = 0,
  category = "غير محدد",
  stockQty = 0,
  isUNIT = false,
  isKG = false,
  isTON = false,
  isLITER = false,
  isCUBIC_METER = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // Define available units based on props
  const unitOptions = React.useMemo(() => {
    const options: Array<{key: string, label: string}> = [];
    if (isUNIT) options.push({ key: 'unit', label: 'قطعة' });
    if (isKG) options.push({ key: 'kg', label: 'كيلو' });
    if (isTON) options.push({ key: 'ton', label: 'طن' });
    if (isLITER) options.push({ key: 'liter', label: 'لتر' });
    if (isCUBIC_METER) options.push({ key: 'cubic_meter', label: 'متر مكعب' });
    return options.length > 0 ? options : [{ key: 'unit', label: 'قطعة' }];
  }, [isUNIT, isKG, isTON, isLITER, isCUBIC_METER]);

  // Get the base unit for price calculation
  const baseUnit = useMemo(() => getBaseUnit({ isUNIT, isKG, isTON, isLITER, isCUBIC_METER }), 
    [isUNIT, isKG, isTON, isLITER, isCUBIC_METER]);

  const [selectedUnit, setSelectedUnit] = useState<string>(unitOptions[0]?.key || 'unit');
  
  // Calculate displayed price based on selected unit
  const displayedPrice = useMemo(() => {
    return calculatePriceForUnit(price, baseUnit, selectedUnit);
  }, [price, baseUnit, selectedUnit]);

  // Update selected unit if the first unit changes
  useEffect(() => {
    if (unitOptions.length > 0 && !unitOptions.some(u => u.key === selectedUnit)) {
      setSelectedUnit(unitOptions[0].key);
    }
  }, [unitOptions, selectedUnit]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loved, setLoved] = useState(false);
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    
    cartService.getCart().catch(error => {
      console.error("Failed to fetch cart for validation:", error);
    });
  }, []);
  
  const favoritesContext = FavoritesContext ? FavoritesContext.useFavorites() : null;
  
  useEffect(() => {
    if (isClient && favoritesContext && id) {
      const { isFavorite } = favoritesContext;
      const favoriteStatus = isFavorite(id);
      setIsFavoriteState(favoriteStatus);
      setLoved(favoriteStatus);
    }
  }, [id, isClient, favoritesContext]);

  const availableUnits = React.useMemo(() => {
    const units: { [key: string]: string } = {};
    if (isUNIT) units.unit = 'قطعة';
    if (isKG) units.kg = 'كيلو';
    if (isTON) units.ton = 'طن';
    if (isLITER) units.liter = 'لتر';
    if (isCUBIC_METER) units.cubic_meter = 'متر مكعب';
    return Object.keys(units).length > 0 ? units : { unit: 'قطعة' };
  }, [isUNIT, isKG, isTON, isLITER, isCUBIC_METER]);

  const handleUnitSelect = (key: string) => {
    if (key in availableUnits) {
      setSelectedUnit(key);
    }
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

  useEffect(() => {
    if (imageList.length <= 1 || isHovering || isManualNavigation) return;

    const autoPlayInterval = setInterval(() => {
      nextImage();
    }, 3000);

    return () => clearInterval(autoPlayInterval);
  }, [imageList.length, isHovering, isManualNavigation]);

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
    
    const hasConflict = checkProductUnitConflict(String(id), selectedUnit);
    if (hasConflict) {
      return;
    }

    try {
      setIsAdding(true);
      if (!isAuthenticated()) {
        router.push("/login");
        return;
      }

      const cartItemKey = `cart_item_${id}`;
      localStorage.setItem(cartItemKey, JSON.stringify({
        unit: selectedUnit,
        quantity: quantity
      }));

      await cartService.addToCart({
        productId: String(id),
        quantity: quantity,
        unit: selectedUnit, 
      });
      
      await cartService.getCart();
      router.push("/cart");
    } catch (error) {
      console.error('Error adding to cart:', error);
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
    
    const newLovedState = !loved;
    setLoved(newLovedState);
    
    try {
      const { toggle } = favoritesContext;
      toggle({ 
        id, 
        name: title, 
        price, 
        image: imageList[0] || '/acessts/NoImage.jpg' 
      });
    } catch (err) {
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
            <CustomImage
              src={imageList[currentImageIndex] || "/acessts/download (47).jpg"}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              fill
              objectFit="contain"
              priority={true}
              fallbackSrc="/acessts/download (47).jpg"
              className="w-full h-full transition-all duration-700 ease-in-out"
            />

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
            <span className="px-3 py-1 rounded-full  border text-sm hover:border-primary hover:text-primary">
              {category}
            </span>
            <div className="text-2xl font-extrabold text-primary">
              {displayedPrice.toLocaleString()} ج.م
              <span className="text-sm font-normal text-black60 mr-2">
                / {availableUnits[selectedUnit]}
              </span>
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
              {Object.entries(availableUnits).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleUnitSelect(key)}
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