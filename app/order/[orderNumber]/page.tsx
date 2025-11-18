

// Import order service
import orderService, { OrderItem } from "@/services/profile/orders";

// import { generateSEO } from '@/config/seo.config';

import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'تفاصيل الطلب',
  description: 'شركة A2Z متخصصة في جميع أنواع الكيماويات',
  keywords: ['كيماويات', 'تجارة'],
});

import OrdWrapper from "./ordWrapper";

export default function OrderDetailsPage() {
    return <OrdWrapper />;
} 