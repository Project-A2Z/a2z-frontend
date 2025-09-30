"use client";
import React, { useState, useEffect } from 'react';
import CartHeader from './Sections/CartHeader';
import CartItemsList from './Sections/CartItemsList';
import OrderSummary from './Sections/OrderSummary';
import ContactHelp from './Sections/ContactHelp';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
import type { CartItem } from './Sections/types';
import { div } from 'motion/react-client';
import { cartService } from '@/services/api/cart';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!isAuthenticated()) {
          // Not logged in: redirect to login
          router.push('/login');
          return;
        }
        const res = await cartService.getCart();
        // Expecting shape: { status, data: { cart: { items: [...] } } }
        const items = res?.data?.cart?.items ?? [];
        const mapped: CartItem[] = items.map((it: any) => {
          const p = it.productId || {};
          const images = p.imageList || p.images || p.image || [];
          const imageUrl = Array.isArray(images)
            ? (images[0]?.url || images[0] || '/assets/placeholder.png')
            : (images?.url || images || '/assets/placeholder.png');
          const unit = p.stockType || p.unit || 'قطعة';
          const availability = (p.stockQty ?? p.quantity ?? 0) > 0 ? 'متوفر' : 'غير متوفر';
          return {
            id: String(it._id),
            name: p.name || p.title || 'منتج',
            price: Number(p.price) || 0,
            quantity: Number(it.itemQty) || 0,
            image: imageUrl,
            unit,
            availability,
          };
        });
        setCartItems(mapped);
      } catch (error: any) {
        console.error('Error fetching cart items:', error);
        if (error?.response?.status === 401) {
          router.push('/login');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [router]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await cartService.removeFromCart(id);
        setCartItems(items => items.filter(item => item.id !== id));
        return;
      }
      await cartService.updateCartItem(id, newQuantity);
      setCartItems(items => items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    } catch (e) {
      console.error('Failed to update cart item quantity', e);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems(items => items.filter(item => item.id !== id));
    } catch (e) {
      console.error('Failed to remove cart item', e);
    }
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
              <OrderSummary  order = {cartItems} itemCount={cartItems.length} total={total} hasItems={cartItems.length > 0} />
            </div>
          )}
        </div>

        <RelatedProducts />
      </div>
    </div>
  );
};

export default React.memo(CartPage);