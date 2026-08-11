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

export interface MenuItem {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl: string;
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
  status: "pending" | "preparing" | "sent" | "delivered" | "cancelled";
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

export type ViewMode = "grid" | "list";

export interface FilterOptions {
  search: string;
  status: "all" | "active" | "inactive";
  dateRange: { from: Date | null; to: Date | null };
  sortBy: string;
  sortOrder: "asc" | "desc";
}
