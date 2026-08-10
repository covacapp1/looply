import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    if (!user) return;

    const { data } = await supabase
      .from("user_notifications")
      .select("id, is_read, notifications(id, title, message, created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const mapped = data.map((item: any) => ({
        id: item.id,
        title: item.notifications.title,
        message: item.notifications.message,
        created_at: item.notifications.created_at,
        is_read: item.is_read,
      }));
      setNotifications(mapped);
    }
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications(notifications.map((n) =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        subtitle={`${unreadCount} sin leer`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={!notif.is_read ? "border-primary/50 bg-primary/5" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notif.title}</p>
                      {!notif.is_read && (
                        <Badge className="bg-primary text-primary-foreground text-xs">Nuevo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notif.created_at).toLocaleString("es-AR")}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="Marcar como leído"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
