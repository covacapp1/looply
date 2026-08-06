import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { PromotionCard } from "@/components/promotions/PromotionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { mockPromotions } from "@/services/mock";

export default function PromotionsPage() {
  const promotions = mockPromotions;
  const [search, setSearch] = useState("");

  const filteredPromotions = promotions.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const activePromotions = filteredPromotions.filter((p) => p.isActive);
  const inactivePromotions = filteredPromotions.filter((p) => !p.isActive);

  return (
    <div>
      <PageHeader
        title="Promociones"
        description="Crea y gestiona promociones para tus clientes"
        actions={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Promoción
          </Button>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Promociones" },
        ]}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar promociones..."
            className="pl-10 bg-muted/50 border-border"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">Todas ({filteredPromotions.length})</TabsTrigger>
          <TabsTrigger value="active">Activas ({activePromotions.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactivas ({inactivePromotions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredPromotions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPromotions.map((promo) => (
                <PromotionCard key={promo.id} promotion={promo} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No hay promociones"
              description="Crea tu primera promoción para atraer más clientes"
              actionLabel="Crear Promoción"
              onAction={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {activePromotions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activePromotions.map((promo) => (
                <PromotionCard key={promo.id} promotion={promo} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No hay promociones activas"
              description="Activa una promoción existente o crea una nueva"
            />
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-6">
          {inactivePromotions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inactivePromotions.map((promo) => (
                <PromotionCard key={promo.id} promotion={promo} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Plus}
              title="No hay promociones inactivas"
              description="Todas tus promociones están activas"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
