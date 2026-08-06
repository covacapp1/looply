import { PageHeader } from "@/components/shared/PageHeader";
import { StampCardVisual } from "@/components/loyalty/StampCardVisual";
import { mockStampProgram } from "@/services/mock/mock-data";

export default function DigitalCardPage() {
  return (
    <div>
      <PageHeader
        title="Tarjeta Digital"
        description="Vista previa de la tarjeta de fidelización"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Fidelización", href: "/loyalty" },
          { label: "Tarjeta Digital" },
        ]}
      />
      <div className="max-w-md mx-auto">
        <StampCardVisual
          businessName="Tu Negocio"
          customerName="Nombre del Cliente"
          stampsRequired={mockStampProgram.stampsRequired || 6}
          currentStamps={0}
          rewardName={mockStampProgram.rewardName || "Tu Premio"}
          rewardDescription={mockStampProgram.rewardDescription || "Completa los sellos para ganar"}
          stampAction={mockStampProgram.stampAction || "Compra para ganar un sello"}
          isCompleted={false}
        />
      </div>
    </div>
  );
}
