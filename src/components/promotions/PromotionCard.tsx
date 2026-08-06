import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { Promotion } from "@/types";

interface PromotionCardProps {
  promotion: Promotion;
  onClick?: () => void;
}

const discountLabels: Record<string, string> = {
  percentage: "% OFF",
  fixed: "$ OFF",
  buy_x_get_y: "2x1",
  points_multiplier: "x Puntos",
};

export function PromotionCard({ promotion, onClick }: PromotionCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary">
            {promotion.discountType === "percentage"
              ? `${promotion.discountValue}%`
              : promotion.discountType === "fixed"
              ? `$${promotion.discountValue}`
              : promotion.discountType === "buy_x_get_y"
              ? "2x1"
              : `x${promotion.discountValue}`}
          </span>
        </div>
        <Badge
          className={`absolute top-3 right-3 ${
            promotion.isActive
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-gray-400 hover:bg-gray-500"
          }`}
        >
          {promotion.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-foreground">{promotion.title}</h4>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {promotion.description}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {discountLabels[promotion.discountType]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Hasta {format(new Date(promotion.endDate), "dd MMM yyyy", { locale: es })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
