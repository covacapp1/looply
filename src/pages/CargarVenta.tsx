import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, DollarSign, CreditCard, Smartphone, Truck, QrCode, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMenuItems, createSale, getOpenRegister } from "@/services/supabase";
import type { MenuItem, ProductVariant } from "@/types";
import { toast } from "sonner";

const paymentMethods = [
  { id: "efectivo", label: "Efectivo", icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
  { id: "debito", label: "Débito", icon: CreditCard, color: "bg-blue-100 text-blue-600" },
  { id: "credito", label: "Crédito", icon: CreditCard, color: "bg-violet-100 text-violet-600" },
  { id: "transferencia", label: "Transferencia", icon: Smartphone, color: "bg-amber-100 text-amber-600" },
  { id: "qr", label: "QR", icon: QrCode, color: "bg-cyan-100 text-cyan-600" },
  { id: "delivery", label: "Delivery", icon: Truck, color: "bg-rose-100 text-rose-600" },
];

export default function CargarVentaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasRegister, setHasRegister] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  // Selection
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});
  const [qty, setQty] = useState("1");
  const [customAmount, setCustomAmount] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    const [menuData, reg] = await Promise.all([
      getMenuItems(user.id),
      getOpenRegister(user.id),
    ]);
    setMenuItems(menuData);
    setHasRegister(!!reg);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleProductSelect(productId: string) {
    setSelectedProduct(productId);
    setSelectedVariants({});
    setVariantPrices({});
    setQty("1");
    if (productId === "custom") {
      setCustomAmount("");
      setCustomDesc("");
    } else {
      const item = menuItems.find((m) => m.id === productId);
      if (item) {
        setCustomAmount(item.price.toString());
        setCustomDesc(item.name);
      }
    }
  }

  function getTotal(): number {
    if (selectedProduct === "custom") {
      return parseFloat(customAmount) || 0;
    }
    const item = menuItems.find((m) => m.id === selectedProduct);
    if (!item) return 0;
    const variantTotal = Object.values(variantPrices).reduce((sum, p) => sum + p, 0);
    const quantity = parseInt(qty) || 1;
    return (item.price + variantTotal) * quantity;
  }

  async function handleSave() {
    if (!user || !hasRegister) return;
    const total = getTotal();
    if (total <= 0) return;
    setSaving(true);

    const desc = selectedProduct === "custom"
      ? (customDesc.trim() || "Venta manual")
      : `${customDesc} x${qty}${Object.keys(selectedVariants).length > 0 ? " (" + Object.values(selectedVariants).join(", ") + ")" : ""}`;

    const sale = await createSale({
      merchantId: user.id,
      amount: total,
      description: desc,
      type: "manual",
    });

    if (sale) {
      toast.success("Venta registrada");
      setSelectedProduct("");
      setSelectedVariants({});
      setVariantPrices({});
      setQty("1");
      setCustomAmount("");
      setCustomDesc("");
      setPaymentMethod("");
      setSearch("");
      loadData();
    }
    setSaving(false);
  }

  const total = getTotal();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargar Venta"
        subtitle="Registrá una venta manual"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/caja")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        }
      />

      {!hasRegister && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700 font-medium">
              Abrí la caja primero desde Caja para poder registrar ventas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleProductSelect(item.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedProduct === item.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary shadow-sm"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-lg object-cover mb-2" />
              )}
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-primary font-bold">
                {item.variants && item.variants.length > 0
                  ? `Desde $${item.price.toLocaleString("es-AR")}`
                  : `$${item.price.toLocaleString("es-AR")}`}
              </p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleProductSelect("custom")}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedProduct === "custom"
                ? "border-primary bg-primary/5 ring-2 ring-primary shadow-sm"
                : "border-border hover:border-primary/30 border-dashed"
            }`}
          >
            <p className="text-sm font-medium text-muted-foreground">Otro / Personalizado</p>
          </button>
        </div>
      )}

      {/* Variant selection + quantity + payment */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Variants */}
          {selectedProduct !== "custom" && (() => {
            const item = menuItems.find((m) => m.id === selectedProduct);
            if (!item || !item.variants || item.variants.length === 0) return null;
            return (
              <div className="space-y-3">
                {item.variants.map((variant: ProductVariant) => (
                  <div key={variant.name}>
                    <Label className="text-xs text-muted-foreground mb-1.5">{variant.name}</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {variant.options.map((option) => {
                        const isSelected = selectedVariants[variant.name] === option.name;
                        const priceLabel = option.price > 0 ? ` +$${option.price.toLocaleString("es-AR")}` : "";
                        return (
                          <button
                            key={option.name}
                            type="button"
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                            onClick={() => {
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [variant.name]: option.name,
                              }));
                              setVariantPrices((prev) => ({
                                ...prev,
                                [variant.name]: option.price,
                              }));
                            }}
                          >
                            {option.name}{priceLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Quantity */}
          {selectedProduct !== "custom" && (
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-24"
              />
            </div>
          )}

          {/* Custom fields */}
          {selectedProduct === "custom" && (
            <>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Ej: Venta en efectivo, propina, etc."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
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
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      paymentMethod === method.id
                        ? "border-primary ring-2 ring-primary shadow-sm"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${method.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total + Save */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>
              {paymentMethod && (
                <Badge variant="outline" className="w-fit">
                  {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                </Badge>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSave}
                disabled={saving || total <= 0 || !hasRegister}
              >
                {saving ? "Guardando..." : "Cargar Venta"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
