import { notFound } from 'next/navigation';
import ProductPage, { ProductData } from '@/Pages/ProductPage/ProductPage';
import productService from '@/services/api/products';

function pickPrimaryImage(p?: { imageList?: string[]; images?: string[]; image?: string } | null) {
  const list = (p?.imageList && Array.isArray(p.imageList) && p.imageList.length > 0)
    ? p.imageList
    : (Array.isArray(p?.images) ? p?.images : []);
  if (list.length > 0) return list[0] as string;
  if (p?.image) return p.image as string;
  return '/acessts/NoImage.jpg'; // Fixed placeholder path
}

export default async function ProductByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await the params in Next.js 15
  const decodedId = decodeURIComponent(id);

  try {
    // Fetch product details
    const res = await productService.getProductById(decodedId);
    const apiProduct: any = (res as any)?.data?.product || (res as any)?.product;
    if (!apiProduct) return notFound();

    // Reviews endpoint is not available (was returning 404). Use empty list for now.
    const reviews: Array<{ id: string | number; author: string; rating: number; date: string; content: string }> = [];

    const rating = Number(apiProduct.averageRate ?? apiProduct.rating ?? 0);
    const ratingCount = Number(apiProduct.reviewsCount ?? 0);

    const data: ProductData = {
      id: String(apiProduct._id || apiProduct.id || decodedId),
      title: apiProduct.name || apiProduct.nameAr || 'منتج',
      description: apiProduct.description || apiProduct.descriptionAr || '',
      price: Number(apiProduct.price ?? 0),
      image: pickPrimaryImage(apiProduct),
      rating,
      ratingCount,
      category: apiProduct.category || '',
      specs: [
        { label: 'التصنيف', value: apiProduct.category || 'غير محدد' },
        ...(apiProduct.brand ? [{ label: 'العلامة التجارية', value: String(apiProduct.brand) }] : []),
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
      stockType: apiProduct.stockType || 'unit',
    };
    return <ProductPage data={data} />;
  } catch (e) {
    return notFound();
  }
}