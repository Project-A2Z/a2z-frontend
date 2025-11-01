import { notFound } from "next/navigation";
import ProductPage, { ProductData } from "@/pages/ProductPage/ProductPage";
import productService from "@/services/api/products";
import { reviewService } from "@/services/api/reviews";

function getImageList(p?: { imageList?: string[]; images?: string[]; image?: string } | null): string[] {
  const list = (p?.imageList && Array.isArray(p.imageList) && p.imageList.length > 0)
    ? p.imageList
    : (Array.isArray(p?.images) ? p.images : []);
  if (list.length > 0) return list;
  if (p?.image) return [p.image];
  return ['/acessts/NoImage.jpg']; // Fixed placeholder path
}

export default async function ProductByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await params in Next.js 15
  const decodedId = decodeURIComponent(id);

  try {
    //console.log(`🔄 Loading product page for ID: ${decodedId}`);

    // ✅ Fetch product details
    const res = await productService.getProductById(decodedId);
    //console.log(`📦 Product fetch result:`, res);

    // Check if the response indicates an error
    if (res.status === 'error') {
      if (res.message?.includes('Product not found')) {
        //console.log(`❌ Product not found: ${decodedId}`);
        return notFound();
      }

      if (res.message?.includes('Connection timeout') || res.message?.includes('socket hang up')) {
        //console.error(`🌐 Network error loading product ${decodedId}:`, res.message);
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      }

      if (res.message?.includes('temporarily unavailable')) {
        //console.error(`⏱️ Product temporarily unavailable: ${decodedId}`);
        throw new Error('Product temporarily unavailable. Please try again in a few minutes.');
      }
    }

    const apiProduct: any = (res as any)?.data?.product || (res as any)?.product;
    if (!apiProduct) {
      //console.log(`❌ No product data received for ID: ${decodedId}`);
      return notFound();
    }

    //console.log(`✅ Product data received:`, apiProduct.title || apiProduct.name);

    // ✅ Fetch reviews for this product
    let reviews: Array<{ id: string; author: string; rating: number; date: string; content: string }> = [];
    try {
      const reviewsRes = await reviewService.getProductReviews(decodedId);
      const apiReviews = (reviewsRes as any)?.data?.reviews || [];
      reviews = apiReviews.map((r: any) => ({
        id: r._id,
        author: `${r.userId?.firstName || "مستخدم"} ${r.userId?.lastName || ""}`.trim(),
        rating: Number(r.rateNum || 0),
        date: new Date(r.date || r.createdAt).toLocaleDateString("ar-EG"),
        content: r.description || "",
      }));
      //console.log(`📝 Loaded ${reviews.length} reviews`);
    } catch (err: any) {
      //console.warn("⚠️ No reviews found or failed to load reviews:", err.message);
      reviews = [];
    }

    // Prepare product data
    const rating = Number(apiProduct.averageRate ?? apiProduct.rating ?? 0);
    const ratingCount = Number(apiProduct.reviewsCount ?? reviews.length ?? 0);

    const data: ProductData = {
      id: String(apiProduct._id || apiProduct.id || decodedId),
      title: apiProduct.name || apiProduct.nameAr || "منتج",
      description: apiProduct.description || apiProduct.descriptionAr || "",
      price: Number(apiProduct.price ?? 0),
      imageList: getImageList(apiProduct),
      rating,
      ratingCount,
      category: apiProduct.category || "",
      specs: [
        { label: "التصنيف", value: apiProduct.category || "غير محدد" },
        ...(apiProduct.brand ? [{ label: "العلامة التجارية", value: String(apiProduct.brand) }] : []),
      ],
      ratingsDistribution: [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
      reviews,
      stockQty: Number(apiProduct.stockQty ?? apiProduct.stockQuantity ?? 0),
      stockType: apiProduct.stockType || "unit",
    };

    //console.log(`✅ Product page data prepared successfully`);
    return <ProductPage data={data} />;
  } catch (e: any) {
    //console.error("❌ Error fetching product:", e.message);

    // Enhanced error handling for different types of errors
    if (e.message?.includes("Connection timeout") || e.message?.includes("socket hang up")) {
      return (
        <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">مشكلة في الاتصال</h1>
              <p className="text-gray-600 mb-6">انقطع الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 font-medium"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                العودة للصفحة السابقة
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Rate limit or server busy
    if (e.message?.includes("temporarily unavailable") || e.message?.includes("high demand")) {
      return (
        <div className="min-h-screen bg-background font-beiruti mt-[93px] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">الخدمة غير متاحة مؤقتاً</h1>
              <p className="text-gray-600 mb-6">الخادم مشغول حالياً. يُرجى الانتظار قليلاً ثم المحاولة مرة أخرى.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 font-medium"
              >
                إعادة المحاولة الآن
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                العودة للصفحة السابقة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return notFound();
  }
}
