import { Link } from "react-router-dom";
import { QrCode, Tag, Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  { label: "Crear QR", href: "/qr-codes", icon: QrCode, color: "bg-blue-500" },
  { label: "Nueva Promoción", href: "/promotions/create", icon: Tag, color: "bg-purple-500" },
  { label: "Ver Recompensas", href: "/rewards", icon: Gift, color: "bg-orange-500" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {quickActions.map((action) => (
        <Link key={action.label} to={action.href}>
          <Button variant="outline" className="gap-2 border-border hover:bg-muted">
            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${action.color}`}>
              <action.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm">{action.label}</span>
          </Button>
        </Link>
      ))}
    </div>
  );
}
