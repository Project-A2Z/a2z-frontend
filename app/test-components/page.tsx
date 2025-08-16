'use client';

import React from 'react';
import { CustomImage } from '@/components/UI/Image/Images';
import ImageSlider from '@/components/UI/Slider/Slider';

const TestComponentsPage = () => {
  const testSlides = [
    {
      id: 1,
      image: 'https://via.placeholder.com/800x400/88BE46/FFFFFF?text=A2Z+Slide+1',
      title: 'A2Z Slide 1',
      description: 'First test slide',
      alt: 'A2Z Slide 1'
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/800x400/4C9343/FFFFFF?text=A2Z+Slide+2',
      title: 'A2Z Slide 2',
      description: 'Second test slide',
      alt: 'A2Z Slide 2'
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/800x400/06B590/FFFFFF?text=A2Z+Slide+3',
      title: 'A2Z Slide 3',
      description: 'Third test slide',
      alt: 'A2Z Slide 3'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          A2Z Components Test Page
        </h1>

        {/* Test CustomImage Component */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">CustomImage Component Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Default Image</h3>
              <CustomImage
                src="https://via.placeholder.com/300x200/88BE46/FFFFFF?text=A2Z+Logo"
                alt="A2Z Logo"
                width={300}
                height={200}
                rounded="lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Rounded Image</h3>
              <CustomImage
                src="https://via.placeholder.com/300x200/4C9343/FFFFFF?text=A2Z+Brand"
                alt="A2Z Brand"
                width={300}
                height={200}
                rounded="full"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Cover Fit</h3>
              <CustomImage
                src="https://via.placeholder.com/300x200/06B590/FFFFFF?text=A2Z+Cover"
                alt="A2Z Cover"
                width={300}
                height={200}
                objectFit="cover"
                rounded="md"
              />
            </div>
          </div>
        </section>

        {/* Test ImageSlider Component */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">ImageSlider Component Test</h2>
          <div className="h-96">
            <ImageSlider
              slides={testSlides}
              autoPlay={true}
              autoPlayInterval={3000}
              showDots={true}
              showArrows={true}
              className="w-full h-full"
            />
          </div>
        </section>

        {/* Test with Error Handling */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Error Handling Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Invalid Image URL</h3>
              <CustomImage
                src="https://invalid-url-that-will-fail.com/image.jpg"
                alt="Invalid Image"
                width={300}
                height={200}
                rounded="lg"
                fallbackSrc="https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Error+Image"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Priority Loading</h3>
              <CustomImage
                src="https://via.placeholder.com/300x200/88BE46/FFFFFF?text=Priority+Image"
                alt="Priority Image"
                width={300}
                height={200}
                priority={true}
                rounded="lg"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestComponentsPage;
