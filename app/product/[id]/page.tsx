import React from "react";
import { notFound } from "next/navigation";
import ProductPage, { ProductData } from "../../../Pages/ProductPage/ProductPage";
import { fetchProducts, Product } from "./../../../services/product/products"; 
function slugify(name: string) {
  return encodeURIComponent((name || "").trim());
}

async function findProductById(idParam: string): Promise<Product | null> {
  try {
    const decoded = decodeURIComponent(idParam);
    
    // Fetch all products from API
    const response = await fetchProducts();
    const products = response.data;
    
    if (!products || products.length === 0) {
      return null;
    }
    
    // First try to find by exact name match
    let product = products.find((x) => (x.name || "").trim() === decoded.trim());
    
    // If not found, try by slugified name
    if (!product) {
      product = products.find((x) => slugify(x.name) === idParam);
    }
    
    // If still not found, try by ID
    if (!product) {
      product = products.find((x) => String(x.id) === decoded || String(x.id) === idParam);
    }
    
    return product || null;
  } catch (error) {
    console.error('Error finding product:', error);
    return null;
  }
}

export default async function ProductByIdPage({ params }: { params: { id: string } }) {
  const product = await findProductById(params.id);
  
  // If product not found, return 404
  if (!product) {
    notFound();
  }
  
  // Transform API product data to ProductData format
  const data: ProductData = {
    id: String(product.id),
    title: product.name || product.nameAr || "منتج غير معروف",
    description: product.description || product.descriptionAr || 
      "وصف المنتج غير متوفر حالياً. سيتم تحديث المعلومات قريباً.",
    price: Number(product.price ?? 0),
    // originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    // discount: product.discount,
    image: product.image || (product.images && product.images[0]) || "/assets/download (47).jpg",
    // images: product.images || [product.image].filter(Boolean),
    rating: product.rating || 4.0,
    ratingCount: product.reviewsCount || 20,
    specs: [
      { label: "التصنيف", value: product.category || "غير محدد" },
      { label: "العلامة التجارية", value: product.brand || "غير محدد" },
      { label: "الحالة", value: product.inStock ? "متوفر" : "غير متوفر" },
      { label: "الكمية المتوفرة", value: product.stockQuantity ? String(product.stockQuantity) : "غير محدد" },
      // Add custom specifications if available
      ...(product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({
        label: key,
        value: String(value)
      })) : [])
    ],
    // Default ratings distribution (you might want to fetch this from API if available)
    ratingsDistribution: [
      { stars: 5, count: Math.floor((product.reviewsCount || 20) * 0.65) },
      { stars: 4, count: Math.floor((product.reviewsCount || 20) * 0.15) },
      { stars: 3, count: Math.floor((product.reviewsCount || 20) * 0.10) },
      { stars: 2, count: Math.floor((product.reviewsCount || 20) * 0.05) },
      { stars: 1, count: Math.floor((product.reviewsCount || 20) * 0.05) },
    ],
    // Default reviews (you might want to create a separate API call for reviews)
    reviews: [
      { 
        id: "1", 
        author: "مستخدم محقق", 
        rating: 5, 
        date: "منذ أسبوع", 
        content: "منتج ممتاز وجودة عالية!" 
      },
      { 
        id: "2", 
        author: "مشتري سابق", 
        rating: 4, 
        date: "منذ شهر", 
        content: "جيد جداً وسعر مناسب." 
      },
    ],
    // tags: product.tags,
    // inStock: product.inStock,
    // stockQuantity: product.stockQuantity,
    // brand: product.brand,
    // category: product.category,
  };

  return <ProductPage data={data} />;
}

// Generate static params for build-time optimization
export async function generateStaticParams() {
  try {
    // Fetch products for static generation
    const response = await fetchProducts({ limit: 100 }); // Limit for performance
    const products = response.data || [];
    
    return products.slice(0, 50).map((product) => ({
      id: slugify(product.name || String(product.id))
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array to prevent build failure
    return [];
  }
}

// Optional: Add metadata generation
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await findProductById(params.id);
  
  if (!product) {
    return {
      title: 'منتج غير موجود',
      description: 'المنتج المطلوب غير متوفر'
    };
  }
  
  return {
    title: product.name || product.nameAr || 'منتج',
    description: product.description || product.descriptionAr || 'وصف المنتج',
    openGraph: {
      title: product.name || product.nameAr,
      description: product.description || product.descriptionAr,
      images: product.images || [product.image].filter(Boolean),
    },
  };
}