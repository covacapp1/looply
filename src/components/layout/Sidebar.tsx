import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Menú", href: "/" },
  { label: "Tarjetas de Fidelidad", href: "/loyalty" },
  { label: "Menú Digital", href: "/menu" },
  { label: "Clientes", href: "/customers" },
  { label: "Pedidos", href: "/orders" },
  { label: "Caja", href: "/caja" },
  { label: "Reportes", href: "/statistics" },
  { label: "Configuración", href: "/settings" },
];

const adminItems = [
  { label: "Admin", href: "/admin" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();

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
              <div className="mx-5 my-2 border-t border-border" />
              {adminItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "block px-5 py-3 text-sm transition-colors border-l-4",
                      isActive
                        ? "bg-amber-500/10 text-amber-600 border-amber-500 font-medium"
                        : "text-amber-600 border-transparent hover:bg-amber-500/10 hover:text-amber-700 hover:border-amber-500/30"
                    )}
                    onClick={onClose}
                  >
                    ⚡ {item.label}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Logout button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { signOut(); onClose(); }}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
