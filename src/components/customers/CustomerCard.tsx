import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types";

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const initials = `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`.toUpperCase();

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">
              {customer.firstName} {customer.lastName}
            </h4>
            <Badge variant={customer.isCompleted ? "default" : "secondary"} className="text-xs">
              {customer.isCompleted ? "Completado" : "Activo"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{customer.phone}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xs text-muted-foreground">Sellos</p>
          <p className="text-sm font-semibold text-foreground">
            {customer.stamps}/{customer.stampsRequired}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xs text-muted-foreground">Registro</p>
          <p className="text-xs font-medium text-foreground">
            {formatDistanceToNow(new Date(customer.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
