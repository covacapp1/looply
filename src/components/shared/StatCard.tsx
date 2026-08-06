import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, change, changeLabel, iconColor }: StatCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconColor || "bg-primary/10"
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor ? "text-white" : "text-primary")} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {change !== undefined && (
          <p className={cn("text-xs mt-1", change >= 0 ? "text-emerald-600" : "text-red-500")}>
            {change >= 0 ? "+" : ""}{change}% {changeLabel || "vs mes anterior"}
          </p>
        )}
      </div>
    </motion.div>
  );
}
