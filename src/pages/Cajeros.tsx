import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Loader2, UserPlus, Search, UserCheck, UserX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Cajero {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function CajerosPage() {
  const { user } = useAuth();
  const [cajeros, setCajeros] = useState<Cajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });

  const loadCajeros = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("app_users")
      .select("id, email, full_name, role, is_active, created_at")
      .eq("role", "cajero")
      .order("created_at", { ascending: false });
    if (data) setCajeros(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadCajeros(); }, [loadCajeros]);

  const filteredCajeros = cajeros.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    if (!form.username.trim() || !form.password.trim()) return;
    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCreating(true);
    const email = `${form.username.trim().toLowerCase().replace(/\s+/g, "")}@cajero.looply`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { data: { full_name: form.username.trim(), role: "cajero" } },
    });

    if (error) {
      toast.error(error.message);
      setCreating(false);
      return;
    }

    if (data?.user?.id) {
      await supabase.from("app_users").upsert({
        id: data.user.id,
        email: email,
        role: "cajero",
        subscription: "active",
        full_name: form.username.trim(),
        is_active: true,
      }, { onConflict: "id", ignoreDuplicates: true });
    }

    toast.success("Cajero creado");
    setForm({ username: "", password: "" });
    setShowCreate(false);
    loadCajeros();
    setCreating(false);
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    await supabase.from("app_users").update({ is_active: !currentActive }).eq("id", id);
    toast.success(currentActive ? "Cajero desactivado" : "Cajero activado");
    loadCajeros();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cajero permanentemente?")) return;
    await supabase.from("app_users").delete().eq("id", id);
    toast.success("Cajero eliminado");
    loadCajeros();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cajeros"
        subtitle={`${cajeros.length} cajero${cajeros.length !== 1 ? "s" : ""} configurado${cajeros.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              ← Volver
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cargar cajero
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cajero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cajeros List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCajeros.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-muted p-4 mx-auto mb-4 w-fit">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-1">
              {search ? "No se encontraron cajeros" : "No hay cajeros creados"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search ? "Probá con otro nombre" : "Creá una cuenta para que tu empleado pueda cargar ventas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCajeros.map((cajero) => (
            <Card key={cajero.id} className="border-border overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{cajero.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{cajero.full_name?.toLowerCase().replace(/\s+/g, "")}</p>
                  </div>
                  <Badge
                    variant={cajero.is_active !== false ? "default" : "secondary"}
                    className={cajero.is_active !== false
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                    }
                  >
                    {cajero.is_active !== false ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleActive(cajero.id, cajero.is_active !== false)}
                  >
                    {cajero.is_active !== false ? (
                      <><UserX className="h-4 w-4 mr-1" /> Desactivar</>
                    ) : (
                      <><UserCheck className="h-4 w-4 mr-1" /> Activar</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cajero.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Nuevo Cajero
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input
                placeholder="Ej: juan"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={creating || !form.username.trim() || !form.password.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Crear Cajero
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
