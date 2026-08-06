import type { Business, Customer, StampProgram, StampHistory, Activity, MenuCategory, Promotion } from "@/types";

export const mockBusiness: Business = {
  id: "1",
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

export const mockStampProgram: StampProgram = {
  id: "",
  businessId: "",
  rewardName: "",
  rewardDescription: "",
  stampsRequired: 6,
  stampAction: "",
  isActive: false,
  createdAt: new Date(),
};

export const mockCustomers: Customer[] = [];

export const mockStampHistory: StampHistory[] = [];

export const mockDashboardMetrics = {
  totalCustomers: 0,
  activeCustomers: 0,
  totalStamps: 0,
  completedCards: 0,
};

export const mockLoyaltyProgram = mockStampProgram;

export const mockMenuCategories: MenuCategory[] = [];

export const mockPromotions: Promotion[] = [];

export const mockQRCodes: any[] = [];

export const mockActivities: Activity[] = [];
