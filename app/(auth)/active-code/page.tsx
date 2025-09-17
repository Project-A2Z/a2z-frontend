import Background from '@/components/UI/Background/Background';
import ActiveCodePage from '@/Pages/AuthPages/ActiveCodePage/ActiveCode';
// import './../../styles/variables.css';

export default function Page() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-white">

      <Background />

      <ActiveCodePage />

    </div>
  );
}
