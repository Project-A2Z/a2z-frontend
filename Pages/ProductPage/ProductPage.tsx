"use client";
import React from 'react';
import Overview from './Sections/Overview';
import TopNav from './Sections/TopNav';
import Specs, { Spec } from './Sections/Specs';
import Ratings from './Sections/Ratings';
import Reviews from './Sections/Reviews';
import RelatedProducts from '../CartPage/Sections/RelatedProducts';

export type ProductData = {
  id: number | string;
  title: string;
  description?: string;
  price: number;
  image: string;
  rating: number;
  ratingCount: number;
  specs: Spec[];
  ratingsDistribution: { stars: number; count: number }[];
  reviews: { id: string | number; author: string; rating: number; date: string; content: string }[];
};

const mockProduct: ProductData = {
  id: 1,
  title: 'سماد سائل عضوي ناب الجثهاض وبواية الاهيه! ابلا! للتحسين العضوي - EM1 (900 مل)',
  description:'هذا السماد السائل العضوي هو منتج مبتكر يجمع بين مستخلصات الطحالب الطبيعية وEM1، مما يجعله الخيار المثالي لتعزيز نمو النباتات وتحسين خصوبة التربة. يتميز بتركيبة فريدة تحتوي على مجموعة من العناصر الغذائية الأساسية التي تعزز من صحة النباتات وتزيد من إنتاجيتها. بفضل قوامه السائل، يسهل استخدامه في جميع أنواع أنظمة الري، مما يجعله مناسبًا للمزارعين المحترفين والهواة على حد سواء. يأتي في عبوة سعة 900 مل، مما يجعله سهل التخزين والاستخدام. هذا المنتج ليس فقط فعالًا، بل أيضًا صديق للبيئة، مما يجعله خيارًا مثاليًا لمن يسعون إلى الزراعة المستدامة.',
  price: 22100,
  image: 'https://picsum.photos/600/600?random=41',
  rating: 4.2,
  ratingCount: 37,
  specs: [
    { label: 'العلامة التجارية', value: 'A2Z' },
    { label: 'السعة', value: '900 مل' },
    { label: 'التصنيف', value: 'سماد عضوي' },
    { label: 'بلد المنشأ', value: 'مصر' },
  ],
  ratingsDistribution: [
    { stars: 5, count: 13 },
    { stars: 4, count: 9 },
    { stars: 3, count: 8 },
    { stars: 2, count: 5 },
    { stars: 1, count: 2 },
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Zeynep Abdullah',
      rating: 5,
      date: '2024/05/18',
      content:
        'منتج ممتاز ساعد في تحسين نمو النباتات بشكل ملحوظ. سأعيد الشراء مرة أخرى بالتأكيد.'
    },
    {
      id: 'r2',
      author: 'Mohammed Z',
      rating: 4,
      date: '2024/04/01',
      content:
        'جودة جيدة وسعر مناسب. لاحظت تحسّنًا في صحة التربة بعد الاستخدام.'
    },
    {
      id: 'r3',
      author: 'Ahmed Mahmoud',
      rating: 3,
      date: '2024/02/20',
      content:
        'التأثير متوسط ويحتاج لاستخدام منتظم للحصول على نتائج أفضل.'
    }
  ]
};

const ProductPage: React.FC<{ data?: ProductData }> = ({ data = mockProduct }) => {
  return (
    <div className="min-h-screen bg-background font-beiruti mt-[93px] ">
      <div className="mx-auto max-w-[95%] px-4 py-6 space-y-6 ">
        {/* Top nav tabs */}
        {/* <TopNav /> */}
        {/* Overview */}
        <Overview
          title={data.title}
          description={data.description}
          price={data.price}
          image={data.image}
          rating={data.rating}
          ratingCount={data.ratingCount}
        />

        {/* Content: Specs + Ratings (flex layout) */}
        <div className="flex flex-col lg:flex-row gap-6   max-w-[95%] mx-auto ">
          {/* Wide content: Ratings + Reviews (second on mobile, first on desktop) */}
          <div className="flex flex-col order-2 lg:order-1 flex-1 space-y-6 ">
            {/* <div className="order-1 lg:order-2 w-full lg:w-[32%] xl:w-[30%] bg-yellow-500"> */}
              <Specs specs={data.specs} />
            {/* </div> */}
            <Ratings
              average={data.rating}
              total={data.ratingCount}
              distribution={data.ratingsDistribution}
            />
            <Reviews reviews={data.reviews} />
          </div>
        </div>

        {/* Related products */}
        <RelatedProducts />
      </div>
    </div>
  );
};

export default ProductPage;
