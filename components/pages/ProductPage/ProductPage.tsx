"use client";
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Product, ProductVariant } from '@/services/api/products';

const Overview = lazy(() => import('./Sections/Overview'));
const Specs = lazy(() => import('./Sections/Specs'));
const Ratings = lazy(() => import('./Sections/Ratings'));
const Reviews = lazy(() => import('./Sections/Reviews'));
const RelatedProducts = lazy(() => import('@/components/UI/RelatedProducts/RelatedProducts'));

export type ProductData = Product;

const SectionLoader = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-32 w-full" />
);

const ProductPage: React.FC<{ data: ProductData }> = ({ data }) => {
  const [product, setProduct] = useState<ProductData | null>(data || null);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [currentRatingCount, setCurrentRatingCount] = useState<number>(0);
  const [ratingsDistribution, setRatingsDistribution] = useState<{ stars: number; count: number }[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (data && data._id) {
        setProduct(data);
        updateRatingData(data);
        return;
      }

      try {
        setLoading(true);
        const productId = window.location.pathname.split('/').pop();
        if (!productId) throw new Error('Product ID is missing');

        const response = await fetch(
          `https://a2z-backend--dkreq.fly.dev/app/v1/products/${productId}`
        );

        if (!response.ok) throw new Error('Failed to fetch product');

        const result = await response.json();

        // Backend now returns { status, product } — not { status, data }
        const productData = result.product ?? result.data;

        if (result.status === 'success' && productData) {
          setProduct(productData);
          updateRatingData(productData);
        } else {
          throw new Error('Invalid product data');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [data]);

  const updateRatingData = (productData: ProductData) => {
    setCurrentRating(productData.reviewSummary?.averageRate ?? productData.averageRate ?? 0);
    setCurrentRatingCount(productData.reviewSummary?.totalReviews ?? 0);

    // rateDistribution is now { "1": 0, "2": 0, ... "5": 0 }
    const raw = productData.reviewSummary?.rateDistribution;

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const distribution = Object.entries(raw).map(([stars, count]) => ({
        stars: parseInt(stars, 10),
        count: Number(count),
      }));
      setRatingsDistribution(distribution);
    } else {
      setRatingsDistribution([]);
    }
  };

  const handleReviewAction = async () => {
    if (!product?._id) return;
    try {
      const response = await fetch(
        `https://a2z-backend--dkreq.fly.dev/app/v1/products/${product._id}`
      );
      if (!response.ok) throw new Error('Failed to refresh product data');

      const result = await response.json();
      const productData = result.product ?? result.data;

      if (result.status === 'success' && productData) {
        setProduct(productData);
        updateRatingData(productData);
      }
    } catch (err) {
      console.error('Error refreshing product data:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">خطأ في تحميل المنتج</p>
          <p className="mt-2 text-gray-600">{error || 'المنتج غير موجود'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-beiruti mt-40">
      <div className="mx-auto max-w-[95%] px-4 py-6 space-y-6">
        <Suspense fallback={<SectionLoader />}>
          <Overview
            id={product._id}
            title={product.name}
            description={product.description || 'لا يوجد وصف متاح'}
            imageList={product.imageList?.length ? product.imageList : ['/acessts/NoImage.jpg']}
            rating={currentRating}
            ratingCount={currentRatingCount}
            category={product.category}
            // Pass the variants array — Overview now derives units/price/stock from it
            variants={product.productVariants ?? []}
            advProduct={product.advProduct ?? []}
          />
        </Suspense>

        <div className="flex flex-col lg:flex-row gap-6 max-w-[95%] mx-auto">
          <div className="flex flex-col order-2 lg:order-1 flex-1 space-y-6">
            <Suspense fallback={<SectionLoader />}>
              <Specs specs={[]} />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
              <Ratings
                average={currentRating}
                total={currentRatingCount}
                distribution={ratingsDistribution}
                interactive={true}
              />
            </Suspense>

            <Suspense fallback={<SectionLoader />}>
              <Reviews
                productId={product._id}
                onReviewAdded={handleReviewAction}
              />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<SectionLoader />}>
          <RelatedProducts currentCategory={product.category} />
        </Suspense>
      </div>
    </div>
  );
};

export default React.memo(ProductPage);