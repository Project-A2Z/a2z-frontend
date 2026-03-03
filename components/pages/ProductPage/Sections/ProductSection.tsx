// Pages/HomePage/sections/OurProductSection/ProductSection.tsx
import { productService, getProductPrice, getProductStock } from '@/services/api/products';

export default async function ProductsPage() {
  let productsData = { status: 'success', data: [] as any[] };
  try {
    productsData = await productService.getProducts({ limit: 12 });
  } catch (error: any) {
    console.error('Error in ProductsPage:', error);
    productsData = { status: 'error', data: [] };
  }

  const products = productsData.data || [];

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-4 sm:p-6">
      <h2 className="text-right text-lg sm:text-xl font-bold text-black87 mb-3">منتجاتنا</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => {
            // Derive price & stock from the variants array (new backend shape)
            const price = getProductPrice(product);
            const stock = getProductStock(product);

            return (
              <div key={product._id} className="border rounded-lg p-4">
                <img
                  src={product.imageList?.[0] || product.image || '/acessts/NoImage.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <h3 className="text-black87">{product.name}</h3>
                <p className="text-primary font-bold">{price.toLocaleString()} ج.م</p>
                {stock === 0 && (
                  <p className="text-xs text-red-500 mt-1">غير متوفر</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-black60">
          لا توجد منتجات متاحة حاليًا.
        </div>
      )}
    </section>
  );
}