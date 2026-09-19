import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, DollarSign, CreditCard, Smartphone, Truck, QrCode, ArrowLeft, Plus, Minus, X, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMenuItems, createSale, getOpenRegister } from "@/services/supabase";
import type { MenuItem, ProductVariant } from "@/types";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  productName: string;
  variants: Record<string, Record<string, number>>;
  qty: number;
}

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

  // Active product (being configured before adding to cart)
  const [activeProductId, setActiveProductId] = useState<string>("");
  const [activeVariants, setActiveVariants] = useState<Record<string, Record<string, number>>>({});
  const [activeQty, setActiveQty] = useState("1");

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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
    setActiveProductId(productId);
    setActiveVariants({});
    setActiveQty("1");
  }

  function toggleVariantOption(variantName: string, optionName: string) {
    setActiveVariants((prev) => {
      const group = prev[variantName] || {};
      const currentQty = group[optionName] || 0;
      const newGroup = { ...group };
      if (currentQty > 0) {
        delete newGroup[optionName];
      } else {
        newGroup[optionName] = 1;
      }
      const next = { ...prev };
      if (Object.keys(newGroup).length === 0) {
        delete next[variantName];
      } else {
        next[variantName] = newGroup;
      }
      return next;
    });
  }

  function setVariantOptionQty(variantName: string, optionName: string, newQty: number) {
    setActiveVariants((prev) => {
      const group = prev[variantName] || {};
      const newGroup = { ...group };
      if (newQty <= 0) {
        delete newGroup[optionName];
      } else {
        newGroup[optionName] = newQty;
      }
      const next = { ...prev };
      if (Object.keys(newGroup).length === 0) {
        delete next[variantName];
      } else {
        next[variantName] = newGroup;
      }
      return next;
    });
  }

  function addToCart() {
    const item = menuItems.find((m) => m.id === activeProductId);
    if (!item) return;
    const quantity = parseInt(activeQty) || 1;
    setCartItems((prev) => [
      ...prev,
      {
        productId: item.id,
        productName: item.name,
        variants: { ...activeVariants },
        qty: quantity,
      },
    ]);
    setActiveProductId("");
    setActiveVariants({});
    setActiveQty("1");
  }

  function removeFromCart(index: number) {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCartItemQty(index: number, newQty: number) {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, qty: newQty } : item))
    );
  }

  function getCartItemVariantSummary(item: CartItem): string {
    const parts: string[] = [];
    for (const [, options] of Object.entries(item.variants)) {
      for (const [optionName, optQty] of Object.entries(options)) {
        parts.push(`${optionName}${optQty > 1 ? ` x${optQty}` : ""}`);
      }
    }
    return parts.join(", ");
  }

  function getCartItemUnitPrice(item: CartItem): number {
    const menuItem = menuItems.find((m) => m.id === item.productId);
    if (!menuItem) return 0;
    let variantTotal = 0;
    for (const [variantName, options] of Object.entries(item.variants)) {
      const variant = menuItem.variants?.find((v) => v.name === variantName);
      if (!variant) continue;
      for (const [optionName, optQty] of Object.entries(options)) {
        const option = variant.options.find((o) => o.name === optionName);
        if (option) {
          variantTotal += option.price * optQty;
        }
      }
    }
    return menuItem.price + variantTotal;
  }

  function getCartTotal(): number {
    return cartItems.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.qty, 0);
  }

  function getCartDescription(): string {
    return cartItems
      .map((item) => {
        const variantSummary = getCartItemVariantSummary(item);
        return `${item.productName} x${item.qty}${variantSummary ? ` (${variantSummary})` : ""}`;
      })
      .join(", ");
  }

  async function handleSave() {
    if (!user || !hasRegister) return;
    const total = getCartTotal();
    if (total <= 0) return;
    setSaving(true);

    const desc = getCartDescription();

    const sale = await createSale({
      merchantId: user.id,
      amount: total,
      description: desc,
      type: "manual",
      paymentMethod: paymentMethod || "manual",
    });

    if (sale) {
      toast.success("Venta registrada");
      setCartItems([]);
      setActiveProductId("");
      setActiveVariants({});
      setActiveQty("1");
      setPaymentMethod("");
      setSearch("");
      loadData();
    }
    setSaving(false);
  }

  const total = getCartTotal();
  const activeItem = menuItems.find((m) => m.id === activeProductId);

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
                activeProductId === item.id
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
        </div>
      )}

      {/* Active product: variant selection + quantity + add to cart */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{activeItem.name}</h3>
              <button
                type="button"
                onClick={() => { setActiveProductId(""); setActiveVariants({}); setActiveQty("1"); }}
                className="h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Variants */}
            {activeItem.variants && activeItem.variants.length > 0 && (
              <div className="space-y-3">
                {activeItem.variants.map((variant: ProductVariant) => {
                  const selectedGroup = activeVariants[variant.name] || {};
                  return (
                    <div key={variant.name}>
                      <Label className="text-xs text-muted-foreground mb-1.5">{variant.name}</Label>
                      <div className="space-y-1.5">
                        {variant.options.map((option) => {
                          const optQty = selectedGroup[option.name] || 0;
                          const isSelected = optQty > 0;
                          const priceLabel = option.price > 0 ? ` +$${option.price.toLocaleString("es-AR")}` : "";
                          return (
                            <div
                              key={option.name}
                              className={`flex items-center justify-between rounded-xl px-3 py-2 transition-colors ${
                                isSelected
                                  ? "bg-primary/10 border border-primary/30"
                                  : "bg-muted/50 border border-transparent"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{option.name}</p>
                                {option.price > 0 && (
                                  <p className="text-xs text-primary font-medium">{priceLabel}</p>
                                )}
                              </div>
                              {!isSelected ? (
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
                                  onClick={() => toggleVariantOption(variant.name, option.name)}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              ) : (
                                <div className="flex items-center gap-1 bg-primary rounded-full flex-shrink-0">
                                  <button
                                    type="button"
                                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground"
                                    onClick={() => setVariantOptionQty(variant.name, option.name, optQty - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-primary-foreground">{optQty}</span>
                                  <button
                                    type="button"
                                    className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground"
                                    onClick={() => setVariantOptionQty(variant.name, option.name, optQty + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={activeQty}
                  onChange={(e) => setActiveQty(e.target.value)}
                  className="w-20"
                />
              </div>
              <div className="flex-1 flex items-end">
                <Button onClick={addToCart} className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart items */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Carrito ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
            </h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {cartItems.map((item, index) => {
                const unitPrice = getCartItemUnitPrice(item);
                const variantSummary = getCartItemVariantSummary(item);
                return (
                  <motion.div
                    key={`${item.productId}-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-border rounded-xl p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        {variantSummary && (
                          <p className="text-xs text-muted-foreground">{variantSummary}</p>
                        )}
                        <p className="text-xs text-primary font-medium mt-1">
                          ${unitPrice.toLocaleString("es-AR")} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-muted rounded-full">
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted/80 text-foreground"
                            onClick={() => updateCartItemQty(index, item.qty - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-foreground">{item.qty}</span>
                          <button
                            type="button"
                            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted/80 text-foreground"
                            onClick={() => updateCartItemQty(index, item.qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="h-7 w-7 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <span className="text-sm font-bold text-foreground">
                        ${(unitPrice * item.qty).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Payment + Total + Save (always visible when cart has items) */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
