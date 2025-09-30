"use client";
import React from 'react';
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
  image: string;
  rating: number;
  ratingCount: number;
  category: string;
  specs: Spec[];
  ratingsDistribution: { stars: number; count: number }[];
  reviews: { id: string | number; author: string; rating: number; date: string; content: string }[];
  stockQty: number; // Added
  stockType: 'unit' | 'kg' | 'ton'; // Added
};

// ProductPage now receives data as prop, no client-side fetching
const ProductPage: React.FC<{ data: ProductData }> = ({ data }) => {
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
            <Ratings
              average={data.rating}
              total={data.ratingCount}
              distribution={data.ratingsDistribution}
            />
            <Reviews reviews={data.reviews} />
          </div>
        </div>
        
        {/* Related products */}
        <RelatedProducts category={data?.category} currentProductId={String(data?.id)} />
      </div>
    </div>
  );
};

export default React.memo(ProductPage);