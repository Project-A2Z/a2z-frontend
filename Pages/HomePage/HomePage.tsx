import Footer from "./sections/FooterSection/Footer";
import MainSection from "./sections/MainSection/MainSection";
import Header from "@/components/Layout/Nav/Header";
import ProductSection from "./sections/OurProductSection/ProductSection";
import { products } from "@/public/Test_data/products";

const HomePage = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center " >
        <MainSection/>
        <Footer/>
    </div>
  );
};

export default HomePage;
