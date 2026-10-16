export type DashboardSection =
  | 'overview'
  | 'profile'
  | 'products'
  | 'add-product'
  | 'listings'
  | 'orders'
  | 'sales'
  | 'activity'
  | 'marketplace-connect'
  | 'agribusiness-connect';

export interface Product {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Pulses';
  description: string;
  price: number;
  unit: 'kg' | 'quintal' | 'crate' | 'ton';
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  harvestDate: string;
  rating: number;
  soldCount: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productId: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  orderDate: string;
  status: OrderStatus;
  deliveryAddress: string;
}

export interface ActivityLog {
  id: string;
  type: 'product_added' | 'product_edited' | 'product_deleted' | 'order_updated' | 'profile_updated';
  title: string;
  description: string;
  timestamp: string;
}

export interface FarmerProfile {
  name: string;
  email: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  farmName: string;
  farmSize: string;
  crops: string[];
  avatar: string;
  joinedDate: string;
  sellerRating: number;
}

export interface CustomerInquiry {
  id: string;
  customerName: string;
  productNeeded: string;
  quantity: string;
  offerPrice: string;
  location: string;
  date: string;
  status: 'Open' | 'Connected' | 'Closed';
}

export interface AgriBusinessDeal {
  id: string;
  supplierName: string;
  category: 'Seeds' | 'Fertilizers' | 'Equipment' | 'Irrigation';
  title: string;
  discount: string;
  price: string;
  rating: number;
  contact: string;
}
