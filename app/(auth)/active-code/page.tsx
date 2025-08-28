import ActiveCodePage from "@/Pages/AuthPages/ActiveCodePage/ActiveCode";
// import './../../styles/variables.css';

export default function Page() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-white">

      <div className="absolute w-[60vw] h-[60vw] max-w-[400px] max-h-[400px]  bg-primary rounded-full blur-[45px] opacity-30
         top-[-20px] left-[-18%] 
         sm:top-[-20%] sm:left-[100%] sm:w-[70vw] sm:h-[70vw]
         md:top-[-18%] md:left-[30%]
         lg:top-[-17%] lg:left-[24%] lg:w-[40vw] lg:h-[40vw]">
      </div>

      <div className="absolute bottom-[10%] left-[-16.5%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px]  bg-secondary1 rounded-full blur-[30px] opacity-30
        sm:bottom-[5%] sm:left-[10%] sm:w-[70vw] sm:h-[70vw]
        md:bottom-[50%] md:left-[20%]
        lg:bottom-[-15%] lg:left-[15.5%] lg:w-[40vw] lg:h-[40vw]"
      ></div>

      <div className="absolute bottom-[5%] right-[-24%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-primary rounded-full blur-[65px] opacity-30
        sm:bottom-[-20%] sm:right-[10%] sm:w-[70vw] sm:h-[70vw]
        md:bottom-[-18%] md:right-[20%]
        lg:bottom-[-12%] lg:right-[11%] lg:w-[40vw] lg:h-[40vw]">
      </div>

      <ActiveCodePage />

    </div>
  );
}
