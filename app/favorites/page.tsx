import FavoritesPage from "./FavWrapper";
import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'صفحة المفضلات',
  description: 'شركة A2Z متخصصة في جميع أنواع الكيماويات',
  keywords: ['كيماويات', 'تجارة'],
});

export default function FavoritesRoutePage() {
  return <FavoritesPage />;
}