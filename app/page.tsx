import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import HomePage from "@/Pages/HomePage/HomePage";
// import Header  from './../components/Layout/Nav/Header'
// import Card from "@/components/UI/Card/Card";
import style from './page.module.css';
// import pic from './../public/acessts/download (47).jpg'
import RegistrationForm from "./(auth)/register/page";

export default function Home() {
  return (
    //font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20
    // <div className={style.container}>
      // {/* <Header />
      // <Card productImg={pic} productName="لوتس" productCategory="زهور" productPrice="2000" productId="1"/>

      
      // <h1>Hello World</h1>*/}
      // {/* <HomePage/>  */}
      

    // {/* //border-b border-gray-300 px-6 md:px-12 py-4 mx-auto  className="w-full  h-screen flex flex-col items-center justify-center "*/}
    
    <div className={style.container}>
        <HomePage />
      {/* <RegistrationForm/> */}
    </div>

  );
}
