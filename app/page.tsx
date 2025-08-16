import LogoSection from "@/Pages/AuthPages/ActiveCodePage/sections/LogoSection/Logo";
import HomePage from "@/Pages/HomePage/HomePage";

export default function Home() {
  return (
    //font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20
    <div className=" bg-red-500">
      <h1>Hello World</h1>
      <HomePage/>
      {/* <LogoSection/> */}
    </div>
  );
}
