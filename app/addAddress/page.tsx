import NewAddressForm from "@/pages/ProfilePage/sections/AddAdress/AddAdress"


import { generateSEO } from '@/config/seo.config';

export const metadata = generateSEO({
  title: 'إضافة عنوان جديد ',
  description: 'شركة A2Z متخصصة في جميع أنواع الكيماويات',
  keywords: ['كيماويات', 'تجارة'],
});
export default function AddAddressPage() {
    return(
        <>
        <NewAddressForm />
        </>
    )
}