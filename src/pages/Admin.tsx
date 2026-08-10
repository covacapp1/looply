import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Crown,
  Trash2,
  Gift,
  Bell,
  Loader2,
  Search,
  Shield,
} from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);
  const [makingAdmin, setMakingAdmin] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function becomeAdmin() {
    if (!user) return;
    setMakingAdmin(true);
    await supabase
      .from("app_users")
      .update({ role: "admin", subscription: "lifetime" })
      .eq("id", user.id);
    window.location.reload();
  }

  async function loadUsers() {
    const { data } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setUsers(data);
    setLoading(false);
  }

  async function toggleSubscription(userId: string, currentSub: string) {
    const newSub = currentSub === "lifetime" ? "free" : "lifetime";
    await supabase
      .from("app_users")
      .update({ subscription: newSub })
      .eq("id", userId);
    loadUsers();
  }

  async function deleteUser(userId: string) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    await supabase.from("app_users").delete().eq("id", userId);
    loadUsers();
  }

  async function sendNotification() {
    if (!notificationForm.title || !notificationForm.message) return;
    setSending(true);

    const { data: notification } = await supabase
      .from("notifications")
      .insert({
        title: notificationForm.title,
        message: notificationForm.message,
        created_by: profile ? (profile as any).id : null,
      })
      .select()
      .single();

    if (notification) {
      const userNotifications = users.map((u) => ({
        user_id: u.id,
        notification_id: notification.id,
      }));
      await supabase.from("user_notifications").insert(userNotifications);
    }

    setNotificationForm({ title: "", message: "" });
    setShowNotification(false);
    setSending(false);
    alert("Notificación enviada a todos los usuarios");
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-semibold mb-2">Acceso de Administrador</p>
            <p className="text-sm text-muted-foreground mb-4">
              Necesitás permisos de administrador para acceder a esta sección
            </p>
            <Button onClick={becomeAdmin} disabled={makingAdmin}>
              {makingAdmin ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Hacerme Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Admin"
        subtitle="Gestiona usuarios y notificaciones"
        actions={
          <Button onClick={() => setShowNotification(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Enviar Notificación
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Usuarios</p>
                <p className="text-lg font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pro/Lifetime</p>
                <p className="text-lg font-bold">
                  {users.filter((u) => u.subscription === "lifetime").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Admins</p>
                <p className="text-lg font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Notificaciones</p>
                <p className="text-lg font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay usuarios</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">
                        {user.full_name || "Sin nombre"}
                      </p>
                      {user.role === "admin" && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Admin
                        </Badge>
                      )}
                      <Badge
                        variant={user.subscription === "lifetime" ? "default" : "secondary"}
                        className={
                          user.subscription === "lifetime"
                            ? "bg-amber-500 text-white"
                            : ""
                        }
                      >
                        {user.subscription === "lifetime" ? "Lifetime" : "Free"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registro: {new Date(user.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSubscription(user.id, user.subscription)}
                      title={
                        user.subscription === "lifetime"
                          ? "Quitar Lifetime"
                          : "Dar Lifetime"
                      }
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Dialog */}
      <Dialog open={showNotification} onOpenChange={setShowNotification}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Notificación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se enviará a todos los {users.length} usuarios registrados
            </p>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Ej: Nuevo beneficio disponible"
                value={notificationForm.title}
                onChange={(e) =>
                  setNotificationForm({ ...notificationForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Mensaje *</Label>
              <Input
                placeholder="Ej: Ahora tenés 2x1 en todas las cafeterías..."
                value={notificationForm.message}
                onChange={(e) =>
                  setNotificationForm({ ...notificationForm, message: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNotification(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={sendNotification}
                disabled={!notificationForm.title || !notificationForm.message || sending}
                className="flex-1"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
