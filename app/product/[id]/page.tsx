import { notFound } from "next/navigation";
import ProductPage from "@/components/pages/ProductPage/ProductPage";
import { fetchProductByIdISR } from "@/services/api/products";
import { generateSEO } from "@/config/seo.config";
import { getTranslations } from "next-intl/server";

export const metadata = generateSEO({
  title: "صفحة المنتج",
  description: "شركة A2Z متخصصة في جميع أنواع الكيماويات",
  keywords: ["كيماويات", "تجارة"],
});

export default async function ProductByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const t = await getTranslations("productPage");

  try {
    const res = await fetchProductByIdISR(decodedId, 3600);

    if (res.status === "error") {
      if (res.message?.includes("Product not found")) {
        return notFound();
      }
      if (
        res.message?.includes("Connection timeout") ||
        res.message?.includes("socket hang up")
      ) {
        throw new Error("Connection timeout. Please check your internet connection and try again.");
      }
      if (res.message?.includes("temporarily unavailable")) {
        throw new Error("Product temporarily unavailable. Please try again in a few minutes.");
      }
    }

    const product = res.data;

    if (!product?._id) {
      console.error(`❌ No product data received for ID: ${decodedId}`, res);
      return notFound();
    }

    return <ProductPage data={product} />;

  } catch (e: any) {
    console.error("❌ Error fetching product:", e.message);

    // ── Connection error ──────────────────────────────────────────────────
    if (
      e.message?.includes("Connection timeout") ||
      e.message?.includes("socket hang up")
    ) {
      return (
        <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("connectionError.title")}</h1>
            <p className="text-gray-600 mb-6">{t("connectionError.message")}</p>
            <div className="space-y-3">
              <a href="" className="block w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 font-medium text-center">
                {t("connectionError.retry")}
              </a>
              <a href="/" className="block w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium text-center">
                {t("connectionError.home")}
              </a>
            </div>
          </div>
        </div>
      );
    }

    // ── Rate limit / server busy ───────────────────────────────────────────
    if (
      e.message?.includes("temporarily unavailable") ||
      e.message?.includes("high demand")
    ) {
      return (
        <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("serverBusy.title")}</h1>
            <p className="text-gray-600 mb-6">{t("serverBusy.message")}</p>
            <div className="space-y-3">
              <a href="" className="block w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 font-medium text-center">
                {t("serverBusy.retry")}
              </a>
              <a href="/" className="block w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium text-center">
                {t("serverBusy.home")}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return notFound();
  }
}