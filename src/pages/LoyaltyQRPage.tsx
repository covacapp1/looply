import { PageHeader } from "@/components/shared/PageHeader";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { mockBusiness } from "@/services/mock";

export default function LoyaltyQRPage() {
  return (
    <div>
      <PageHeader
        title="QR de Fidelización"
        description="Genera y comparte el QR de tu programa de fidelización"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Fidelización", href: "/loyalty" },
          { label: "QR Fidelización" },
        ]}
      />
      <div className="max-w-md mx-auto">
        <QRGenerator
          url={`https://looply.app/join/${mockBusiness.slug}`}
          title="QR de Fidelización"
          description="Escanea para unirte al programa"
        />
      </div>
    </div>
  );
}
