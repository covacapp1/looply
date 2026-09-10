import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Loader2, UserPlus, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Cajero {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function CajerosPage() {
  const { user, profile } = useAuth();
  const [cajeros, setCajeros] = useState<Cajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const loadCajeros = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("app_users")
      .select("id, email, full_name, role, created_at")
      .eq("role", "cajero")
      .order("created_at", { ascending: false });
    if (data) setCajeros(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadCajeros(); }, [loadCajeros]);

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

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cajero?")) return;
    await supabase.from("app_users").delete().eq("id", id);
    toast.success("Cajero eliminado");
    loadCajeros();
  }

  if (profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Solo el administrador puede gestionar cajeros</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cajeros"
        subtitle="Gestioná las cuentas de tus empleados"
        actions={
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cajero
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : cajeros.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-muted p-4 mx-auto mb-4 w-fit">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-1">No hay cajeros creados</p>
            <p className="text-xs text-muted-foreground">Creá una cuenta para que tu empleado pueda cargar ventas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cajeros.map((cajero) => (
            <Card key={cajero.id} className="border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{cajero.full_name}</p>
                    <p className="text-xs text-muted-foreground">{cajero.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Creado: {new Date(cajero.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">Cajero</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cajero.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              <p className="text-xs text-muted-foreground">Se usará para crear el login del cajero</p>
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
