import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

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
      <EmptyState
        icon={QrCode}
        title="No hay QR configurados"
        description="Configura tu programa de fidelización y menú para generar códigos QR automáticamente."
        actionLabel="Ir a Fidelización"
        onAction={() => window.location.href = "/loyalty"}
      />
    </div>
  );
}
