import { UtensilsCrossed } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PricingPage() {
  return (
    <div>
      <PageHeader
        title="Carta de Precios"
        description="Vista de precios para tu negocio"
      />
      <EmptyState
        icon={UtensilsCrossed}
        title="No hay productos"
        description="Agrega productos en Menú Digital para ver la carta de precios"
        actionLabel="Ir a Menú Digital"
        onAction={() => window.location.href = "/menu"}
      />
    </div>
  );
}
