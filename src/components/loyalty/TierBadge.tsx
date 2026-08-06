import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TierBadgeProps {
  tier: string;
  className?: string;
}

const tierStyles: Record<string, string> = {
  bronze: "bg-orange-100 text-orange-700 border-orange-200",
  silver: "bg-gray-100 text-gray-700 border-gray-200",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  platinum: "bg-slate-100 text-slate-700 border-slate-200",
};

const tierLabels: Record<string, string> = {
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  platinum: "Platino",
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", tierStyles[tier] || tierStyles.bronze, className)}
    >
      {tierLabels[tier] || tier}
    </Badge>
  );
}
