"use client";
import React, { useState, useEffect } from 'react';
import CartHeader from './Sections/CartHeader';
import CartItemsList from './Sections/CartItemsList';
import OrderSummary from './Sections/OrderSummary';
import ContactHelp from './Sections/ContactHelp';
import RelatedProducts from '@/components/UI/RelatedProducts/RelatedProducts';
// import type { CartItem } from './Sections/types';
import { cartService } from '@/services/api/cart';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';

export  type CartItem = {
  id: string;            // Cart item ID
  name: string;          // Name of the product
  price: number;         // Price of the individual item
  quantity: number;      // Quantity in cart
  image: string;         // URL or path to the product image
  unit: string;          // Unit of measurement (e.g., 'قطعة')
  availability: string;  // Availability status (e.g., 'متوفر', 'غير متوفر')
  category?: string;     // Optional category of the product
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        if (!isAuthenticated()) {
          return;
        }
        const res = await cartService.getCart();
        const items = res?.data?.cart?.items ?? [];
        
        const mapped: CartItem[] = items.map((it: any) => {
          const p = it.productId || {};
          const productId = p._id || '';
          
          // Try to get unit from localStorage first
          const cartItemKey = `cart_item_${productId}`;
          const storedItem = localStorage.getItem(cartItemKey);
          let selectedUnit = 'قطعة'; // Default unit
          
          if (storedItem) {
            try {
              const { unit } = JSON.parse(storedItem);
              if (unit) {
                // Convert unit to display name
                const unitMap: Record<string, string> = {
                  'unit': 'قطعة',
                  'kg': 'كيلو',
                  'ton': 'طن',
                  'liter': 'لتر',
                  'cubic_meter': 'متر مكعب'
                };
                selectedUnit = unitMap[unit] || unit;
              }
            } catch (e) {
              console.error('Error parsing cart item from localStorage:', e);
            }
          }
          
          let imageUrl = '/acessts/NoImage.jpg';
          const imageSources = p.imageList || p.images || p.image || [];
          
          // Handle different image source formats
          if (Array.isArray(imageSources) && imageSources.length > 0) {
            const firstImage = imageSources[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            } else if (firstImage?.url) {
              imageUrl = firstImage.url;
            }
          } else if (typeof imageSources === 'string') {
            imageUrl = imageSources;
          }

          // If still no valid image, try other possible image fields
          if (!imageUrl || imageUrl === '/acessts/NoImage.jpg') {
            imageUrl = p.thumbnail || p.mainImage || p.coverImage || p.imageUrl || '/acessts/NoImage.jpg';
          }

          // Ensure the image URL is properly formatted
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
            // Remove any leading slashes to prevent double slashes
            const cleanPath = imageUrl.replace(/^\/+/, '');
            // Check if it's a local path that should be served from the public folder
            if (cleanPath.startsWith('public/') || cleanPath.startsWith('uploads/') || cleanPath.startsWith('acessts/')) {
              imageUrl = `/${cleanPath}`;
            } else if (process.env.NEXT_PUBLIC_API_BASE_URL) {
              // For API paths, use the API base URL
              imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cleanPath}`;
            } else {
              // Fallback to absolute path
              imageUrl = `/${cleanPath}`;
            }
          }

          const availability = (p.stockQty ?? p.quantity ?? 0) > 0 ? 'متوفر' : 'غير متوفر';

          return {
            id: String(it._id),
            name: p.name || p.title || 'منتج',
            price: Number(p.price) || 0,
            quantity: Number(it.itemQty) || 0,
            image: imageUrl,
            unit: selectedUnit,
            availability,
            category: p.category,
          };
        });
        setCartItems(mapped);
      } catch (error: any) {
        //console.error('Error fetching cart items:', error);
        if (error?.response?.status === 401) {
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
      //console.error('Failed to update cart item quantity', e);
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems(items => items.filter(item => item.id !== id));
    } catch (e) {
      //console.error('Failed to remove cart item', e);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // const shipping = 1000;
  // const total = subtotal ;
  //console.log('Cart Items:', cartItems);
  //console.log('Subtotal:', subtotal);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-beiruti mt-[93px] flex items-center justify-center">
        <div className="text-black87">جاري التحميل...</div>
      </div>
    );
  }
return (
    <div className="min-h-screen bg-gray-50 font-beiruti">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {/* Main Grid Layout */}
        <div className={`grid ${cartItems.length > 0 ? 'lg:grid-cols-12' : 'w-full'} gap-4 md:gap-6`}>
          {/* Cart Items Section */}
          <div className={`${cartItems.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'w-full'}`}>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
              <CartHeader itemCount={cartItems.length} />
              <div className="mt-4">
                <CartItemsList 
                  items={cartItems} 
                  onUpdateQuantity={updateQuantity} 
                  onRemove={removeItem} 
                />
              </div>
            </div>
          </div>

          {/* Order Summary - Only shown when there are items */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24 space-y-4">
                <OrderSummary 
                  order={cartItems} 
                  itemCount={cartItems.length} 
                  total={subtotal} 
                  hasItems={cartItems.length > 0} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {cartItems.length > 0 && (
          <div className="mt-8 md:mt-12">
            <RelatedProducts />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CartPage);