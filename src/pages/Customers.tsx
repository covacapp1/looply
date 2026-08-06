import { useState } from "react";
import { Plus, Filter, Contact } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockCustomers } from "@/services/mock";

export default function CustomersPage() {
  const customers = mockCustomers;
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${customers.length} clientes registrados`}
        actions={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Clientes" },
        ]}
      />

      {customers.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre, email o teléfono..." />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Filter}
              title="No se encontraron clientes"
              description="Intenta con otros términos de búsqueda"
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={Contact}
          title="No hay clientes"
          description="Los clientes aparecerán aquí cuando se registren en tu programa de fidelización"
          actionLabel="Ver QR de Fidelización"
          onAction={() => window.location.href = "/loyalty/qr"}
        />
      )}
    </div>
  );
}
