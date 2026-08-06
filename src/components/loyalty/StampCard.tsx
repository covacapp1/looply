import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StampCardProps {
  totalStamps: number;
  completedStamps: number;
  reward: string;
  className?: string;
}

export function StampCard({ totalStamps, completedStamps, reward, className }: StampCardProps) {
  return (
    <motion.div
      className={cn("rounded-2xl border border-border bg-card p-6 shadow-sm", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">Tu progreso</p>
        <p className="text-lg font-bold text-foreground">
          {completedStamps}/{totalStamps} sellos
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        {Array.from({ length: totalStamps }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "aspect-square rounded-xl flex items-center justify-center",
              i < completedStamps
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {i < completedStamps ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="text-xs font-medium">{i + 1}</span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg bg-primary/10 p-3">
        <p className="text-sm text-primary font-medium">
          Recompensa: {reward}
        </p>
      </div>
    </motion.div>
  );
}
