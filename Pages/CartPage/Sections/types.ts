export type CartItem = {
  id: string;            // Cart item ID
  name: string;          // Name of the product
  price: number;         // Price of the individual item
  quantity: number;      // Quantity in cart
  image: string;         // URL or path to the product image
  unit: string;          // Unit of measurement (e.g., 'قطعة')
  availability: string;  // Availability status (e.g., 'متوفر', 'غير متوفر')
  category?: string;     // Optional category of the product
};