import { PageHeader } from "@/components/shared/PageHeader";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { mockLoyaltyProgram } from "@/services/mock";

export default function DigitalCardPage() {
  const tier = mockLoyaltyProgram.tiers[0];

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
        <LoyaltyCard
          businessName={mockLoyaltyProgram.name || "Tu Negocio"}
          customerName="Nombre del Cliente"
          points={0}
          tier={tier}
        />
      </div>
    </div>
  );
}
