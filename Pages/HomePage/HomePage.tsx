// pages/index.tsx (for homepage at "/")
import React from "react";

import MainSection from "./sections/MainSection/MainSection";

import ProductSection from "./sections/OurProductSection/ProductSection";
import styles from './Home.module.css'
import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: 'الرئيسية|A2Z',
  description: 'الصفحة الرئيسية لموقع -A2Z',
  url: '/',
});

export default function HomePage() {
  return (
    <div className={styles.conatiner}>
      <MainSection/>
      <ProductSection />
    </div>
  );
}