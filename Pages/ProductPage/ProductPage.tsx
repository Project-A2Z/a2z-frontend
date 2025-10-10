"use client";
import React, { useEffect, useState } from 'react';
import Overview from './Sections/Overview';
import TopNav from './Sections/TopNav';
import Specs, { Spec } from './Sections/Specs';
import DynamicRatings from './Sections/DynamicRatings';
import Reviews from './Sections/Reviews';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
import { productService } from '@/services/api/products'; // Import the service
import { reviewService, type Review } from '@/services/api/reviews';

export type ProductData = {
  id: number | string;
  title: string;
  description?: string;
  price: number;
  image: string;
  rating: number;
  ratingCount: number;
  category: string;
  specs: Spec[];
  ratingsDistribution: { stars: number; count: number }[];
  reviews: { id: string | number; author: string; rating: number; date: string; content: string }[]; // Component expects this format
  stockQty: number;
  stockType: 'unit' | 'kg' | 'ton';
};

// ProductPage now receives data as prop, with fallback client-side fetch for reviews if missing
const ProductPage: React.FC<{ data: ProductData }> = ({ data }) => {
  const [reviews, setReviews] = useState(data.reviews);

  // Fallback: Fetch product if reviews are missing (maps backend productReview to expected format)
  useEffect(() => {
    if (!reviews || reviews.length === 0) {
      const fetchReviewsFallback = async () => {
        try {
          const response = await productService.getProductById(String(data.id));
          const backendReviews = response.data?.productReview || [];
          const mappedReviews = backendReviews.map((r: Review) => ({
            id: r._id,
            author: 'مستخدم مجهول', // Placeholder since no author in API
            rating: r.rateNum,
            date: new Date(r.date).toLocaleDateString('ar-EG'), // Format date to Arabic
            content: r.description,
          }));
          setReviews(mappedReviews);
        } catch (error) {
          console.error('Error fetching reviews fallback:', error);
        }
      };
      fetchReviewsFallback();
    }
  }, [data.id, reviews]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">المنتج غير موجود</p>
          <p className="mt-2">عذرًا، لا يمكن العثور على المنتج المطلوب</p>
        </div>
      </div>
    );
  }

  console.log(data)
  // console.log(data.price)
  return (
    <div className="min-h-screen bg-background font-beiruti mt-[93px]">
      <div className="mx-auto max-w-[95%] px-4 py-6 space-y-6">
        {/* Overview */}
        <Overview
          id={data.id}
          title={data.title}
          description={data.description}
          price={data.price}
          image={data.image}
          rating={data.rating}
          ratingCount={data.ratingCount}
          category={data.category}
          stockQty={data.stockQty}
          stockType={data.stockType}
        />

        {/* Content: Specs + Ratings (flex layout) */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-[95%] mx-auto">
          <div className="flex flex-col order-2 lg:order-1 flex-1 space-y-6">
            <Specs specs={data.specs} />
            <DynamicRatings
              productId={String(data.id)}
              onStarClick={(stars: number) => {
                console.log('Star clicked:', stars);
                // Filter reviews by selected star rating
                setReviews(prev => prev.filter(review => Math.round(review.rating) === stars));
              }}
              onDistributionClick={(stars: number) => {
                console.log('Distribution clicked:', stars);
                // Filter reviews by selected star rating from distribution
                setReviews(prev => prev.filter(review => Math.round(review.rating) === stars));
              }}
              interactive={true}
            />
            {/* //Use state which includes fallback */}
            <Reviews reviews={reviews} /> 
          </div>
        </div>
        
        <RelatedProducts  />
      </div>
    </div>
  );
};

export default React.memo(ProductPage);