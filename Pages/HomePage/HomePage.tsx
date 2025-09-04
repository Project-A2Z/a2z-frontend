import Footer from "./sections/FooterSection/Footer";
import MainSection from "./sections/MainSection/MainSection";
import Header from "@/components/Layout/Nav/Header";
import ProductSection from "./sections/OurProductSection/ProductSection";
import { products } from "@/public/Test_data/products";
import styles from "./Home.module.css";

const HomePage = () => {
  return (
    <div className={styles.conatiner}>
      <Header />
      <MainSection />
      <ProductSection />

      <Footer />
    </div>
  );
};

export default HomePage;
