import ForgetPasswordPage from "@/pages/AuthPages/ForgetPasswordPage/ForgetPasswordPage";
import Background from "@/components/UI/Background/Background";

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-white">
        <Background />
        <ForgetPasswordPage/>
      </div>
    </div>
  )
}