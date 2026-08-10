import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

export default function StatisticsPage() {
  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Análisis detallado del rendimiento de tu negocio"
      />
      <EmptyState
        icon={BarChart3}
        title="No hay reportes"
        description="Los reportes se generarán automáticamente cuando tengas actividad en tu negocio"
      />
    </div>
  );
}
