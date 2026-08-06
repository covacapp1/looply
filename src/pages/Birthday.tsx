import { Cake } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function BirthdayPage() {
  return (
    <div>
      <PageHeader
        title="Cumpleaños"
        description="Gestiona promociones de cumpleaños para tus clientes"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Cumpleaños" },
        ]}
      />
      <EmptyState
        icon={Cake}
        title="Promociones de Cumpleaños"
        description="Configura promociones automáticas para los cumpleaños de tus clientes."
        actionLabel="Crear Promoción"
        onAction={() => {}}
      />
    </div>
  );
}
