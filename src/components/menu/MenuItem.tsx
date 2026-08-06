import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MenuItemType } from "@/types";

interface MenuItemProps {
  item: MenuItemType;
  className?: string;
}

export function MenuItem({ item, className }: MenuItemProps) {
  return (
    <motion.div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300",
        !item.isAvailable && "opacity-60",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-4">
        {item.image && (
          <div className="h-16 w-16 rounded-lg bg-muted shrink-0 overflow-hidden">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-foreground">{item.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {item.description}
              </p>
            </div>
            <Badge variant={item.isAvailable ? "default" : "secondary"} className="shrink-0">
              {item.isAvailable ? "Disponible" : "Agotado"}
            </Badge>
          </div>
          <p className="text-lg font-bold text-primary mt-2">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
