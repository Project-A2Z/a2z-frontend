import { generateSEO } from '@/config/seo.config';
import CartWrapper from './cartWrapper';

export const metadata = generateSEO({
  title: 'سلة التسوق',
  description: 'شركة A2Z متخصصة في جميع أنواع الكيماويات',
  keywords: ['كيماويات', 'تجارة'],
});

export default function Cart() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CartWrapper />
    </main>
  );
}