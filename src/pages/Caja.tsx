import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, TrendingUp, ShoppingCart, PlusCircle, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSalesByMerchant, createSale, getMenuItems } from "@/services/supabase";
import type { Sale, MenuItem } from "@/types";
import { toast } from "sonner";

export default function CajaPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Manual sale form
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [manualQty, setManualQty] = useState("1");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [salesData, menuData] = await Promise.all([
      getSalesByMerchant(user.id),
      getMenuItems(user.id),
    ]);
    setSales(salesData);
    setMenuItems(menuData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleProductSelect(productId: string) {
    setSelectedProduct(productId);
    if (productId === "custom") {
      setManualAmount("");
      setManualDesc("");
      setManualQty("1");
    } else {
      const item = menuItems.find((m) => m.id === productId);
      if (item) {
        setManualAmount(item.price.toString());
        setManualDesc(item.name);
        setManualQty("1");
      }
    }
  }

  function updateTotal() {
    if (selectedProduct && selectedProduct !== "custom") {
      const item = menuItems.find((m) => m.id === selectedProduct);
      if (item) {
        const qty = parseInt(manualQty) || 1;
        setManualAmount((item.price * qty).toString());
      }
    }
  }

  useEffect(() => {
    updateTotal();
  }, [manualQty, selectedProduct]);

  async function handleManualSale() {
    if (!user || !manualAmount || parseFloat(manualAmount) <= 0) return;
    setSaving(true);

    const sale = await createSale({
      merchantId: user.id,
      amount: parseFloat(manualAmount),
      description: manualDesc.trim() || "Venta manual",
      type: "manual",
    });

    if (sale) {
      setSales((prev) => [sale, ...prev]);
      setSelectedProduct("");
      setManualAmount("");
      setManualDesc("");
      setManualQty("1");
      setDialogOpen(false);
      toast.success("Venta registrada");
    }
    setSaving(false);
  }

  // Calculate stats
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const today = new Date().toDateString();
  const todaySales = sales
    .filter((s) => new Date(s.createdAt).toDateString() === today)
    .reduce((sum, s) => sum + s.amount, 0);
  const orderSales = sales.filter((s) => s.type === "order").length;
  const manualSales = sales.filter((s) => s.type === "manual").length;

  return (
    <div>
      <PageHeader
        title="Caja"
        description="Seguimiento de ventas"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Carga Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cargar Venta Manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleProductSelect(item.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedProduct === item.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded object-cover mb-1" />
                        )}
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-primary font-bold">${item.price.toLocaleString("es-AR")}</p>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleProductSelect("custom")}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedProduct === "custom"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/30 border-dashed"
                      }`}
                    >
                      <p className="text-sm font-medium text-muted-foreground">Otro / Personalizado</p>
                    </button>
                  </div>
                </div>

                {selectedProduct && selectedProduct !== "custom" && (
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={manualQty}
                      onChange={(e) => setManualQty(e.target.value)}
                    />
                  </div>
                )}

                {selectedProduct === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        placeholder="Ej: Venta en efectivo, propina, etc."
                        value={manualDesc}
                        onChange={(e) => setManualDesc(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monto ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {selectedProduct && selectedProduct !== "custom" && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">
                      ${parseFloat(manualAmount || "0").toLocaleString("es-AR")}
                    </span>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleManualSale}
                  disabled={saving || !manualAmount || parseFloat(manualAmount) <= 0 || !selectedProduct}
                >
                  {saving ? "Guardando..." : "Registrar Venta"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                <p className="text-lg font-bold text-foreground">${totalSales.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hoy</p>
                <p className="text-lg font-bold text-foreground">${todaySales.toLocaleString("es-AR")}</p>
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
                <p className="text-lg font-bold text-foreground">{orderSales}</p>
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
                <p className="text-xs text-muted-foreground">Manuales</p>
                <p className="text-lg font-bold text-foreground">{manualSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Wallet className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Sin ventas registradas</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Las ventas de pedidos se registran automáticamente. También podés cargar ventas manuales.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Cargar Venta Manual
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Ventas Recientes
          </h2>
          <div className="space-y-2">
            {sales.map((sale) => (
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
                        +${sale.amount.toLocaleString("es-AR")}
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
    </div>
  );
}
