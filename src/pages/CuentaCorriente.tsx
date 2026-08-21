import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Receipt, Clock, CheckCircle2, Trash2, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCuentaCorriente, payCuentaCorriente, deleteCuentaCorriente, createSale } from "@/services/supabase";
import type { CuentaCorriente } from "@/types";
import { toast } from "sonner";

export default function CuentaCorrientePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CuentaCorriente[]>([]);
  const [loading, setLoading] = useState(true);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CuentaCorriente | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    const data = await getCuentaCorriente(user.id);
    setEntries(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function openPayDialog(entry: CuentaCorriente) {
    setSelectedEntry(entry);
    setPayAmount(entry.remaining.toString());
    setPayDialogOpen(true);
  }

  async function handlePay() {
    if (!selectedEntry || !payAmount || !user) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Ingresá un monto válido");
      return;
    }

    setProcessing(true);
    const ok = await payCuentaCorriente(selectedEntry.id, amount);

    if (ok) {
      if (amount >= selectedEntry.remaining) {
        toast.success("Deuda saldada completamente");
      } else {
        toast.success(`Pago de $${amount.toLocaleString("es-AR")} registrado`);
      }
      setPayDialogOpen(false);
      loadEntries();
    } else {
      toast.error("Error al procesar el pago");
    }
    setProcessing(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro de cuenta corriente?")) return;
    const ok = await deleteCuentaCorriente(id);
    if (ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Registro eliminado");
    }
  }

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  }

  const pendingEntries = entries.filter((e) => e.status === "pending");
  const paidEntries = entries.filter((e) => e.status === "paid");
  const totalPending = pendingEntries.reduce((sum, e) => sum + e.remaining, 0);

  return (
    <div>
      <PageHeader
        title="Cuenta Corriente"
        description="Deudas pendientes de tus clientes"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Receipt className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay deudas</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Cuando un cliente elija "Pendiente" en un pedido, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          {pendingEntries.length > 0 && (
            <Card className="border-border bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Total pendiente</p>
                    <p className="text-2xl font-bold text-amber-900">${totalPending.toLocaleString("es-AR")}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">
                    {pendingEntries.length} deuda{pendingEntries.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending */}
          {pendingEntries.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Pendientes ({pendingEntries.length})
              </h2>
              <div className="space-y-3">
                {pendingEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{entry.customerName}</p>
                            <p className="text-xs text-muted-foreground">{entry.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">
                              ${entry.remaining.toLocaleString("es-AR")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              de ${entry.total.toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Clock className="h-3 w-3" />
                          <span>Hace {getTimeAgo(entry.createdAt)}</span>
                          {entry.paid > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              Pagado: ${entry.paid.toLocaleString("es-AR")}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openPayDialog(entry)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <DollarSign className="h-3.5 w-3.5 mr-1" />
                            Pagado
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Paid */}
          {paidEntries.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Saldadas ({paidEntries.length})
              </h2>
              <div className="space-y-2">
                {paidEntries.map((entry) => (
                  <Card key={entry.id} className="border-border opacity-70">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Saldado
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{entry.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            ${entry.total.toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{selectedEntry.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  Debe: ${selectedEntry.remaining.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Monto a pagar</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedEntry.remaining}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Dejá el monto total para saldar completamente
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPayDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handlePay} className="flex-1" disabled={processing}>
                  {processing ? "Procesando..." : "Registrar Pago"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
