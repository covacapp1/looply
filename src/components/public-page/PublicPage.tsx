import { Store } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function PublicPagePlaceholder() {
  return (
    <div>
      <PageHeader
        title="Página Pública"
        description="Vista previa de la página pública de tu negocio"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Página Pública" },
        ]}
      />
      <EmptyState
        icon={Store}
        title="Página pública no configurada"
        description="Configura la información de tu negocio en Configuración para generar tu página pública."
        actionLabel="Ir a Configuración"
        onAction={() => window.location.href = "/settings"}
      />
    </div>
  );
}
