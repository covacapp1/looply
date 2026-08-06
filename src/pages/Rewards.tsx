import { Gift } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function RewardsPage() {
  return (
    <div>
      <PageHeader
        title="Recompensas"
        description="Gestiona las recompensas canjeables por tus clientes"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Recompensas" },
        ]}
      />
      <EmptyState
        icon={Gift}
        title="No hay recompensas"
        description="Crea recompensas que tus clientes puedan canjear con sus puntos."
        actionLabel="Crear Recompensa"
        onAction={() => {}}
      />
    </div>
  );
}
