import { PageHeader } from "@/components/shared/PageHeader";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { mockQRCodes, mockBusiness } from "@/services/mock";

export default function QRCodesPage() {
  return (
    <div>
      <PageHeader
        title="QR Inteligentes"
        description="Gestiona los códigos QR de tu negocio"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "QR Inteligentes" },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockQRCodes.map((qr) => (
          <QRGenerator
            key={qr.id}
            url={qr.url}
            title={
              qr.type === "loyalty"
                ? "Fidelización"
                : qr.type === "menu"
                ? "Menú"
                : qr.type === "promotions"
                ? "Promociones"
                : "Página Pública"
            }
            description={`${qr.scans} escaneos`}
          />
        ))}
      </div>
    </div>
  );
}
