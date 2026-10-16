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
  category:
    | 'Vegetables'
    | 'Fruits'
    | 'Grains'
    | 'Spices'
    | 'Pulses'
    | 'Farming Equipment'
    | 'Hand Tools'
    | 'Tractors & Machinery'
    | 'Irrigation Equipment'
    | 'Sprayers'
    | 'Other Agri Tools';
  description: string;
  price: number;
  unit: 'kg' | 'quintal' | 'crate' | 'ton' | 'piece' | 'set' | 'day' | 'week' | 'month';
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  harvestDate: string;
  rating: number;
  soldCount: number;
  listingType?: 'sale' | 'rental';
  sellerType?: 'farmer' | 'agri-business';
  sellerEmail?: string;
  sellerName?: string;
  sellerLocation?: string;
  createdAt?: string;
}

export type MarketplaceTransactionStatus = 'Requested' | 'Accepted' | 'Completed' | 'Cancelled';

export interface MarketplaceTransaction {
  id: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  productId: string;
  productName: string;
  transactionType: 'sale' | 'rental';
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  location: string;
  createdAt: string;
  status: MarketplaceTransactionStatus;
}

export type AgriBusinessCategory = Extract<
  Product['category'],
  | 'Farming Equipment'
  | 'Hand Tools'
  | 'Tractors & Machinery'
  | 'Irrigation Equipment'
  | 'Sprayers'
  | 'Other Agri Tools'
>;

export const AGRI_BUSINESS_CATEGORIES: AgriBusinessCategory[] = [
  'Farming Equipment',
  'Hand Tools',
  'Tractors & Machinery',
  'Irrigation Equipment',
  'Sprayers',
  'Other Agri Tools',
];

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
