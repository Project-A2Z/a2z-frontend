"use client";
import React, { useEffect, useState } from 'react';
import Overview from './Sections/Overview';
import TopNav from './Sections/TopNav';
import Specs, { Spec } from './Sections/Specs';
import Ratings from './Sections/Ratings';
import Reviews from './Sections/Reviews';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';

export type ProductData = {
  id: number | string;
  title: string;
  description?: string;
  price: number;
  imageList: string[];
  rating: number;
  ratingCount: number;
  category: string;
  specs: Spec[];
  ratingsDistribution: { stars: number; count: number }[];
  reviews: { id: string | number; author: string; rating: number; date: string; content: string }[];
  stockQty: number;
  stockType: 'unit' | 'kg' | 'ton';
};

const ProductPage: React.FC<{ data?: ProductData }> = ({ data }) => {
  const [token, setToken] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentRatingCount, setCurrentRatingCount] = useState(0);
  const [ratingsDistribution, setRatingsDistribution] = useState<{ stars: number; count: number }[]>([]);
  
  useEffect(() => {
    if (data) {
      setCurrentRating(data.rating || 0);
      setCurrentRatingCount(data.ratingCount || 0);
      setRatingsDistribution(data.ratingsDistribution || []);
    }
  }, [data]);

  useEffect(() => {
    // Get token from localStorage for authentication
    const getToken = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
      }
      return null;
    };
    setToken(getToken());
  }, []);

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

  return (
    <div className="min-h-screen bg-background font-beiruti mt-[93px]">
      <div className="mx-auto max-w-[95%] px-4 py-6 space-y-6">
        <Overview
          id={data.id}
          title={data.title}
          description={data.description}
          price={data.price}
          imageList={data.imageList}
          rating={data.rating}
          ratingCount={data.ratingCount}
          category={data.category}
          stockQty={data.stockQty}
          stockType={data.stockType}
        />

        <div className="flex flex-col lg:flex-row gap-6 max-w-[95%] mx-auto">
          <div className="flex flex-col order-2 lg:order-1 flex-1 space-y-6">
            <Specs specs={data.specs} />
            <Ratings
              average={currentRating}
              total={currentRatingCount}
              distribution={ratingsDistribution}
              interactive={true}
              key={`${currentRating}-${currentRatingCount}`}
            />
            <Reviews 
              productId={String(data.id)} 
              onReviewAdded={async () => {
                try {
                  // Use the correct API endpoint to fetch the updated product data
                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://a2z-backend.fly.dev/app/v1'}/products/${data.id}`);
                  const result = await response.json();
                  
                  if (!response.ok) {
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                  }
                  
                  // Updated to match the actual API response format
                  if (result.status === 'success' && result.product) {
                    const updatedProduct = result.product;
                    setCurrentRating(updatedProduct.averageRate || 0);
                    // If rating count isn't directly available, increment the current count
                    setCurrentRatingCount(prev => prev + 1);
                    // If ratings distribution isn't available, keep the existing one
                    if (updatedProduct.ratings) {
                      setRatingsDistribution(updatedProduct.ratings);
                    }
                  } else {
                    throw new Error(result.message || 'Invalid response format');
                  }
                } catch (error) {
                  console.error('Error updating ratings:', error);
                  // Fallback: Increment the count as a simple update
                  setCurrentRatingCount(prev => prev + 1);
                }
              }}
            />
          </div>
        </div>

        <RelatedProducts />
      </div>
    </div>
  );
};

export default React.memo(ProductPage);