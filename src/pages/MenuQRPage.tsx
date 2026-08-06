import { PageHeader } from "@/components/shared/PageHeader";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { mockBusiness } from "@/services/mock";

export default function MenuQRPage() {
  return (
    <div>
      <PageHeader
        title="QR del Menú"
        description="Comparte el menú de tu negocio"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Menú Digital", href: "/menu" },
          { label: "QR Menú" },
        ]}
      />
      <div className="max-w-md mx-auto">
        <QRGenerator
          url={`https://looply.app/menu/${mockBusiness.slug}`}
          title="QR del Menú"
          description="Escanea para ver el menú"
        />
      </div>
    </div>
  );
}
