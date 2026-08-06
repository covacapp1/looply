import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ReferralsPage() {
  return (
    <div>
      <PageHeader
        title="Referidos"
        description="Programa de referidos para tus clientes"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Referidos" },
        ]}
      />
      <EmptyState
        icon={Users}
        title="Programa de Referidos"
        description="Invita a tus clientes a referir amigos. Cada cliente obtiene un código único y el comercio decide la recompensa."
        actionLabel="Configurar Referidos"
        onAction={() => {}}
      />
    </div>
  );
}
