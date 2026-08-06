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

export interface Customer {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone: string;
  email?: string;
  countryCode: string;
  stamps: number;
  totalStamps: number;
  rewardName: string;
  rewardDescription: string;
  stampsRequired: number;
  isCompleted: boolean;
  completedAt: Date | null;
  tier?: string;
  points?: number;
  totalVisits?: number;
  lastVisit?: Date;
  createdAt: Date;
}

export interface StampProgram {
  id: string;
  businessId: string;
  rewardName: string;
  rewardDescription: string;
  stampsRequired: number;
  stampAction: string;
  isActive: boolean;
  createdAt: Date;
}

export interface StampHistory {
  id: string;
  customerId: string;
  stampsAdded: number;
  totalStamps: number;
  message: string;
  timestamp: Date;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  customerName: string;
  timestamp: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  color: string;
  minPoints: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  items: MenuItemType[];
}

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: string;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export type ViewMode = "grid" | "list";

export interface FilterOptions {
  search: string;
  status: "all" | "active" | "inactive";
  dateRange: { from: Date | null; to: Date | null };
  sortBy: string;
  sortOrder: "asc" | "desc";
}
