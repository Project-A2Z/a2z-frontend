import AboutPage from "@/pages/AboutPage/Aboutpage";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "من نحن",
  description: "شركة A2Z متخصصة في جميع أنواع الكيماويات",
  keywords: ["كيماويات", "تجارة"],
});

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full max-w-[380px] sm:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1360px] min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <AboutPage />
      </div>
    </div>
  );
}
