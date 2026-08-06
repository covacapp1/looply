import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus, ShoppingBag, Star, Gift, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Activity } from "@/types";

const activityIcons: Record<string, typeof UserPlus> = {
  visit: ShoppingBag,
  redemption: Gift,
  signup: UserPlus,
  points_earned: Star,
  stamp: Star,
  referral: Users,
};

const activityColors: Record<string, string> = {
  visit: "bg-blue-100 text-blue-600",
  redemption: "bg-emerald-100 text-emerald-600",
  signup: "bg-purple-100 text-purple-600",
  points_earned: "bg-yellow-100 text-yellow-600",
  stamp: "bg-orange-100 text-orange-600",
  referral: "bg-pink-100 text-pink-600",
};

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || ShoppingBag;
        const colorClass = activityColors[activity.type] || "bg-gray-100 text-gray-600";
        const initials = activity.customerName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2);

        return (
          <motion.div
            key={activity.id}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.customerName}
                </p>
                <div className={`flex h-5 w-5 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-3 w-3" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.timestamp), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
