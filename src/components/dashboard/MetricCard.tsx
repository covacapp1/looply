import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconBg?: string;
  iconColor?: string;
}

export function MetricCard({ icon: Icon, label, value, change, changeLabel, iconBg, iconColor }: MetricCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            iconBg || "bg-primary/10"
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor || "text-primary")} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
      {change !== undefined && (
        <div className="mt-3 pt-3 border-t border-border">
          <p
            className={cn(
              "text-xs font-medium",
              change >= 0 ? "text-emerald-600" : "text-red-500"
            )}
          >
            {change >= 0 ? "+" : ""}{change}% {changeLabel || "vs mes anterior"}
          </p>
        </div>
      )}
    </motion.div>
  );
}
