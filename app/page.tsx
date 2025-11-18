import HomePage from "@/pages/HomePage/HomePage";

import style from './page.module.css';
import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'الصفحة الرئيسية',
  description: 'شركة A2Z متخصصة في جميع أنواع الكيماويات',
  keywords: ['كيماويات', 'تجارة'],
});

export default function Home() {
  return (
   
    <div className={style.container}>
        <HomePage />
      
    </div>

  );
}
