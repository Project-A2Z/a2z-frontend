// import React from 'react';
import Profile from "@/Pages/ProfilePage/ProfilePage";

import { generateSEO } from "@/config/seo.config";

export const metadata = generateSEO({
  title: "صفحة المستخدم",
  description: "شركة A2Z متخصصة في جميع أنواع الكيماويات",
  keywords: ["كيماويات", "تجارة"],
});

export default function Page() {
  return (
    <div>
      <Profile />
    </div>
  );
}
