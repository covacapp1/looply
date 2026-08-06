import type { Business, DashboardMetrics, Customer, LoyaltyProgram, MenuCategory, Promotion, QRCode } from "@/types";

export const mockBusiness: Business = {
  id: "",
  name: "",
  slug: "",
  logo: "",
  description: "",
  primaryColor: "#10b981",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  website: "",
  instagram: "",
  facebook: "",
  whatsapp: "",
  latitude: 0,
  longitude: 0,
  openingHours: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockDashboardMetrics: DashboardMetrics = {
  totalCustomers: 0,
  activeCustomers: 0,
  newCustomers: 0,
  totalRedemptions: 0,
  pointsIssued: 0,
  stampsCompleted: 0,
  totalVisits: 0,
  menuViews: 0,
  qrScans: 0,
  recentActivity: [],
  weeklyVisits: [],
  customerGrowth: [],
};

export const mockCustomers: Customer[] = [];

export const mockLoyaltyProgram: LoyaltyProgram = {
  id: "",
  businessId: "",
  type: "points",
  name: "",
  description: "",
  pointsPerDollar: 0,
  stampsRequired: 0,
  stampReward: "",
  tiers: [
    { id: "bronze", name: "Bronce", minPoints: 0, benefits: [], color: "#CD7F32" },
    { id: "silver", name: "Plata", minPoints: 1000, benefits: [], color: "#C0C0C0" },
    { id: "gold", name: "Oro", minPoints: 5000, benefits: [], color: "#FFD700" },
    { id: "platinum", name: "Platino", minPoints: 15000, benefits: [], color: "#E5E4E2" },
  ],
  isActive: false,
  createdAt: new Date(),
};

export const mockMenuCategories: MenuCategory[] = [];

export const mockPromotions: Promotion[] = [];

export const mockQRCodes: QRCode[] = [];
