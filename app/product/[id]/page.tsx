import React from "react";
import ProductPage, { ProductData } from "../../../Pages/ProductPage/ProductPage";
import { products } from "../../../../public/Test_data/products.js";

function slugify(name: string) {
  return encodeURIComponent((name || "").trim());
}

function findByIdParam(idParam: string) {
  const decoded = decodeURIComponent(idParam);
  const list = products as any[];
  let p = list.find((x) => (x.name || "").trim() === decoded.trim());
  if (!p) p = list.find((x) => slugify(x.name) === idParam);
  return p;
}

export default function ProductByIdPage({ params }: { params: { id: string } }) {
  const src: any = findByIdParam(params.id);

  const data: ProductData = {
    id: params.id,
    title: src?.name || "منتج غير معروف",
    description:
      src?.description ||
      "وصف المنتج غير متوفر حالياً. سيتم تحديث المعلومات قريباً.",
    price: Number(src?.price ?? 0),
    image: (src?.img && typeof src.img === 'string') ? src.img : "/acessts/download (47).jpg",
    rating: 4.0,
    ratingCount: 20,
    specs: [
      { label: "التصنيف", value: src?.category || "غير محدد" },
      { label: "الحالة", value: String(src?.status ?? "متاح") },
      { label: "السعة", value: "1 لتر" },
      { label: "بلد المنشأ", value: "مصر" },
    ],
    ratingsDistribution: [
      { stars: 5, count: 13 },
      { stars: 4, count: 3 },
      { stars: 3, count: 3 },
      { stars: 2, count: 1 },
      { stars: 1, count: 1 },
    ],
    reviews: [
      { id: "1", author: "Menna Akram", rating: 5, date: "منذ ساعة", content: "هذا المنتج رائع! أنصح به." },
      { id: "2", author: "Laila Fouad", rating: 4, date: "قبل سنتين", content: "جيد وسعره مناسب." },
    ],
  };

  return <ProductPage data={data} />;
}

export function generateStaticParams() {
  return (products as any[]).slice(0, 30).map((p) => ({ id: slugify(p.name) }));
}
