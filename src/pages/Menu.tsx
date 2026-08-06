import { useState } from "react";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { QRGenerator } from "@/components/qr/QRGenerator";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockMenuCategories } from "@/services/mock";

export default function MenuPage() {
  const categories = mockMenuCategories;
  const [search, setSearch] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div>
      <PageHeader
        title="Menú Digital"
        description="Gestiona el menú de tu negocio"
        actions={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Menú Digital" },
        ]}
      />

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="menu">Menú</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="pricing">Carta de Precios</TabsTrigger>
          <TabsTrigger value="qr">QR Menú</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          {categories.length > 0 ? (
            <>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>
              {filteredCategories.length > 0 ? (
                <MenuGrid categories={filteredCategories} />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No se encontraron productos"
                  description="Intenta con otros términos de búsqueda"
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={UtensilsCrossed}
              title="No hay productos"
              description="Agrega productos para comenzar a crear tu menú digital"
              actionLabel="Agregar Producto"
              onAction={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                  <p className="text-xs text-muted-foreground mt-3">{cat.items.length} productos</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UtensilsCrossed}
              title="No hay categorías"
              description="Crea categorías para organizar tu menú"
              actionLabel="Crear Categoría"
              onAction={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value="pricing">
          {categories.length > 0 ? (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Categoría</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Precio</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.flatMap((cat) =>
                    cat.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{cat.name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {item.isAvailable ? "Disponible" : "Agotado"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={UtensilsCrossed}
              title="No hay productos"
              description="Agrega productos para ver la carta de precios"
            />
          )}
        </TabsContent>

        <TabsContent value="qr">
          <div className="max-w-md mx-auto">
            <QRGenerator
              url="https://looply.app/menu/tu-negocio"
              title="QR del Menú"
              description="Escanea para ver el menú"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
