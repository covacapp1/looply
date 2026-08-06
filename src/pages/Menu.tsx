import { UtensilsCrossed } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function MenuPage() {
  return (
    <div>
      <PageHeader
        title="Menú Digital"
        description="Gestiona el menú de tu negocio"
      />
      <EmptyState
        icon={UtensilsCrossed}
        title="No hay productos"
        description="Agrega productos para comenzar a crear tu menú digital"
        actionLabel="Agregar Producto"
        onAction={() => {}}
      />
    </div>
  );
}
