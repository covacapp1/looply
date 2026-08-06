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
  { id: "visits", name: "Visitas", icon: "Footprints", description: "Acumula visitas para beneficios" },
  { id: "cashback", name: "Cashback", icon: "Wallet", description: "Dinero de vuelta en cada compra" },
  { id: "custom", name: "Personalizado", icon: "Settings", description: "Diseña tu propio programa" },
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
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Fidelización", href: "/loyalty", icon: "Heart", children: [
    { label: "Programa", href: "/loyalty" },
    { label: "Tarjeta Digital", href: "/loyalty/card" },
    { label: "QR Fidelización", href: "/loyalty/qr" },
  ]},
  { label: "Menú Digital", href: "/menu", icon: "UtensilsCrossed", children: [
    { label: "Menú", href: "/menu" },
    { label: "QR Menú", href: "/menu/qr" },
    { label: "Carta de Precios", href: "/menu/pricing" },
  ]},
  { label: "Promociones", href: "/promotions", icon: "Tag" },
  { label: "Cumpleaños", href: "/birthday", icon: "Cake" },
  { label: "Recompensas", href: "/rewards", icon: "Gift" },
  { label: "Referidos", href: "/referrals", icon: "Users" },
  { label: "Clientes", href: "/customers", icon: "Contact" },
  { label: "Estadísticas", href: "/statistics", icon: "BarChart3" },
  { label: "QR Inteligentes", href: "/qr-codes", icon: "QrCode" },
  { label: "Importar/Exportar", href: "/import-export", icon: "FileUp" },
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
