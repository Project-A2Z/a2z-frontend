"use client";
import { useMemo, useCallback, useState } from 'react';
import type { StaticImageData } from "next/image";

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

/** Returns a deterministic background colour for a named colour value. */
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
  return map[lower] || '#e5e7eb'; // neutral fallback
};

/** True when the attribute name looks like a colour field. */
const isColorAttr = (name: string): boolean =>
  /color|colour|لون/i.test(name);

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
  const [showLoginAlert, setShowLoginAlert] = useState(false);

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

  // ── unit label ────────────────────────────────────────────────────────────

  const unitLabel = useMemo(() => {
    if (product) return getProductUnitLabel(product);
    const mockProduct = { IsKG, IsTON, IsLITER, IsCUBIC_METER } as Product;
    return getProductUnitLabel(mockProduct);
  }, [product, IsKG, IsTON, IsLITER, IsCUBIC_METER]);

  // ── variant data ──────────────────────────────────────────────────────────

  const variants: ProductVariant[] = product?.productVariants || [];

  /**
   * Group attribute values by attribute name across ALL variants.
   * Result: { "Color": [{value, variantId}, ...], "Size": [...] }
   */
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
        // Avoid duplicate values in the same attribute group
        if (!groups[attrName].some(e => e.value === attrValue)) {
          groups[attrName].push({ value: attrValue, variantId: vid });
        }
      }
    }

    return groups;
  }, [variants]);

  /** Find which value of a given attribute belongs to the active variant */
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

  /**
   * When a swatch / option is clicked, find the variant that matches
   * the new value for this attribute while keeping other active attribute values.
   */
  const handleAttrSelect = useCallback(
    (attrName: string, selectedValue: string) => {
      if (!onVariantSelect || !productId || !variants.length) return;

      // Build "desired" attributes: current active attrs overridden with new selection
      const activeVariant = variants.find(v => (v.id || v._id) === activeVariantId);
      const currentAttrs: Record<string, string> = {};

      for (const link of activeVariant?.attributeLinks || []) {
        const name = link.attributeValueId?.attributeId?.name;
        const val = link.attributeValueId?.value;
        if (name && val) currentAttrs[name] = val;
      }
      currentAttrs[attrName] = selectedValue;

      // Find the best matching variant
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

  const hasAttributes = Object.keys(attributeGroups).length > 0;

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

          {/* ── NEW: Attribute selectors ─────────────────────────────── */}
          {hasAttributes && (
            <div
              className={styles.attributesSection}
              onClick={e => e.stopPropagation()} // prevent card navigation on attr click
            >
              {Object.entries(attributeGroups).map(([attrName, options]) => {
                const activeValue = getActiveValueForAttr(attrName);
                const isColor = isColorAttr(attrName);

                return (
                  <div key={attrName} className={styles.attributeGroup}>
                    {/* Only show label when there's more than one attribute type */}
                    {Object.keys(attributeGroups).length > 1 && (
                      <span className={styles.attributeLabel}>{attrName}:</span>
                    )}

                    <div className={styles.attributeOptions}>
                      {options.map(({ value, variantId }) => {
                        const isActive = activeValue === value;

                        if (isColor) {
                          // Render colour swatch
                          return (
                            <button
                              key={variantId}
                              className={`${styles.colorSwatch} ${isActive ? styles.activeColorSwatch : ''}`}
                              style={{ backgroundColor: resolveSwatchColor(value) }}
                              title={value}
                              aria-label={`${attrName}: ${value}`}
                              aria-pressed={isActive}
                              onClick={() => handleAttrSelect(attrName, value)}
                            />
                          );
                        }

                        // Render text pill for non-colour attributes
                        return (
                          <button
                            key={variantId}
                            className={`${styles.attributePill} ${isActive ? styles.activeAttributePill : ''}`}
                            aria-pressed={isActive}
                            onClick={() => handleAttrSelect(attrName, value)}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Price */}
          <div className={styles.priceSection}>
            <div className={styles.currentPrice}>
              {formatPrice(productPrice)}
              <span className={styles.currency}> ج.م</span>
              {unitLabel && <span className={styles.unitLabel}> / {unitLabel}</span>}
            </div>

            {numericOriginalPrice && numericOriginalPrice > numericPrice && (
              <div className={styles.originalPrice}>
                {formatPrice(originalPrice)}
                <span className={styles.currency}> ج.م</span>
                {unitLabel && <span className={styles.unitLabel}> / {unitLabel}</span>}
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