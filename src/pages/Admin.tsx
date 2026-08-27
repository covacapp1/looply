import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Send,
  Smartphone,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { getBusinessSettings, type BusinessSettings } from "@/services/supabase";

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription: string;
  is_active: boolean;
  created_at: string;
}

interface UserWithTrial extends AppUser {
  trialDaysLeft?: number;
  trialExpired?: boolean;
}

export default function AdminPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    url: "/",
  });
  const [sending, setSending] = useState(false);
  const [pushSubscriptionsCount, setPushSubscriptionsCount] = useState(0);
  const [adminTab, setAdminTab] = useState("users");

  useEffect(() => {
    loadUsers();
    loadPushCount();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const withTrial = await Promise.all(
        data.map(async (u) => {
          try {
            const settings = await getBusinessSettings(u.id);
            if (!settings.planStart) {
              return { ...u, trialDaysLeft: 90, trialExpired: false };
            }
            const start = new Date(settings.planStart);
            const end = new Date(start);
            end.setMonth(end.getMonth() + (settings.planMonths || 3));
            const now = new Date();
            const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return { ...u, trialDaysLeft: days, trialExpired: days <= 0 };
          } catch {
            return { ...u, trialDaysLeft: 90, trialExpired: false };
          }
        })
      );
      setUsers(withTrial);
    }
    setLoading(false);
  }

  async function loadPushCount() {
    const { count } = await supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true });
    setPushSubscriptionsCount(count || 0);
  }

  async function setSubscription(userId: string, newSub: string) {
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

    try {
      // Send via Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      if (!session?.access_token) {
        toast.error("No hay sesión activa");
        setSending(false);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: notificationForm.title,
          body: notificationForm.message,
          url: notificationForm.url || "/",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Notificación enviada a ${result.sent || 0} usuarios`);
      } else {
        // Fallback: save as in-app notification
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
        toast.success("Notificación enviada (solo in-app)");
      }
    } catch (error) {
      // Fallback: save as in-app notification
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
      toast.success("Notificación enviada (solo in-app)");
    }

    setNotificationForm({ title: "", message: "", url: "/" });
    setShowNotification(false);
    setSending(false);
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No tienes acceso de administrador</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Admin"
        subtitle="Gestiona usuarios y notificaciones"
      />

      <Tabs value={adminTab} onValueChange={setAdminTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="push">Notificaciones Push</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
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
                    <p className="text-xs text-muted-foreground">Lifetime</p>
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
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Trials</p>
                    <p className="text-lg font-bold">
                      {users.filter((u) => u.subscription === "trial").length}
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
                    <p className="text-xs text-muted-foreground">Push</p>
                    <p className="text-lg font-bold">{pushSubscriptionsCount}</p>
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
                            variant={user.subscription === "lifetime" ? "default" : user.subscription === "trial" ? "secondary" : "outline"}
                            className={
                              user.subscription === "lifetime"
                                ? "bg-amber-500 text-white"
                                : user.subscription === "trial"
                                ? "bg-blue-500 text-white"
                                : ""
                            }
                          >
                            {user.subscription === "lifetime"
                              ? "Lifetime"
                              : user.subscription === "trial"
                              ? "Trial"
                              : user.subscription || "Sin plan"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.subscription === "trial" && user.trialDaysLeft !== undefined && (
                          <p className="text-xs mt-1">
                            {user.trialExpired ? (
                              <span className="text-red-500 font-medium">Trial expirado</span>
                            ) : (
                              <span className="text-blue-500">
                                Trial: {user.trialDaysLeft} días restantes
                              </span>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Registro: {new Date(user.created_at).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {user.subscription !== "lifetime" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubscription(user.id, "lifetime")}
                            title="Dar Lifetime"
                          >
                            <Crown className="h-4 w-4 text-amber-500" />
                          </Button>
                        )}
                        {user.subscription === "lifetime" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubscription(user.id, "trial")}
                            title="Volver a Trial"
                          >
                            <Gift className="h-4 w-4" />
                          </Button>
                        )}
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
        </TabsContent>

        <TabsContent value="push" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Enviar Notificación Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{pushSubscriptionsCount} dispositivos suscriptos</p>
                  <p className="text-xs text-muted-foreground">Se enviará la notificación a todos</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ej: Nueva promoción"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Mensaje *</Label>
                <Textarea
                  placeholder="Ej: Tenés un 20% de descuento disponible."
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, message: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>URL (opcional)</Label>
                <Input
                  placeholder="Ej: /promociones"
                  value={notificationForm.url}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, url: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={sendNotification}
                disabled={!notificationForm.title || !notificationForm.message || sending}
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Notificación
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
