import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import HomePage from "@/Pages/HomePage/HomePage";
// import Header  from './../components/Layout/Nav/Header'
// import Card from "@/components/UI/Card/Card";
import style from './page.module.css';
// import pic from './../public/acessts/download (47).jpg'
import RegistrationForm from "./(auth)/register/page";
// import { style } from "motion/react-client";
// duplicate import removed
export default function Home() {
  return (
   
    <div className={style.container}>
        <HomePage />
      
    </div>

  );
}
