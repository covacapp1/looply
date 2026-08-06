import { FileUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ImportExportPage() {
  return (
    <div>
      <PageHeader
        title="Importar / Exportar"
        description="Gestiona tus datos en masa"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Importar/Exportar" },
        ]}
      />
      <EmptyState
        icon={FileUp}
        title="Importar y Exportar Datos"
        description="Importa o exporta clientes, productos y datos del menú en formato Excel o CSV."
        actionLabel="Importar Archivo"
        onAction={() => {}}
      />
    </div>
  );
}
