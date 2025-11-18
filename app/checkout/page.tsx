import Checkout from "./checkoutWarpper";

import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'صفحة الدفع',
  description: 'شركة A2Z متخصصة في جميع أنواع الكيماويات',
  keywords: ['كيماويات', 'تجارة'],
});

export default function CheckoutPage() {
  return <Checkout/>;
}