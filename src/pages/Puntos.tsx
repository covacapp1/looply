import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Star, Plus, Minus, Users, Coins, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPointsSettings,
  savePointsSettings,
  getPointsCustomers,
  adjustCustomerPoints,
  type PointsSettings,
  type PointsCustomer,
} from "@/services/supabase";
import { toast } from "sonner";

const MIGRATION_HINT =
  "No se pudieron guardar los datos. Verificá que la migración SQL esté aplicada en Supabase.";

export default function PuntosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PointsSettings>({
    enabled: false,
    pesosPerPoint: 100,
  });
  const [pesosInput, setPesosInput] = useState("100");
  const [savingConfig, setSavingConfig] = useState(false);
  const [customers, setCustomers] = useState<PointsCustomer[]>([]);
  const [search, setSearch] = useState("");

  // Adjust dialog
  const [dialogCustomer, setDialogCustomer] = useState<PointsCustomer | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "redeem">("add");
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState("");
  const [savingPoints, setSavingPoints] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [s, c] = await Promise.all([
      getPointsSettings(user.id),
      getPointsCustomers(user.id),
    ]);
    setSettings(s);
    setPesosInput(String(s.pesosPerPoint));
    setCustomers(c);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggle(enabled: boolean) {
    if (!user) return;
    setSavingConfig(true);
    const next = { ...settings, enabled };
    const ok = await savePointsSettings(user.id, next);
    if (ok) {
      setSettings(next);
      toast.success(enabled ? "Sistema de puntos activado" : "Sistema de puntos desactivado");
    } else {
      toast.error(MIGRATION_HINT);
    }
    setSavingConfig(false);
  }

  async function handleSaveRatio() {
    if (!user) return;
    const value = parseInt(pesosInput);
    if (!value || value <= 0) {
      toast.error("Ingresá un número mayor a 0");
      return;
    }
    setSavingConfig(true);
    const next = { ...settings, pesosPerPoint: value };
    const ok = await savePointsSettings(user.id, next);
    if (ok) {
      setSettings(next);
      toast.success("Configuración guardada");
    } else {
      toast.error(MIGRATION_HINT);
    }
    setSavingConfig(false);
  }

  function openDialog(customer: PointsCustomer, mode: "add" | "redeem") {
    setDialogCustomer(customer);
    setDialogMode(mode);
    setAmount("1");
    setNote("");
  }

  async function handleAdjustPoints() {
    if (!user || !dialogCustomer) return;
    const qty = parseInt(amount);
    if (!qty || qty <= 0) {
      toast.error("Ingresá una cantidad mayor a 0");
      return;
    }
    if (dialogMode === "redeem" && qty > dialogCustomer.points) {
      toast.error("El cliente no tiene suficientes puntos");
      return;
    }

    setSavingPoints(true);
    const delta = dialogMode === "add" ? qty : -qty;
    const newTotal = await adjustCustomerPoints(
      dialogCustomer.id,
      delta,
      dialogMode === "add" ? "manual" : "redeem",
      user.id,
      note
    );

    if (newTotal === null) {
      toast.error(MIGRATION_HINT);
    } else {
      setCustomers((prev) =>
        prev.map((c) => (c.id === dialogCustomer.id ? { ...c, points: newTotal } : c))
      );
      toast.success(
        dialogMode === "add"
          ? `+${qty} puntos para ${dialogCustomer.name}`
          : `${qty} puntos canjeados de ${dialogCustomer.name}`
      );
      setDialogCustomer(null);
    }
    setSavingPoints(false);
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const customersWithPoints = customers.filter((c) => c.points > 0);
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Puntos"
        subtitle="Sumá puntos a tus clientes por cada compra"
      />

      {/* Config */}
      <Card className="border-border mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Sistema de puntos</p>
              <p className="text-xs text-muted-foreground">
                Activalo para que tus clientes empiecen a acumular puntos
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggle}
              disabled={savingConfig}
            />
          </div>

          {settings.enabled && (
            <div className="pt-3 border-t border-border flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Puntos por cada $</Label>
                <Input
                  type="number"
                  min="1"
                  value={pesosInput}
                  onChange={(e) => setPesosInput(e.target.value)}
                  className="w-28"
                />
              </div>
              <p className="text-xs text-muted-foreground pb-2">
                Ej: con 100, un pedido de $2.500 otorga 25 puntos
              </p>
              <Button
                size="sm"
                onClick={handleSaveRatio}
                disabled={savingConfig || String(settings.pesosPerPoint) === pesosInput}
                className="ml-auto"
              >
                {savingConfig ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!settings.enabled ? (
        /* Estado desactivado */
        <Card className="border-border">
          <CardContent className="p-10 text-center">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              El sistema de puntos está desactivado
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Activá el switch de arriba para que tus clientes ganen puntos con cada
              pedido confirmado y puedas sumarles puntos manualmente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Clientes con puntos</p>
                    <p className="text-lg font-bold text-foreground">
                      {customersWithPoints.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Puntos totales</p>
                    <p className="text-lg font-bold text-foreground">
                      {totalPoints.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold text-foreground">
                      1 punto cada ${settings.pesosPerPoint.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente por nombre o celular..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customers list */}
          {filteredCustomers.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-10 text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {customers.length === 0 ? "No hay clientes" : "Sin resultados"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {customers.length === 0
                    ? "Los clientes aparecerán cuando se registren desde tu link de tienda"
                    : "Probá con otro nombre o número de celular"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {customer.name.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      </div>
                      <Badge
                        variant={customer.points > 0 ? "default" : "outline"}
                        className="flex-shrink-0"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {customer.points} pts
                      </Badge>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Sumar puntos"
                          onClick={() => openDialog(customer, "add")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Restar puntos"
                          disabled={customer.points <= 0}
                          onClick={() => openDialog(customer, "redeem")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adjust dialog */}
      <Dialog open={!!dialogCustomer} onOpenChange={() => setDialogCustomer(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add" ? "Sumar puntos" : "Restar puntos"}
            </DialogTitle>
          </DialogHeader>
          {dialogCustomer && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground">
                  {dialogCustomer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Puntos actuales: {dialogCustomer.points}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Cantidad de puntos</Label>
                <Input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nota (opcional)</Label>
                <Input
                  placeholder="Ej: Compra de $2.500"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogCustomer(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAdjustPoints}
                  disabled={savingPoints}
                >
                  {savingPoints ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
