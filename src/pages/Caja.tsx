import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, TrendingUp, ShoppingCart, PlusCircle, DollarSign, Lock, Unlock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSalesByMerchant, getMenuItems, getOpenRegister, openRegister, closeRegister, getOrdersByMerchant } from "@/services/supabase";
import type { Sale, MenuItem, DailyRegister, Order } from "@/types";
import { toast } from "sonner";

export default function CajaPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [register, setRegister] = useState<DailyRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  // Open/Close form
  const [openingAmount, setOpeningAmount] = useState("");
  const [closingAmount, setClosingAmount] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    const [salesData, menuData, reg, ordersData] = await Promise.all([
      getSalesByMerchant(user.id),
      getMenuItems(user.id),
      getOpenRegister(user.id),
      getOrdersByMerchant(user.id),
    ]);
    setSales(salesData);
    setMenuItems(menuData);
    setRegister(reg);
    setOrders(ordersData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleOpenRegister() {
    if (!user || !openingAmount) return;
    const reg = await openRegister(user.id, parseFloat(openingAmount));
    if (reg) {
      setRegister(reg);
      setOpenDialogOpen(false);
      setOpeningAmount("");
      toast.success("Caja abierta");
    }
  }

  async function handleCloseRegister() {
    if (!register) return;
    const totalVentas = sales
      .filter((s) => new Date(s.createdAt) >= register.openedAt)
      .reduce((sum, s) => sum + s.amount, 0);
    const expected = register.openingAmount + totalVentas;
    const ok = await closeRegister(register.id, parseFloat(closingAmount || expected.toString()));
    if (ok) {
      setRegister(null);
      setCloseDialogOpen(false);
      setClosingAmount("");
      toast.success("Caja cerrada");
      loadData();
    }
  }

  // Calculate stats
  const todaySales = register
    ? sales.filter((s) => new Date(s.createdAt) >= register.openedAt)
    : sales.filter((s) => new Date(s.createdAt).toDateString() === new Date().toDateString());

  const todayOrders = register
    ? orders.filter((o) => new Date(o.createdAt) >= register.openedAt && o.status === "confirmed")
    : orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status === "confirmed");

  const totalVentas = todaySales.reduce((sum, s) => sum + s.amount, 0);

  // Calculate cost from order items matched to menu items
  let totalCost = 0;
  for (const order of todayOrders) {
    for (const item of order.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      const unitCost = menuItem?.cost || 0;
      let variantCost = 0;
      if (item.variantPrices && item.variants) {
        for (const [variantName, options] of Object.entries(item.variants)) {
          for (const [optionName, qty] of Object.entries(options)) {
            const option = menuItem?.variants
              ?.find((v) => v.name === variantName)
              ?.options.find((o) => o.name === optionName);
            if (option) variantCost += option.cost * qty;
          }
        }
      }
      totalCost += (unitCost + variantCost) * item.quantity;
    }
  }

  // Manual sales cost (custom sales have no cost)
  const manualSalesTotal = todaySales
    .filter((s) => s.type === "manual")
    .reduce((sum, s) => sum + s.amount, 0);

  const beneficio = totalVentas - totalCost;
  const pedidosCount = todayOrders.length;
  const ventasCount = todaySales.length;

  return (
    <div>
      <PageHeader
        title="Caja"
        description={register ? `Abierta - Monto inicial: $${register.openingAmount.toLocaleString("es-AR")}` : "Caja cerrada"}
        actions={
          <div className="flex gap-2">
            {!register ? (
              <Button size="sm" onClick={() => setOpenDialogOpen(true)}>
                <Unlock className="h-4 w-4 mr-2" />
                Abrir Caja
              </Button>
            ) : (
              <>
                <Button size="sm" variant="destructive" onClick={() => setCloseDialogOpen(true)}>
                  <Lock className="h-4 w-4 mr-2" />
                  Cerrar Caja
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-foreground">${totalVentas.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pedidos</p>
                <p className="text-lg font-bold text-foreground">{pedidosCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ventas</p>
                <p className="text-lg font-bold text-foreground">{ventasCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Beneficio</p>
                <p className="text-lg font-bold text-foreground">${beneficio.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost detail */}
      <Card className="border-border mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Costo</span>
              <span className="text-sm font-bold text-foreground">${totalCost.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Efectivo</span>
              <span className="text-sm font-bold text-foreground">${totalVentas.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !register ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Caja cerrada</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Abrí la caja con un monto inicial para empezar a registrar ventas
          </p>
          <Button onClick={() => setOpenDialogOpen(true)}>
            <Unlock className="h-4 w-4 mr-2" />
            Abrir Caja
          </Button>
        </div>
      ) : todaySales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Wallet className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sin ventas esta sesión</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Registrá ventas desde "Cargar Venta" en el menú principal, o los pedidos del link se registran automáticamente
          </p>
          <Button onClick={() => window.location.href = "/cargar-venta"}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Cargar Venta
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Ventas de esta Sesión
          </h2>
          <div className="space-y-2">
            {todaySales.map((sale) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-border">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        sale.type === "order" ? "bg-violet-100" : "bg-amber-100"
                      }`}>
                        {sale.type === "order" ? (
                          <ShoppingCart className="h-4 w-4 text-violet-600" />
                        ) : (
                          <Wallet className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{sale.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        ${sale.amount.toLocaleString("es-AR")}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {sale.type === "order" ? "Pedido" : "Manual"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Open Register Dialog */}
      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Monto inicial ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Plata que tenés en la caja al abrir</p>
            </div>
            <Button className="w-full" onClick={handleOpenRegister} disabled={!openingAmount}>
              Abrir Caja
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Register Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {register && (
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto inicial:</span>
                  <span className="font-medium">${register.openingAmount.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total ventas:</span>
                  <span className="font-medium">${totalVentas.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border pt-2">
                  <span>Esperado en caja:</span>
                  <span>${(register.openingAmount + totalVentas).toLocaleString("es-AR")}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Monto en caja ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Contá el dinero y escribí el monto"
                value={closingAmount}
                onChange={(e) => setClosingAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" variant="destructive" onClick={handleCloseRegister}>
              Cerrar Caja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
