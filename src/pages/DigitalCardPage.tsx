import { PageHeader } from "@/components/shared/PageHeader";
import { LoyaltyCard } from "@/components/loyalty/LoyaltyCard";
import { mockLoyaltyProgram, mockCustomers } from "@/services/mock";

export default function DigitalCardPage() {
  const customer = mockCustomers[0];
  const tier = mockLoyaltyProgram.tiers.find((t) => t.id === customer.tier) || mockLoyaltyProgram.tiers[0];

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
          businessName={mockLoyaltyProgram.name}
          customerName={customer.name}
          points={customer.points}
          tier={tier}
        />
      </div>
    </div>
  );
}
