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
        title="No hay referidos"
        description="Invita a tus clientes a referir amigos y obtén beneficios mutuos."
        actionLabel="Configurar Referidos"
        onAction={() => {}}
      />
    </div>
  );
}
