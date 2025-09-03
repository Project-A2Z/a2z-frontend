"use client";
import React, { useState } from 'react';
import CartHeader from './Sections/CartHeader';
import CartItemsList from './Sections/CartItemsList';
import OrderSummary from './Sections/OrderSummary';
import ContactHelp from './Sections/ContactHelp';
import RelatedProducts from './Sections/RelatedProducts';
import FloatingWhatsApp from './Sections/FloatingWhatsApp';
import type { CartItem } from './Sections/types';

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'L-Arginine',
      price: 25000,
      quantity: 1,
      image: 'https://picsum.photos/80/80?random=1'
    },
    {
      id: 2,
      name: 'مكمل غذائي طبيعي',
      price: 30000,
      quantity: 2,
      image: 'https://picsum.photos/80/80?random=2'
    },
    {
      id: 3,
      name: 'فيتامينات متعددة',
      price: 35000,
      quantity: 1,
      image: 'https://picsum.photos/80/80?random=3'
    },
    {
      id: 4,
      name: 'مكمل البروتين',
      price: 40000,
      quantity: 1,
      image: 'https://picsum.photos/80/80?random=4'
    },
    {
      id: 5,
      name: 'أوميغا 3',
      price: 28000,
      quantity: 3,
      image: 'https://picsum.photos/80/80?random=5'
    },
    {
      id: 6,
      name: 'Vitamin C 1000mg',
      price: 20000,
      quantity: 2,
      image: 'https://picsum.photos/80/80?random=6'
    },
    {
      id: 7,
      name: 'مغنيسيوم',
      price: 22000,
      quantity: 1,
      image: 'https://picsum.photos/80/80?random=7'
    },
    {
      id: 8,
      name: 'Collagen Peptides',
      price: 45000,
      quantity: 1,
      image: 'https://picsum.photos/80/80?random=8'
    },
    {
      id: 9,
      name: 'زيت السمك',
      price: 32000,
      quantity: 2,
      image: 'https://picsum.photos/80/80?random=9'
    },
    {
      id: 10,
      name: 'Probiotic Blend',
      price: 38000,
      quantity: 1,
      image: 'https://picsum.photos/80/80?random=10'
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background font-beiruti">
      <CartHeader itemCount={cartItems.length} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className={`grid ${cartItems.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
          {/* Cart Items */}
          <div   className={cartItems.length > 0 ? 'lg:col-span-2' : ''}>
            <CartItemsList items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <OrderSummary subtotal={subtotal} shipping={shipping} total={total} hasItems={cartItems.length > 0} />
              <ContactHelp />
            </div>
          )}
        </div>

        <RelatedProducts />
      </div>

      {/* Fixed WhatsApp Button - Mobile */}
      <FloatingWhatsApp />
    </div>
  );
};

export default React.memo(CartPage);