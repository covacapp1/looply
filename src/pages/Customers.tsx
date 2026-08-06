import { Contact } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestiona tus clientes"
      />
      <EmptyState
        icon={Contact}
        title="No hay clientes"
        description="Los clientes aparecerán aquí cuando se registren en tu programa de fidelización"
        actionLabel="Ver Tarjetas de Fidelidad"
        onAction={() => window.location.href = "/loyalty"}
      />
    </div>
  );
}
