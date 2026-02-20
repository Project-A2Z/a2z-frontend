import dynamic from "next/dynamic";
import {
  fetchAllProducts,
  ProductsResponse,
} from "@/services/product/products";

// Lazy load the product section
const OptimizedProductSection = dynamic(
  () => import("./optimizer"),
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

// 🚀 CRITICAL FIX: Add ISR revalidation
export const revalidate = 60; // Revalidate every 60 seconds

// ✅ Optimized data fetching with proper error handling
async function getProducts(): Promise<{
  data: ProductsResponse;
  error: string | null;
}> {
  const startTime = Date.now();
  
  try {
    console.log("🏗️ [ISR] Fetching products at build time...");
    
    // 🚀 OPTIMIZATION: Only fetch first page (20 items) instead of all products
    const productsData = await fetchAllProducts({
      page: 1,
      limit: 20,
      
    });
    
    const loadTime = Date.now() - startTime;
    console.log(
      `✅ [ISR] Fetched ${productsData.data.length} products in ${loadTime}ms`
    );
    
    return {
      data: productsData,
      error: null,
    };
  } catch (error) {
    console.error("❌ [ISR] Error fetching products:", error);
    
    // Return empty data structure on error instead of throwing
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
      error: error instanceof Error ? error.message : "فشل في تحميل المنتجات",
    };
  }
}

export default async function ProductsPage() {
  const { data: initialData, error } = await getProducts();

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
            numberOfItems: initialData.pagination?.total || 0,
          }),
        }}
      />
      
      <main className="products-page" id="products">
        {error && (
          <div style={{ 
            padding: '20px', 
            background: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '4px',
            margin: '20px'
          }}>
            <strong>تحذير:</strong> {error}
          </div>
        )}
        
        <OptimizedProductSection initialData={initialData} />
      </main>
    </>
  );
}

// 🚀 OPTIMIZATION: Generate static params for common pages
// This pre-renders the first few pages at build time
export async function generateStaticParams() {
  // Only pre-render the first page
  return [
    { page: '1' }
  ];
}