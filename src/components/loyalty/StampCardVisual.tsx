import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Gift } from "lucide-react";

interface StampCardVisualProps {
  customerName: string;
  businessName: string;
  stampsRequired: number;
  currentStamps: number;
  rewardName: string;
  rewardDescription: string;
  stampAction: string;
  isCompleted: boolean;
}

export function StampCardVisual({
  customerName,
  businessName,
  stampsRequired,
  currentStamps,
  rewardName,
  rewardDescription,
  stampAction,
  isCompleted,
}: StampCardVisualProps) {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="bg-primary p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">{businessName}</p>
            <h3 className="text-lg font-bold text-primary-foreground">{rewardName}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-foreground/80">SELLOS</p>
            <p className="text-2xl font-bold text-primary-foreground">
              {currentStamps}/{stampsRequired}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-4 border-b border-border">
        <p className="text-sm text-muted-foreground">Cliente</p>
        <p className="font-semibold text-foreground">{customerName || "Sin cliente seleccionado"}</p>
      </div>

      {/* Stamp Action */}
      <div className="p-4 border-b border-border">
        <p className="text-sm text-muted-foreground">Para conseguir un sello:</p>
        <p className="font-medium text-foreground">{stampAction || "Configura tu programa"}</p>
      </div>

      {/* Stamps Grid */}
      <div className="p-4">
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {Array.from({ length: stampsRequired }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                i < currentStamps
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground",
                isCompleted && i < currentStamps && "bg-emerald-500 border-emerald-500"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              {i < currentStamps ? (
                <Check className="h-6 w-6" />
              ) : (
                <span className="text-lg font-bold">{i + 1}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Reward Info */}
        <div className={cn(
          "rounded-xl p-3 flex items-center gap-3",
          isCompleted
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : "bg-primary/10 border border-primary/20"
        )}>
          <Gift className={cn(
            "h-5 w-5 shrink-0",
            isCompleted ? "text-emerald-500" : "text-primary"
          )} />
          <div>
            {isCompleted ? (
              <p className="text-sm font-semibold text-emerald-600">
                🎉 ¡Felicitaciones! Ya puedes canjear tu premio: {rewardName}
              </p>
            ) : (
              <p className="text-sm text-foreground">
                <span className="font-semibold">{stampsRequired - currentStamps} más</span> y consigues: {rewardDescription || rewardName}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
