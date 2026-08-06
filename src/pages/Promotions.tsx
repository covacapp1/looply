import { Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PromotionsPage() {
  return (
    <div>
      <PageHeader
        title="Promociones"
        description="Crea y gestiona promociones para tus clientes"
      />
      <EmptyState
        icon={Tag}
        title="No hay promociones"
        description="Crea tu primera promoción para atraer más clientes"
        actionLabel="Crear Promoción"
        onAction={() => {}}
      />
    </div>
  );
}
