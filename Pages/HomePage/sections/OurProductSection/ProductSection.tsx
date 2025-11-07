// app/products/page.tsx (For Next.js 13+ App Router)
import { Metadata } from 'next';
import OptimizedProductSection from '@/pages/HomePage/sections/OurProductSection/optimizer';
import { fetchAllProducts, ProductsResponse } from '@/services/product/products';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'المنتجات | A2Z',
  description: 'تصفح جميع منتجاتنا المتاحة',
  keywords: ['منتجات', 'تسوق', 'A2Z'],
  icons : '/favicon.ico',
};

// Enable ISR with revalidation
export const revalidate = 600; // Revalidate every 10 minutes

async function getProducts(): Promise<{
  data: ProductsResponse;
  buildTime: string;
  error: string | null;
}> {
  const startTime = Date.now();
  
  try {
    //console.log('🏗️  Fetching products for page...');
    
    const productsData = await fetchAllProducts();
    
    const loadTime = Date.now() - startTime;
    //console.log(`✅ Fetched ${productsData.data.length} products in ${loadTime}ms`);
    
    if (!productsData.data || productsData.data.length === 0) {
      console.warn('⚠️  No products found');
      
      return {
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1
          }
        },
        buildTime: new Date().toISOString(),
        error: 'No products available'
      };
    }
    
    //console.log(`📦 Successfully loaded ${productsData.data.length} products`);
    
    return {
      data: productsData,
      buildTime: new Date().toISOString(),
      error: null
    };
  } catch (error) {
    const loadTime = Date.now() - startTime;
    console.error(`❌ Error fetching products (after ${loadTime}ms):`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1
        },
        filters: {
          categories: [],
          brands: [],
          priceRange: {
            min: 0,
            max: 0
          }
        }
      },
      buildTime: new Date().toISOString(),
      error: errorMessage
    };
  }
}

export default async function ProductsPage() {
  const { data: initialData, buildTime, error } = await getProducts();
  
  return (
    <div>
      
      
      {/* Main Product Section */}
      <OptimizedProductSection initialData={initialData} />
      
     
    </div>
  );
}

// Optional: Generate static params if you have dynamic routes
// export async function generateStaticParams() {
//   return [];
// }

// Optional: Loading component
// export function Loading() {
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <div className="loader"></div>
//       <p>جاري تحميل المنتجات...</p>
//     </div>
//   );
// }

// Optional: Error boundary
// export function Error({ error, reset }: { error: Error; reset: () => void }) {
//   return (
//     <div style={{ padding: '40px', textAlign: 'center' }}>
//       <h2>حدث خطأ!</h2>
//       <p>{error.message}</p>
//       <button onClick={reset}>المحاولة مرة أخرى</button>
//     </div>
//   );
// }