import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Plus, Trash2, Loader2, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getLocales, createLocale, deleteLocale } from "@/services/supabase";
import type { Locale } from "@/types";
import { toast } from "sonner";

export default function LocalesPage() {
  const { user } = useAuth();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const loadLocales = useCallback(async () => {
    if (!user) return;
    const data = await getLocales(user.id);
    setLocales(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadLocales(); }, [loadLocales]);

  async function handleCreate() {
    if (!name.trim() || !user) return;
    setCreating(true);
    const locale = await createLocale(user.id, name.trim());
    if (locale) {
      toast.success("Local creado");
      setName("");
      setShowCreate(false);
      loadLocales();
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este local?")) return;
    const ok = await deleteLocale(id);
    if (ok) {
      toast.success("Local eliminado");
      loadLocales();
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locales"
        subtitle={`${locales.length} local${locales.length !== 1 ? "es" : ""} configurado${locales.length !== 1 ? "s" : ""}`}
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Local
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : locales.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-muted p-4 mx-auto mb-4 w-fit">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-1">No hay locales creados</p>
            <p className="text-xs text-muted-foreground">Creá un local para registrar ventas y pedidos por sucursal</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locales.map((locale) => (
            <Card key={locale.id} className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{locale.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(locale.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(locale.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Local</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nombre del local</Label>
              <Input
                placeholder="Ej: Sucursal Centro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Crear Local
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
