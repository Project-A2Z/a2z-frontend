"use client";
import React, { useState, useEffect } from 'react';
import CartHeader from './Sections/CartHeader';
import CartItemsList from './Sections/CartItemsList';
import OrderSummary from './Sections/OrderSummary';
import ContactHelp from './Sections/ContactHelp';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
import type { CartItem } from './Sections/types';
import { div } from 'motion/react-client';

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch('/data/cartItems.json');
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black8 font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-black87">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black8 font-beiruti mt-[93px]">
      <div className="max-w-6xl mx-auto px-4 py-6 ">
        <div className={`grid ${cartItems.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 ` }>
          {/* Cart Items */}
          <div   className={cartItems.length > 0 ? 'lg:col-span-2 space-y-4 sm:space-y-6   p-[10px]' : 'space-y-4 sm:space-y-6  p-[10px]'} >
            <CartHeader itemCount={cartItems.length} />
            <CartItemsList items={cartItems} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <OrderSummary itemCount={cartItems.length} total={total} hasItems={cartItems.length > 0} />
            </div>
          )}
        </div>

        <RelatedProducts />
      </div>
    </div>
  );
};

export default React.memo(CartPage);