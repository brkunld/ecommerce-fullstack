// frontend/src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  featured?: boolean;
  isActive?: boolean;
  images: string[];
  categoryId: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  price: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: "PENDING" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  shippingAddress: string;
  contactPhone?: string;
  note?: string;
  items: OrderItem[];
  createdAt: string;
}
