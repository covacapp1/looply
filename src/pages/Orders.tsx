import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Clock, CheckCircle2, XCircle, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByMerchant, updateOrderStatus, createSale, createCuentaCorriente, getBusinessSettings, saveBusinessSettings } from "@/services/supabase";
import type { Order } from "@/types";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", icon: Clock, color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmado", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-red-100 text-red-700" },
};

const DEFAULT_MESSAGE = "Hola {cliente}, gracias por tu compra. Tu pedido #{pedido} fue recibido y estará listo en aproximadamente {tiempo} minutos.";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [msgDialogOpen, setMsgDialogOpen] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE);
  const [estimatedTime, setEstimatedTime] = useState("30");

  const loadOrders = useCallback(async () => {
    if (!user) return;
    const data = await getOrdersByMerchant(user.id);
    setOrders(data);
    const settings = await getBusinessSettings(user.id);
    setMessageTemplate(settings.orderMessage || DEFAULT_MESSAGE);
    setEstimatedTime(settings.orderTime || "30");
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  async function handleSaveMessage() {
    if (!user) return;
    const settings = await getBusinessSettings(user.id);
    const updated = await saveBusinessSettings(user.id, {
      ...settings,
      orderMessage: messageTemplate,
      orderTime: estimatedTime,
    });
    if (updated) {
      setMsgDialogOpen(false);
      toast.success("Mensaje guardado en la nube");
    } else {
      toast.error("Error al guardar");
    }
  }

  function handleSendConfirmation(order: Order) {
    const phone = order.customerPhone?.replace(/\D/g, "");
    if (!phone) {
      toast.error("El cliente no tiene número de WhatsApp");
      return;
    }

    const message = messageTemplate
      .replace("{cliente}", order.customerName || "Cliente")
      .replace("{pedido}", order.id.slice(0, 8))
      .replace("{tiempo}", estimatedTime)
      .replace("{total}", `$${order.total.toLocaleString("es-AR")}`);

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("Abriendo WhatsApp...");
  }

  async function handleConfirm(order: Order) {
    if (!user) return;
    setUpdatingId(order.id);

    const sale = await createSale({
      merchantId: user.id,
      orderId: order.id,
      amount: order.total,
      description: `Pedido de ${order.customerName || "Cliente"}`,
      type: "order",
    });

    if (sale) {
      await updateOrderStatus(order.id, "confirmed");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "confirmed" } : o))
      );
      toast.success("Pedido confirmado y venta registrada en caja");
    }
    setUpdatingId(null);
  }

  async function handlePendiente(order: Order) {
    if (!user) return;
    setUpdatingId(order.id);

    const entry = await createCuentaCorriente({
      merchantId: user.id,
      customerId: order.customerId,
      customerName: order.customerName || "Cliente",
      customerPhone: order.customerPhone || "",
      orderId: order.id,
      total: order.total,
    });

    if (entry) {
      await updateOrderStatus(order.id, "confirmed");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "confirmed" } : o))
      );
      toast.success("Agregado a cuenta corriente");
    }
    setUpdatingId(null);
  }

  async function handleCancel(orderId: string) {
    setUpdatingId(orderId);
    const ok = await updateOrderStatus(orderId, "cancelled");
    if (ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
      );
      toast.success("Pedido cancelado");
    }
    setUpdatingId(null);
  }

  function copyShareLink() {
    if (!user) return;
    const link = `${window.location.origin}/shop/${user.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles");
  }

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Gestioná los pedidos de tus clientes"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMsgDialogOpen(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensaje al cliente
            </Button>
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
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
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Pendientes ({pendingOrders.length})
              </h2>
              <div className="space-y-3">
                {pendingOrders.map((order) => (
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
                              <Badge className={STATUS_CONFIG.pending.color}>
                                <Clock className="h-3 w-3 mr-1" />
                                {STATUS_CONFIG.pending.label}
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
                            <div key={i}>
                              <p>
                                {item.quantity}x {item.name} — ${(item.price * item.quantity).toLocaleString("es-AR")}
                              </p>
                              {item.variants && Object.keys(item.variants).length > 0 && (
                                <p className="text-xs text-muted-foreground ml-4">
                                  {Object.entries(item.variants).map(([key, value]) => `${key}: ${value}`).join(" | ")}
                                </p>
                              )}
                              {item.selectedExtras && item.selectedExtras.length > 0 && (
                                <p className="text-xs text-muted-foreground ml-4">
                                  Agregados: {item.selectedExtras.join(", ")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleString("es-AR")}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(order)}
                            disabled={updatingId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {updatingId === order.id ? "Procesando..." : "Confirmado"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePendiente(order)}
                            disabled={updatingId === order.id}
                          >
                            Pendiente
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendConfirmation(order)}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Enviar confirmación
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(order.id)}
                            disabled={updatingId === order.id}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Orders */}
          {confirmedOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Completados ({confirmedOrders.length})
              </h2>
              <div className="space-y-2">
                {confirmedOrders.map((order) => (
                  <Card key={order.id} className="border-border opacity-70">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={STATUS_CONFIG.confirmed.color}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG.confirmed.label}
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
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Orders */}
          {cancelledOrders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Cancelados ({cancelledOrders.length})
              </h2>
              <div className="space-y-2">
                {cancelledOrders.map((order) => (
                  <Card key={order.id} className="border-border opacity-50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={STATUS_CONFIG.cancelled.color}>
                          <XCircle className="h-3 w-3 mr-1" />
                          {STATUS_CONFIG.cancelled.label}
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
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Template Dialog */}
      <Dialog open={msgDialogOpen} onOpenChange={setMsgDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensaje al cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tiempo estimado (minutos)</Label>
              <Input
                type="number"
                min="1"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label>Plantilla del mensaje</Label>
              <Textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={5}
                placeholder="Escribí el mensaje..."
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Variables disponibles:</strong></p>
                <p>{"{cliente}"} — Nombre del cliente</p>
                <p>{"{pedido}"} — Número del pedido</p>
                <p>{"{tiempo}"} — Tiempo estimado (minutos)</p>
                <p>{"{total}"} — Total del pedido</p>
              </div>
            </div>
            <Button onClick={handleSaveMessage} className="w-full">
              Guardar mensaje
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
