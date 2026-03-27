"use client";
import { useMemo, useCallback, useState } from 'react';
import type { StaticImageData } from "next/image";
import { useTranslations } from 'next-intl';

import styles from '@/components/UI/Card/card.module.css';

// Components
import { CustomImage } from '@/components/UI/Image/Images';
import Availablity from '@/components/UI/Card/Availablity';
import { useFavorites } from '@/services/favorites/FavoritesContext';
import Alert from '@/components/UI/Alert/alert';

// Types & helpers
import type { Product, ProductVariant } from '@/services/product/products';
import { getProductUnitLabel, getProductAttributes } from '@/services/product/products';

// Assets
import Img from '@/public/acessts/NoImage.jpg';
import { useRouter } from 'next/navigation';

const EHEART_SRC = '/icons/emptyHeart.svg';
const FHEART_SRC = '/icons/FilledHeart.svg';

interface CardProps {
  productImg?: string | StaticImageData;
  productName?: string;
  productCategory?: string;
  productPrice?: string;
  originalPrice?: string;
  discount?: number;
  productId?: string;
  available?: boolean;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  isLoading?: boolean;
  product?: Product;
  // NEW: variant selection
  activeVariantId?: string;
  onVariantSelect?: (productId: string | number, variantId: string) => void;
  // Legacy unit flags (kept for backward compat)
  IsKG?: boolean;
  IsTON?: boolean;
  IsLITER?: boolean;
  IsCUBIC_METER?: boolean;
}

// ─── helpers ────────────────────────────────────────────────────────────────

const formatPrice = (price: string | number | undefined): string => {
  if (!price) return '0';
  const n = typeof price === 'string'
    ? parseFloat(price.replace(/[^0-9.]/g, ''))
    : price;
  return isNaN(n) ? '0' : n.toLocaleString('ar-EG');
};

const calculateDiscountPercentage = (original: number, current: number): number => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

const resolveSwatchColor = (value: string): string => {
  const map: Record<string, string> = {
    أبيض: '#ffffff', white: '#ffffff',
    أسود: '#111111', black: '#111111',
    أحمر: '#ef4444', red: '#ef4444',
    أزرق: '#3b82f6', blue: '#3b82f6',
    أخضر: '#22c55e', green: '#22c55e',
    أصفر: '#eab308', yellow: '#eab308',
    برتقالي: '#f97316', orange: '#f97316',
    بنفسجي: '#a855f7', purple: '#a855f7',
    وردي: '#ec4899', pink: '#ec4899',
    رمادي: '#6b7280', gray: '#6b7280', grey: '#6b7280',
    بني: '#92400e', brown: '#92400e',
    ذهبي: '#ca8a04', gold: '#ca8a04',
    فضي: '#9ca3af', silver: '#9ca3af',
  };
  const lower = value.toLowerCase().trim();
  return map[lower] || '#e5e7eb';
};

const isColorAttr = (name: string): boolean =>
  /color|colour|لون/i.test(name);

// ─── Carton helpers (module-level, reusable) ─────────────────────────────────

const CARTON_KEYS = ['carton', 'كرتونة', 'cartons', 'كراتين', 'ctn', 'box'];

const isCartonUnit = (name: string): boolean =>
  CARTON_KEYS.includes(name.toLowerCase().trim());

// ─── Component ───────────────────────────────────────────────────────────────

function Card({
  productImg = Img,
  productName,
  productCategory,
  productPrice,
  originalPrice,
  discount,
  productId,
  available = true,
  rating,
  reviewsCount,
  badge,
  isLoading = false,
  product,
  activeVariantId,
  onVariantSelect,
  IsKG,
  IsTON,
  IsLITER,
  IsCUBIC_METER,
}: CardProps) {
  const { toggle, isFavorite } = useFavorites();
  const router = useRouter();
  const t = useTranslations('overview');
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // ── active variant unit info ──────────────────────────────────────────────

  const variants: ProductVariant[] = product?.productVariants || [];

  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    if (activeVariantId) {
      return variants.find(v => (v.id || v._id) === activeVariantId) ?? variants[0];
    }
    return variants[0];
  }, [variants, activeVariantId]);

  const activeUnitName = activeVariant?.unitId?.name ?? '';
  const activeConversionRate = activeVariant?.unitId?.conversionRate ?? 1;


  // ── unit label helper ─────────────────────────────────────────────────────

 // Replace the buildUnitLabel helper with this:
const buildUnitLabel = useCallback(
  (name: string, count = 1, conversionRate?: number): string => {
    const key = name.toLowerCase();
    const knownKeys = [
      'piece', 'kg', 'ton', 'liter', 'cubic_meter', 'meter', 'gram', 'carton',
    ];

    let label: string;
    if (knownKeys.includes(key)) {
      try {
        label = count !== 1 ? t(`units.${key}_plural`) : t(`units.${key}`);
      } catch {
        label = name;
      }
    } else {
      label = name;
    }

    // Carton: just append pieces — no number prefix
    if (isCartonUnit(name) && conversionRate && conversionRate > 1) {
      try {
        const piecesKey = conversionRate !== 1
          ? 'units.piecesInCarton_plural'
          : 'units.piecesInCarton';
        return `${label} ${t(piecesKey, { count: conversionRate })}`;
      } catch {
        return `${label} (${conversionRate} ${t('units.piece')})`;
      }
    }

    // Non-carton: embed the count in the string
    return `${count} ${label}`;
  },
  [t],
);
  
  /**
   * The full unit string shown next to the price.
   * e.g. "12 كرتونة (12 قطعة)"  |  "1 قطعة"  |  "50 كيلو"
   */
  const priceUnitLabel = useMemo(() => {
    if (!activeUnitName) {
      // Fallback to legacy helper when no variant data available
      if (product) return getProductUnitLabel(product);
      const mockProduct = { IsKG, IsTON, IsLITER, IsCUBIC_METER } as Product;
      return getProductUnitLabel(mockProduct);
    }
    return buildUnitLabel(activeUnitName, activeConversionRate, activeConversionRate);
  }, [activeUnitName, activeConversionRate, buildUnitLabel, product, IsKG, IsTON, IsLITER, IsCUBIC_METER]);

  // ── derived numeric values ────────────────────────────────────────────────

  const numericPrice = useMemo(() => {
    const n = parseFloat(String(productPrice ?? '0').replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }, [productPrice]);

  const numericOriginalPrice = useMemo(() => {
    if (!originalPrice) return null;
    const n = parseFloat(String(originalPrice).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }, [originalPrice]);

  const imageSrc = useMemo(() => {
    return typeof productImg === 'string'
      ? productImg
      : (productImg?.src || '/acessts/NoImage.jpg');
  }, [productImg]);

  const id = useMemo(
    () => productId || productName || imageSrc,
    [productId, productName, imageSrc],
  );

  const loved = isFavorite(id!);

  const discountPercentage = useMemo(() => {
    if (discount) return discount;
    if (numericOriginalPrice && numericPrice) {
      return calculateDiscountPercentage(numericOriginalPrice, numericPrice);
    }
    return 0;
  }, [discount, numericOriginalPrice, numericPrice]);

  // ── variant / attribute data ──────────────────────────────────────────────

  const attributeGroups = useMemo(() => {
    if (!variants.length) return {} as Record<string, { value: string; variantId: string }[]>;
    const groups: Record<string, { value: string; variantId: string }[]> = {};
    for (const variant of variants) {
      const vid = variant.id || variant._id;
      for (const link of variant.attributeLinks || []) {
        const attrName = link.attributeValueId?.attributeId?.name || 'Unknown';
        const attrValue = link.attributeValueId?.value || '';
        if (!attrValue) continue;
        if (!groups[attrName]) groups[attrName] = [];
        if (!groups[attrName].some(e => e.value === attrValue)) {
          groups[attrName].push({ value: attrValue, variantId: vid });
        }
      }
    }
    return groups;
  }, [variants]);

  const getActiveValueForAttr = useCallback(
    (attrName: string): string | null => {
      if (!activeVariantId) return null;
      const variant = variants.find(v => (v.id || v._id) === activeVariantId);
      if (!variant) return null;
      const link = variant.attributeLinks?.find(
        l => l.attributeValueId?.attributeId?.name === attrName,
      );
      return link?.attributeValueId?.value || null;
    },
    [activeVariantId, variants],
  );

  const handleAttrSelect = useCallback(
    (attrName: string, selectedValue: string) => {
      if (!onVariantSelect || !productId || !variants.length) return;
      const activeVar = variants.find(v => (v.id || v._id) === activeVariantId);
      const currentAttrs: Record<string, string> = {};
      for (const link of activeVar?.attributeLinks || []) {
        const name = link.attributeValueId?.attributeId?.name;
        const val = link.attributeValueId?.value;
        if (name && val) currentAttrs[name] = val;
      }
      currentAttrs[attrName] = selectedValue;
      const match = variants.find(variant =>
        Object.entries(currentAttrs).every(([name, val]) =>
          variant.attributeLinks?.some(
            l =>
              l.attributeValueId?.attributeId?.name === name &&
              l.attributeValueId?.value === val,
          ),
        ),
      );
      const targetVariant = match || variants.find(
        v => v.attributeLinks?.some(
          l =>
            l.attributeValueId?.attributeId?.name === attrName &&
            l.attributeValueId?.value === selectedValue,
        ),
      );
      if (targetVariant) {
        onVariantSelect(productId, targetVariant.id || targetVariant._id);
      }
    },
    [onVariantSelect, productId, variants, activeVariantId],
  );

  // ── interaction handlers ──────────────────────────────────────────────────

  const onHeartClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || isLoading) return;
      const { UserStorage } = require('@/services/auth/login');
      if (!UserStorage.getUser()) {
        setShowLoginAlert(true);
        return;
      }
      toggle({ id, name: productName || 'منتج', price: numericPrice, image: imageSrc });
    },
    [id, toggle, productName, numericPrice, imageSrc, isLoading],
  );

  const handleLoginConfirm = useCallback(() => {
    setShowLoginAlert(false);
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
  }, [router]);

  const handleLoginCancel = useCallback(() => setShowLoginAlert(false), []);

  const handleCardClick = useCallback(() => {
    if (isLoading) return;
    const target = productId ? String(productId) : (productName || '');
    router.push(`/product/${encodeURIComponent(target)}`);
  }, [router, productName, productId, isLoading]);

  // ── loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={`${styles.card} ${styles.loading}`}>
        <div className={styles.cardHeader}>
          <div className={styles.skeletonImage}></div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.skeletonCategory}></div>
          <div className={styles.skeletonName}></div>
          <div className={styles.skeletonPrice}></div>
        </div>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={`${styles.card} ${!available ? styles.unavailable : ''}`}
        onClick={handleCardClick}
      >
        {/* Badges */}
        {badge && <div className={styles.badge}>{badge}</div>}
        {discountPercentage > 0 && (
          <div className={styles.discountBadge}>-{discountPercentage}%</div>
        )}

        {/* Header: heart + image + availability */}
        <div className={styles.cardHeader}>
          <div className={styles.icon}>
            <img
              src={loved ? FHEART_SRC : EHEART_SRC}
              onClick={onHeartClick}
              className={styles.heartIcon}
              role="button"
              aria-label={loved ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              alt={loved ? 'مفضل' : 'غير مفضل'}
            />
          </div>

          <div
            className={styles.cardImage}
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') handleCardClick();
            }}
          >
            <CustomImage
              src={imageSrc}
              alt={productName || 'صورة المنتج'}
              width={240}
              height={240}
              rounded="md"
              className={styles.img}
              objectFit="cover"
              priority
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>

          <div className={styles.available}>
            <Availablity available={available} />
          </div>
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          <div className={styles.category}>
            <span className={styles.categoryText}>{productCategory || 'غير محدد'}</span>
          </div>

          <h2 className={styles.productName} title={productName} onClick={handleCardClick}>
            {productName || 'اسم المنتج'}
          </h2>

          {/* Price */}
          <div className={styles.priceSection}>
            <div className={styles.currentPrice}>
              {formatPrice(productPrice)}
              <span className={styles.currency}> ج.م</span>
              {priceUnitLabel && (
                <span className={styles.unitLabel}>
                  {' / '} {priceUnitLabel}
                </span>
              )}
            </div>

            {numericOriginalPrice && numericOriginalPrice > numericPrice && (
              <div className={styles.originalPrice}>
                {formatPrice(originalPrice)}
                <span className={styles.currency}> ج.م</span>
                {priceUnitLabel && (
                  <span className={styles.unitLabel}>
                    {' / '} {priceUnitLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login alert */}
      {showLoginAlert && (
        <Alert
          message="يجب عليك تسجيل الدخول أولاً لإضافة المنتجات إلى المفضلة."
          setClose={handleLoginCancel}
          buttons={[
            { label: 'إلغاء', onClick: handleLoginCancel, variant: 'ghost' },
            { label: 'تسجيل الدخول', onClick: handleLoginConfirm, variant: 'primary' },
          ]}
          type="warning"
        />
      )}
    </>
  );
}

export default Card;