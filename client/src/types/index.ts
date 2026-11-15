export interface ProductImage {
  url: string;
  public_id?: string;
}

export interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedBuyer?: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  sku?: string;
  name: string;
  description: string;
  features: string[];
  specifications?: Record<string, string>;
  tags: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  subCategory?: string;
  brand: string;
  images: ProductImage[];
  variants?: {
    colors?: string[];
    sizes?: string[];
  };
  stock: number;
  soldCount?: number;
  isFeatured?: boolean;
  reviews: Review[];
  rating: number;
  numReviews: number;
}

export interface CartItem extends Product {
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingAddress {
  label?: string;
  fullName?: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  shippingAddress?: ShippingAddress;
  wishlist: Product[];
}

export interface Order {
  _id: string;
  orderNumber: string;
  trackingId: string;
  user?: { name: string; email: string };
  orderItems: {
    product: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    selectedColor?: string;
    selectedSize?: string;
  }[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    transactionId?: string;
    methodDetail?: string;
    status?: string;
  };
  couponCode?: string;
  discountAmount?: number;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  orderStatus: string;
  createdAt: string;
}
