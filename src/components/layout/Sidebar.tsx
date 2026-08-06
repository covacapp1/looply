import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Fidelización", href: "/loyalty" },
  { label: "Tarjeta Digital", href: "/loyalty/card" },
  { label: "QR Fidelización", href: "/loyalty/qr" },
  { label: "Menú Digital", href: "/menu" },
  { label: "Carta de Precios", href: "/menu/pricing" },
  { label: "Promociones", href: "/promotions" },
  { label: "Recompensas", href: "/rewards" },
  { label: "Clientes", href: "/customers" },
  { label: "Reportes", href: "/statistics" },
  { label: "Configuración", href: "/settings" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="py-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "block px-5 py-3 text-sm transition-colors border-l-4",
                      isActive
                        ? "bg-primary/10 text-primary border-primary font-medium"
                        : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground hover:border-muted-foreground/30"
                    )}
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Close button - mobile only */}
          <div className="p-4 border-t border-border lg:hidden">
            <Button
              variant="destructive"
              className="w-full"
              onClick={onClose}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
