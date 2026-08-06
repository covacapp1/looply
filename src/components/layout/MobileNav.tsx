import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Heart, Users, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Inicio", href: "/", icon: LayoutDashboard, color: "bg-blue-500" },
  { label: "Fidelización", href: "/loyalty", icon: Heart, color: "bg-rose-500" },
  { label: "Clientes", href: "/customers", icon: Users, color: "bg-sky-500" },
  { label: "Estadísticas", href: "/statistics", icon: BarChart3, color: "bg-lime-500" },
  { label: "Ajustes", href: "/settings", icon: Settings, color: "bg-gray-500" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
