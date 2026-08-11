import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock, ChefHat, Truck, CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByMerchant, updateOrderStatus } from "@/services/supabase";
import type { Order } from "@/types";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-amber-100 text-amber-700", next: "preparing" as const, nextLabel: "Preparar" },
  preparing: { label: "Preparando", icon: ChefHat, color: "bg-blue-100 text-blue-700", next: "sent" as const, nextLabel: "Enviar" },
  sent: { label: "Enviado", icon: Truck, color: "bg-purple-100 text-purple-700", next: "delivered" as const, nextLabel: "Entregado" },
  delivered: { label: "Entregado", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", next: null, nextLabel: "" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-red-100 text-red-700", next: null, nextLabel: "" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const data = await getOrdersByMerchant(user.id);
    setOrders(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loadOrders]);

  async function handleStatusChange(orderId: string, newStatus: Order["status"]) {
    setUpdatingId(orderId);
    const ok = await updateOrderStatus(orderId, newStatus);
    if (ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Pedido actualizado a "${STATUS_CONFIG[newStatus].label}"`);
    }
    setUpdatingId(null);
  }

  function copyShareLink() {
    if (!user) return;
    const link = `${window.location.origin}/shop/${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles");
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Gestioná los pedidos de tus clientes"
        actions={
          <Button variant="outline" size="sm" onClick={copyShareLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link
          </Button>
        }
      />

      {/* Share Link Card */}
      <Card className="border-border mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Link de tu tienda</p>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {user ? `${window.location.origin}/shop/${user.id}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" asChild>
                <a href={user ? `/shop/${user.id}` : "#"} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <ClipboardList className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay pedidos</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Compartí el link de tu tienda para que tus clientes empiecen a pedir
          </p>
          <Button onClick={copyShareLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link de Tienda
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Activos ({activeOrders.length})
              </h2>
              <div className="space-y-3">
                {activeOrders.map((order) => {
                  const config = STATUS_CONFIG[order.status];
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-foreground">{order.customerName || "Cliente"}</p>
                                <Badge className={config.color}>
                                  <Icon className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                              {order.customerAddress && (
                                <p className="text-xs text-muted-foreground">📍 {order.customerAddress}</p>
                              )}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              ${order.total.toLocaleString("es-AR")}
                            </p>
                          </div>

                          <div className="text-sm text-muted-foreground mb-3 space-y-1">
                            {order.items.map((item, i) => (
                              <p key={i}>
                                {item.quantity}x {item.name} — ${(item.price * item.quantity).toLocaleString("es-AR")}
                              </p>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Clock className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleString("es-AR")}
                          </div>

                          {/* Status Actions */}
                          <div className="flex items-center gap-2">
                            {config.next && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(order.id, config.next!)}
                                disabled={updatingId === order.id}
                              >
                                {updatingId === order.id ? "Actualizando..." : config.nextLabel}
                              </Button>
                            )}
                            {order.status !== "cancelled" && order.status !== "delivered" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(order.id, "cancelled")}
                                disabled={updatingId === order.id}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Orders */}
          {completedOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Completados ({completedOrders.length})
              </h2>
              <div className="space-y-2">
                {completedOrders.map((order) => {
                  const config = STATUS_CONFIG[order.status];
                  const Icon = config.icon;
                  return (
                    <Card key={order.id} className="border-border opacity-70">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">${order.total.toLocaleString("es-AR")}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
