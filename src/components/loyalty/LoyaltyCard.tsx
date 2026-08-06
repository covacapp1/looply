import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LoyaltyTier } from "@/types";

interface LoyaltyCardProps {
  businessName: string;
  customerName: string;
  points: number;
  tier: LoyaltyTier;
  color?: string;
  className?: string;
}

export function LoyaltyCard({ businessName, customerName, points, tier, color, className }: LoyaltyCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-xl",
        className
      )}
      style={{ background: `linear-gradient(135deg, ${color || "#10b981"}, ${color || "#059669"}dd)` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-8 -mb-8" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm opacity-80">LOOPLY</p>
            <p className="text-lg font-bold">{businessName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">NIVEL</p>
            <p className="text-sm font-bold" style={{ color: tier.color }}>
              {tier.name}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm opacity-80">Titular</p>
          <p className="text-lg font-semibold">{customerName}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm opacity-80">Puntos</p>
            <p className="text-3xl font-bold">{points.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-60">Válido hasta</p>
            <p className="text-sm font-medium">12/2026</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
