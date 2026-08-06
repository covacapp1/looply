import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  CreditCard,
  ScanLine,
  UtensilsCrossed,
  QrCode,
  DollarSign,
  Tag,
  Cake,
  Gift,
  Users,
  Contact,
  BarChart3,
  Smartphone,
  FileUp,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-blue-500" },
  { label: "Fidelización", href: "/loyalty", icon: Heart, color: "text-rose-500" },
  { label: "Tarjeta Digital", href: "/loyalty/card", icon: CreditCard, color: "text-violet-500" },
  { label: "QR Fidelización", href: "/loyalty/qr", icon: ScanLine, color: "text-cyan-500" },
  { label: "Menú Digital", href: "/menu", icon: UtensilsCrossed, color: "text-amber-500" },
  { label: "QR Menú", href: "/menu/qr", icon: QrCode, color: "text-teal-500" },
  { label: "Carta de Precios", href: "/menu/pricing", icon: DollarSign, color: "text-emerald-500" },
  { label: "Promociones", href: "/promotions", icon: Tag, color: "text-orange-500" },
  { label: "Cumpleaños", href: "/birthday", icon: Cake, color: "text-pink-500" },
  { label: "Recompensas", href: "/rewards", icon: Gift, color: "text-purple-500" },
  { label: "Referidos", href: "/referrals", icon: Users, color: "text-indigo-500" },
  { label: "Clientes", href: "/customers", icon: Contact, color: "text-sky-500" },
  { label: "Estadísticas", href: "/statistics", icon: BarChart3, color: "text-lime-500" },
  { label: "QR Inteligentes", href: "/qr-codes", icon: Smartphone, color: "text-fuchsia-500" },
  { label: "Importar/Exportar", href: "/import-export", icon: FileUp, color: "text-slate-500" },
  { label: "Configuración", href: "/settings", icon: Settings, color: "text-gray-500" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Logo */}
      <div className="flex justify-center pt-8 pb-6">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg mb-3">
            <span className="text-4xl font-bold text-primary-foreground">L</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">LOOPLY</h1>
          <p className="text-sm text-muted-foreground">Fidelización Inteligente</p>
        </motion.div>
      </div>

      {/* Grid de botones */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 sm:p-8",
                    "rounded-2xl border border-border bg-card",
                    "hover:shadow-lg hover:border-primary/30 hover:bg-primary/5",
                    "transition-all duration-200 group"
                  )}
                >
                  <div className={cn(
                    "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl",
                    "bg-muted group-hover:bg-primary/10 transition-colors duration-200"
                  )}>
                    <Icon className={cn("h-7 w-7 sm:h-8 sm:w-8", item.color)} />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-foreground text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
