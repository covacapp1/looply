export const APP_NAME = "LOOPLY";
export const APP_DESCRIPTION = "La plataforma más moderna para fidelizar clientes";

export const TIERS = [
  { id: "bronze", name: "Bronce", color: "#CD7F32", minPoints: 0 },
  { id: "silver", name: "Plata", color: "#C0C0C0", minPoints: 1000 },
  { id: "gold", name: "Oro", color: "#FFD700", minPoints: 5000 },
  { id: "platinum", name: "Platino", color: "#E5E4E2", minPoints: 15000 },
] as const;

export const LOYALTY_TYPES = [
  { id: "points", name: "Puntos", icon: "Coins", description: "Acumula puntos por cada compra" },
  { id: "stamps", name: "Sellos", icon: "Stamp", description: "Completa sellos para obtener premios" },
] as const;

export const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

export const NAV_ITEMS = [
  { label: "Menú", href: "/", icon: "LayoutDashboard" },
  { label: "Tarjetas de Fidelidad", href: "/loyalty", icon: "Heart" },
  { label: "Menú Digital", href: "/menu", icon: "UtensilsCrossed" },
  { label: "Carta de Precios", href: "/menu/pricing", icon: "DollarSign" },
  { label: "Clientes", href: "/customers", icon: "Contact" },
  { label: "Reportes", href: "/statistics", icon: "BarChart3" },
  { label: "Configuración", href: "/settings", icon: "Settings" },
] as const;

export const CHART_COLORS = {
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  orange: "#f97316",
  pink: "#ec4899",
  yellow: "#eab308",
  cyan: "#06b6d4",
  red: "#ef4444",
};
