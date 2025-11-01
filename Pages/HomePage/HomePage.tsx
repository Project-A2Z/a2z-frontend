// pages/index.tsx (for homepage at "/")
import React from "react";
import Footer from "./sections/FooterSection/Footer";
import MainSection from "./sections/MainSection/MainSection";
import Header from "@/components/Layout/Nav/Header";
import ProductSection from "./sections/OurProductSection/ProductSection";
import styles from './Home.module.css'

export default function HomePage() {
  return (
    <div className={styles.conatiner}>
      <MainSection/>
      <ProductSection />
    </div>
  );
}