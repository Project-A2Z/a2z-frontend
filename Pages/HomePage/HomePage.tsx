import Footer from "./sections/FooterSection/Footer";
import MainSection from "./sections/MainSection/MainSection";

const HomePage = () => {
  return (
    <div className="w-full  flex flex-col justify-center items-center bg-red-500 " >
        <MainSection/>
        <Footer/>
    </div>
  )
};
export default HomePage;

