import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Heart,
  UtensilsCrossed,
  Tag,
  Cake,
  Gift,
  Users,
  Contact,
  BarChart3,
  QrCode,
  FileUp,
  Settings,
  ChevronRight,
  X,
  CreditCard,
  Smartphone,
  ScanLine,
  MenuIcon,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color?: string;
  children?: { label: string; href: string; icon: LucideIcon }[];
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "bg-blue-500" },
    ],
  },
  {
    title: "Fidelización",
    items: [
      { label: "Programa", href: "/loyalty", icon: Heart, color: "bg-rose-500" },
      { label: "Tarjeta Digital", href: "/loyalty/card", icon: CreditCard, color: "bg-violet-500" },
      { label: "QR Fidelización", href: "/loyalty/qr", icon: ScanLine, color: "bg-cyan-500" },
    ],
  },
  {
    title: "Menú",
    items: [
      { label: "Menú Digital", href: "/menu", icon: UtensilsCrossed, color: "bg-amber-500" },
      { label: "QR Menú", href: "/menu/qr", icon: QrCode, color: "bg-teal-500" },
      { label: "Carta de Precios", href: "/menu/pricing", icon: DollarSign, color: "bg-emerald-500" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Promociones", href: "/promotions", icon: Tag, color: "bg-orange-500" },
      { label: "Cumpleaños", href: "/birthday", icon: Cake, color: "bg-pink-500" },
      { label: "Recompensas", href: "/rewards", icon: Gift, color: "bg-purple-500" },
      { label: "Referidos", href: "/referrals", icon: Users, color: "bg-indigo-500" },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Clientes", href: "/customers", icon: Contact, color: "bg-sky-500" },
      { label: "Estadísticas", href: "/statistics", icon: BarChart3, color: "bg-lime-500" },
      { label: "QR Inteligentes", href: "/qr-codes", icon: Smartphone, color: "bg-fuchsia-500" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Importar/Exportar", href: "/import-export", icon: FileUp, color: "bg-slate-500" },
      { label: "Configuración", href: "/settings", icon: Settings, color: "bg-gray-500" },
    ],
  },
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-primary-foreground">L</span>
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">LOOPLY</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-6">
              {navSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title && (
                    <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </p>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href ||
                        item.children?.some((child) => location.pathname === child.href);

                      return (
                        <div key={item.href}>
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            onClick={onClose}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                                isActive
                                  ? "bg-primary-foreground/20"
                                  : item.color
                              )}
                            >
                              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-white")} />
                            </div>
                            <span className="flex-1">{item.label}</span>
                            {isActive && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">CA</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Café Aroma</p>
                  <p className="text-xs text-muted-foreground">Plan Professional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
