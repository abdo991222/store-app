export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  inStock: boolean;
  emoji: string;
  desc: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  grad: string;
}

export interface CartItem {
  id: string;
  qty: number;
}

export interface CartLine extends CartItem {
  product: Product;
}

export interface CustomerForm {
  name: string;
  phone: string;
  address: string;
  location: string;
  notes: string;
}

/** What the backend remembers about a product at the moment it was ordered. */
export interface OrderProductSnapshot {
  id: string;
  name: string;
  price: number;
}

export interface OrderLine {
  id: string;
  qty: number;
  product: OrderProductSnapshot;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderLine[];
  total: number;
  customer: CustomerForm;
  method: 'website' | 'whatsapp';
}

export interface Settings {
  storeName: string;
  waNumber: string;
}

export type ViewName =
  | 'home' | 'products' | 'category' | 'product' | 'cart' | 'checkout'
  | 'success' | 'contact' | 'admin-login' | 'admin' | 'track-order';

export interface ViewParams {
  id?: string;
  category?: string;
}
