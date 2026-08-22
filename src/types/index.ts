export interface Business {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  primaryColor: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  website: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  openingHours: OpeningHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

export interface LoyaltyReward {
  id: string;
  businessId: string;
  name: string;
  description: string;
  stampsRequired: number;
  stampAction: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  businessId: string;
  loyaltyRewardId: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  stamps: number;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

export interface StampHistory {
  id: string;
  customerId: string;
  loyaltyRewardId: string;
  stampsAdded: number;
  totalStamps: number;
  message: string;
  timestamp: Date;
  sent: boolean;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  customerName: string;
  timestamp: Date;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductVariantOption {
  name: string;
  price: number;
}

export interface ProductVariant {
  name: string;
  options: ProductVariantOption[];
}

export interface MenuItem {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  isAvailable: boolean;
  imageUrl: string;
  variants: ProductVariant[];
  createdAt: Date;
}

export interface ShopCustomer {
  id: string;
  merchantId: string;
  phone: string;
  name: string;
  address: string;
  notes: string;
  createdAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variants?: Record<string, string>;
  variantPrices?: Record<string, number>;
}

export interface Order {
  id: string;
  merchantId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  merchantId: string;
  orderId: string | null;
  amount: number;
  description: string;
  type: "order" | "manual";
  createdAt: Date;
}

export interface DailyRegister {
  id: string;
  merchantId: string;
  openingAmount: number;
  closingAmount: number | null;
  status: "open" | "closed";
  openedAt: Date;
  closedAt: Date | null;
}

export interface CuentaCorriente {
  id: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  total: number;
  paid: number;
  remaining: number;
  createdAt: Date;
  status: "pending" | "paid";
}

export type ViewMode = "grid" | "list";

export interface FilterOptions {
  search: string;
  status: "all" | "active" | "inactive";
  dateRange: { from: Date | null; to: Date | null };
  sortBy: string;
  sortOrder: "asc" | "desc";
}
