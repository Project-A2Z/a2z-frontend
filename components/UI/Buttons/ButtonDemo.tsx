import React, { useState } from 'react';
import {
  Button,
  ButtonVariants,
  ButtonSizes,
  IconButton,
  LoadingButton,
  SuccessButton,
} from './index';

// Icon components for demo
const ShoppingCartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const ButtonDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          A2Z Button Component Demo
        </h1>

        {/* Button Variants */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
          </div>
        </section>

        {/* Button Sizes */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Button Sizes</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </section>

        {/* Button with Icons */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Buttons with Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button leftIcon={<ShoppingCartIcon />}>
              Add to Cart
            </Button>
            <Button rightIcon={<HeartIcon />} variant="outline">
              Add to Favorites
            </Button>
            <Button leftIcon={<SearchIcon />} variant="ghost">
              Search
            </Button>
          </div>
        </section>

        {/* Button States */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Button States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button disabled>Disabled</Button>
            <LoadingButton loadingText="Processing...">
              {isLoading ? 'Loading...' : 'Click to Load'}
            </LoadingButton>
            <SuccessButton>
              {isSuccess ? 'Success!' : 'Click for Success'}
            </SuccessButton>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
          <div className="space-y-4">
            <Button
              onClick={handleLoadingClick}
              disabled={isLoading || isSuccess}
              variant={isSuccess ? 'success' : 'primary'}
              size="lg"
              fullWidth
            >
              {isLoading ? 'Processing...' : isSuccess ? 'Completed!' : 'Click to Process'}
            </Button>
            <p className="text-sm text-gray-600">
              Click the button above to see loading and success states in action.
            </p>
          </div>
        </section>

        {/* Icon Buttons */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Icon Buttons</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <IconButton icon={<ShoppingCartIcon />} size="sm" variant="primary" />
            <IconButton icon={<HeartIcon />} size="md" variant="outline" />
            <IconButton icon={<SearchIcon />} size="lg" variant="ghost" />
            <IconButton icon={<ShoppingCartIcon />} size="xl" variant="accent" />
          </div>
        </section>

        {/* Pre-configured Variants */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Pre-configured Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ButtonVariants.Primary>Primary Variant</ButtonVariants.Primary>
            <ButtonVariants.Secondary>Secondary Variant</ButtonVariants.Secondary>
            <ButtonVariants.Accent>Accent Variant</ButtonVariants.Accent>
            <ButtonVariants.Outline>Outline Variant</ButtonVariants.Outline>
          </div>
        </section>

        {/* Pre-configured Sizes */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Pre-configured Sizes</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <ButtonSizes.Small>Small Size</ButtonSizes.Small>
            <ButtonSizes.Medium>Medium Size</ButtonSizes.Medium>
            <ButtonSizes.Large>Large Size</ButtonSizes.Large>
          </div>
        </section>

        {/* Full Width Buttons */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Full Width Buttons</h2>
          <div className="space-y-4">
            <Button fullWidth variant="primary">
              Full Width Primary
            </Button>
            <Button fullWidth variant="outline">
              Full Width Outline
            </Button>
            <Button fullWidth variant="ghost">
              Full Width Ghost
            </Button>
          </div>
        </section>

        {/* Rounded Buttons */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Rounded Buttons</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <Button rounded variant="primary">
              Rounded Primary
            </Button>
            <Button rounded variant="secondary">
              Rounded Secondary
            </Button>
            <Button rounded variant="accent">
              Rounded Accent
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonDemo;
