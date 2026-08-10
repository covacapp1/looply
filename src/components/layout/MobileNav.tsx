import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Heart, Users, BarChart3, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNav() {
  const location = useLocation();
  const { profile } = useAuth();

  const mobileNavItems = [
    { label: "Menú", href: "/", icon: LayoutDashboard },
    { label: "Fidelidad", href: "/loyalty", icon: Heart },
    { label: "Clientes", href: "/customers", icon: Users },
    { label: "Reportes", href: "/statistics", icon: BarChart3 },
    { label: "Ajustes", href: "/settings", icon: Settings },
    ...(profile?.role === "admin" ? [{ label: "Admin", href: "/admin", icon: Shield }] : []),
  ];

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
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[48px]",
                isActive
                  ? item.href === "/admin"
                    ? "text-amber-600"
                    : "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
