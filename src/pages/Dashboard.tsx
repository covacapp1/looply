import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  UtensilsCrossed,
  Contact,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Tarjetas de Fidelidad", href: "/loyalty", icon: Heart, color: "text-rose-500" },
  { label: "Menú Digital", href: "/menu", icon: UtensilsCrossed, color: "text-amber-500" },
  { label: "Clientes", href: "/customers", icon: Contact, color: "text-sky-500" },
  { label: "Reportes", href: "/statistics", icon: BarChart3, color: "text-lime-500" },
  { label: "Configuración", href: "/settings", icon: Settings, color: "text-gray-500" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Logo */}
      <div className="flex justify-center pt-4 pb-3">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg mb-2">
            <span className="text-2xl font-bold text-primary-foreground">L</span>
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">LOOPLY</h1>
        </motion.div>
      </div>

      {/* Grid de botones */}
      <div className="flex-1 px-3 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 max-w-6xl mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 sm:p-4",
                    "rounded-xl border border-border bg-card",
                    "hover:shadow-md hover:border-primary/30 hover:bg-primary/5",
                    "transition-all duration-200 group"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl",
                    "bg-muted group-hover:bg-primary/10 transition-colors duration-200"
                  )}>
                    <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", item.color)} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight">
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
