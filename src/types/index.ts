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
  name: string;
  email: string;
  phone: string;
  avatar: string;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalVisits: number;
  totalSpent: number;
  lastVisit: Date;
  birthday: Date | null;
  referralCode: string;
  referredBy: string | null;
  createdAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  businessId: string;
  type: "points" | "stamps" | "visits" | "cashback" | "custom";
  name: string;
  description: string;
  pointsPerDollar: number;
  stampsRequired: number;
  stampReward: string;
  tiers: LoyaltyTier[];
  isActive: boolean;
  createdAt: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

export interface MenuItemType {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  order: number;
  createdAt: Date;
}

export interface MenuCategory {
  id: string;
  businessId: string;
  name: string;
  description: string;
  order: number;
  items: MenuItemType[];
}

export interface Promotion {
  id: string;
  businessId: string;
  title: string;
  description: string;
  image: string;
  discountType: "percentage" | "fixed" | "buy_x_get_y" | "points_multiplier";
  discountValue: number;
  startDate: Date;
  endDate: Date;
  daysOfWeek: number[];
  minPurchase: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
}

export interface QRCode {
  id: string;
  businessId: string;
  type: "loyalty" | "menu" | "promotions" | "public_page";
  url: string;
  scans: number;
  lastScanned: Date | null;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  totalRedemptions: number;
  pointsIssued: number;
  stampsCompleted: number;
  totalVisits: number;
  menuViews: number;
  qrScans: number;
  recentActivity: Activity[];
  weeklyVisits: { day: string; visits: number }[];
  customerGrowth: { month: string; count: number }[];
}

export interface Activity {
  id: string;
  type: "visit" | "redemption" | "signup" | "points_earned" | "stamp" | "referral";
  customerName: string;
  customerAvatar: string;
  description: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: "promotion" | "birthday" | "reward" | "reminder";
  title: string;
  message: string;
  isRead: boolean;
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
