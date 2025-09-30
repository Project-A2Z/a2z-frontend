// pages/products/index.tsx (or your main products page)
import { GetStaticProps } from 'next';
import OptimizedProductSection from '@/Pages/HomePage/sections/OurProductSection/optimizer';
import { getStaticProducts, ProductsResponse } from '@/services/product/products';

interface ProductsPageProps {
  initialData?: ProductsResponse;
  revalidate?: number;
  buildTime?: string;
}

export default function ProductsPage({ initialData, buildTime }: ProductsPageProps) {
  return (
    <div>
      {/* Optional: Show build time in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: '10px', background: '#f0f0f0', fontSize: '12px' }}>
          Build Time: {buildTime}
        </div>
      )} */}
      
      <OptimizedProductSection initialData={initialData} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<ProductsPageProps> = async () => {
  try {
    console.log('Building products page with static data...');
    
    // Fetch products at build time
    const productsData = await getStaticProducts();
    
    // Optional: Add some build-time validation
    if (!productsData.data || productsData.data.length === 0) {
      console.warn('No products found during build time');
    }
    
    return {
      props: {
        initialData: productsData,
        buildTime: new Date().toISOString(),
      },
      // Incremental Static Regeneration (ISR)
      // Revalidate every 10 minutes (600 seconds)
      revalidate: 600,
    };
  } catch (error) {
    console.error('Error in getStaticProps for products:', error);
    
    // Return fallback data instead of failing the build
    return {
      props: {
        initialData: {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1
          }
        },
        buildTime: new Date().toISOString(),
      },
      // Retry more frequently if there was an error
      revalidate: 60,
    };
  }
};