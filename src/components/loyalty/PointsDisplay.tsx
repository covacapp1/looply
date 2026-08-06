import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PointsDisplayProps {
  points: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PointsDisplay({ points, label = "Puntos", size = "md", className }: PointsDisplayProps) {
  const sizes = {
    sm: { text: "text-lg", label: "text-xs" },
    md: { text: "text-2xl", label: "text-sm" },
    lg: { text: "text-4xl", label: "text-base" },
  };

  return (
    <motion.div
      className={cn("text-center", className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className={cn("font-bold text-primary", sizes[size].text)}>
        {points.toLocaleString()}
      </p>
      <p className={cn("text-muted-foreground", sizes[size].label)}>{label}</p>
    </motion.div>
  );
}
