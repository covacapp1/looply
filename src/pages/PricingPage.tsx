import { PageHeader } from "@/components/shared/PageHeader";
import { mockMenuCategories } from "@/services/mock";

export default function PricingPage() {
  return (
    <div>
      <PageHeader
        title="Carta de Precios"
        description="Vista de precios para tu negocio"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Menú Digital", href: "/menu" },
          { label: "Carta de Precios" },
        ]}
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Producto</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockMenuCategories.flatMap((cat) => [
              <tr key={`cat-${cat.id}`} className="bg-muted/30">
                <td colSpan={2} className="px-6 py-3">
                  <span className="font-semibold text-foreground">{cat.name}</span>
                </td>
              </tr>,
              ...cat.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">${item.price.toFixed(2)}</td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}
