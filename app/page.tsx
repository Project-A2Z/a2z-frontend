import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import HomePage from "@/Pages/HomePage/HomePage";
import Header  from './../components/Layout/Nav/Header'
import Card from "@/components/UI/Card/Card";
import style from './page.module.css';
import pic from './../public/acessts/download (47).jpg'

export default function Home() {
  return (

    //border-b border-gray-300 px-6 md:px-12 py-4 mx-auto
    <div className="w-full  h-screen flex flex-col items-center justify-center ">
        <HomePage />
      
    </div>

  );
}
