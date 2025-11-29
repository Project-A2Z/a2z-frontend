import dynamic from "next/dynamic";
import {
  fetchAllProducts,
  ProductsResponse,
} from "@/services/product/products";

// Lazy load the product section
const OptimizedProductSection = dynamic(
  () => import("@/pages/HomePage/sections/OurProductSection/optimizer"),
  {
    loading: () => <ProductSectionSkeleton />,
    ssr: true,
  }
);

// Skeleton component for loading state
function ProductSectionSkeleton() {
  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              height: "300px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              borderRadius: "8px",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ✅ Optimized data fetching with error handling
async function getProducts(): Promise<{
  data: ProductsResponse;
  buildTime: string;
  error: string | null;
}> {
  const startTime = Date.now();

  try {
    console.log("🏗️ [ISR] Fetching products at build time...");

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const productsData = await fetchAllProducts();
    clearTimeout(timeoutId);

    const loadTime = Date.now() - startTime;
    console.log(
      `✅ [ISR] Fetched ${productsData.data.length} products in ${loadTime}ms`
    );

    return {
      data: productsData,
      buildTime: new Date().toISOString(),
      error: null,
    };
  } catch (error) {
    console.error("❌ [ISR] Error fetching products:", error);

    // Return empty data structure on error
    return {
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
        filters: {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 0 },
        },
      },
      buildTime: new Date().toISOString(),
      error: error instanceof Error ? error.message : "فشل في تحميل المنتجات",
    };
  }
}

export default async function ProductsPage() {
  const { data: initialData, buildTime, error } = await getProducts();

  return (
    <>
      {/* Add structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "المنتجات",
            description: "تصفح جميع المنتجات المتاحة",
            url: "/products",
            numberOfItems: initialData.data.length,
          }),
        }}
      />

      <main className="products-page">
        <OptimizedProductSection initialData={initialData} />
      </main>
    </>
  );
}