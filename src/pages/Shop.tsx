import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Phone, User, MapPin, StickyNote, Send, Store, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { findShopCustomer, createShopCustomer, getMenuItems, createOrder, createSale, getBusinessSettings } from "@/services/supabase";
import type { MenuItem, ShopCustomer, ProductVariant } from "@/types";

type ViewState = "phone" | "register" | "menu" | "cart" | "order-sent";

interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedVariants: Record<string, Record<string, number>>;
  variantPrices: Record<string, Record<string, number>>;
}

export default function ShopPage() {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [view, setView] = useState<ViewState>("phone");
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<ShopCustomer | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("22:00");

  // Variant selection state (multi-select per variant group)
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Record<string, number>>>({});

  // Registration form
  const [regName, setRegName] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regNotes, setRegNotes] = useState("");

  // Cart notes
  const [cartNotes, setCartNotes] = useState("");

  useEffect(() => {
    if (merchantId) {
      getMenuItems(merchantId).then(setMenuItems);
      getBusinessSettings(merchantId).then((settings) => {
        setOpenTime(settings.openTime || "09:00");
        setCloseTime(settings.closeTime || "22:00");
        checkIfOpen(settings.openTime || "09:00", settings.closeTime || "22:00");
      });
    }
  }, [merchantId]);

  function checkIfOpen(open: string, close: string) {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = open.split(":").map(Number);
    const [closeH, closeM] = close.split(":").map(Number);
    setIsOpen(current >= openH * 60 + openM && current < closeH * 60 + closeM);
  }

  async function handlePhoneSubmit() {
    if (!phone.trim() || !merchantId) return;
    setLoading(true);
    setError("");
    const existing = await findShopCustomer(merchantId, phone.trim());
    if (existing) {
      setCustomer(existing);
      setView("menu");
    } else {
      setView("register");
    }
    setLoading(false);
  }

  async function handleRegister() {
    if (!regName.trim() || !merchantId) return;
    setLoading(true);
    setError("");
    const newCustomer = await createShopCustomer({
      merchantId,
      phone: phone.trim(),
      name: regName.trim(),
      address: regAddress.trim(),
      notes: regNotes.trim(),
    });
    if (newCustomer) {
      setCustomer(newCustomer);
      setView("menu");
    } else {
      setError("Error al registrar. Intentá de nuevo.");
    }
    setLoading(false);
  }

  function toggleVariantOption(variantName: string, optionName: string, optionPrice: number) {
    setSelectedVariants((prev) => {
      const group = prev[variantName] || {};
      const currentQty = group[optionName] || 0;
      const newGroup = { ...group };
      if (currentQty > 0) {
        delete newGroup[optionName];
      } else {
        newGroup[optionName] = 1;
      }
      return { ...prev, [variantName]: newGroup };
    });
  }

  function setVariantOptionQty(variantName: string, optionName: string, qty: number) {
    setSelectedVariants((prev) => {
      const group = prev[variantName] || {};
      const newGroup = { ...group };
      if (qty <= 0) {
        delete newGroup[optionName];
      } else {
        newGroup[optionName] = qty;
      }
      if (Object.keys(newGroup).length === 0) {
        const next = { ...prev };
        delete next[variantName];
        return next;
      }
      return { ...prev, [variantName]: newGroup };
    });
  }

  function getItemVariantPrices(item: MenuItem): Record<string, Record<string, number>> {
    const prices: Record<string, Record<string, number>> = {};
    if (!item.variants) return prices;
    for (const v of item.variants) {
      prices[v.name] = {};
      for (const o of v.options) {
        prices[v.name][o.name] = o.price;
      }
    }
    return prices;
  }

  function addToCart(item: MenuItem) {
    const hasVariants = item.variants && item.variants.length > 0;
    const variants = hasVariants ? selectedVariants : {};
    const prices = hasVariants ? getItemVariantPrices(item) : {};

    setCart((prev) => {
      const key = `${item.id}-${JSON.stringify(variants)}`;
      const existing = prev.find((c) => {
        const cKey = `${c.item.id}-${JSON.stringify(c.selectedVariants)}`;
        return cKey === key;
      });
      if (existing) {
        return prev.map((c) => {
          const cKey = `${c.item.id}-${JSON.stringify(c.selectedVariants)}`;
          return cKey === key ? { ...c, quantity: c.quantity + 1 } : c;
        });
      }
      return [...prev, { item, quantity: 1, selectedVariants: variants, variantPrices: prices }];
    });
    setSelectedVariants({});
    setExpandedItem(null);
  }

  function removeFromCart(index: number) {
    setCart((prev) => {
      const existing = prev[index];
      if (existing && existing.quantity > 1) {
        return prev.map((c, i) => i === index ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function getCartTotal() {
    return cart.reduce((sum, c) => {
      let variantTotal = 0;
      for (const [variantName, options] of Object.entries(c.variantPrices)) {
        const selected = c.selectedVariants[variantName] || {};
        for (const [optionName, price] of Object.entries(options)) {
          const qty = selected[optionName] || 0;
          variantTotal += price * qty;
        }
      }
      return sum + (c.item.price + variantTotal) * c.quantity;
    }, 0);
  }

  function getCartItemCount() {
    return cart.reduce((sum, c) => sum + c.quantity, 0);
  }

  function getItemCartCount(itemId: string) {
    return cart
      .filter((c) => c.item.id === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  }

  async function handlePlaceOrder() {
    if (!merchantId || !customer || cart.length === 0) return;
    setLoading(true);

    const order = await createOrder({
      merchantId,
      customerId: customer.id,
      items: cart.map((c) => ({
        menuItemId: c.item.id,
        name: c.item.name,
        price: c.item.price,
        quantity: c.quantity,
        variants: c.selectedVariants,
        variantPrices: c.variantPrices,
      })),
      total: getCartTotal(),
      notes: cartNotes.trim() || undefined,
    });

    if (order) {
      await createSale({
        merchantId,
        orderId: order.id,
        amount: order.total,
        description: `Pedido de ${customer.name}`,
        type: "order",
      });
      setCart([]);
      setCartNotes("");
      setView("order-sent");
    }
    setLoading(false);
  }

  // LOCAL CERRADO
  if (!isOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4 mx-auto">
            <Store className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Local Cerrado</h1>
          <p className="text-muted-foreground mb-4">Nuestro horario de atención es:</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border shadow-sm">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{openTime} — {closeTime}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-6">Volvé dentro de nuestro horario de atención</p>
        </motion.div>
      </div>
    );
  }

  // PHONE VIEW
  if (view === "phone") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido</h1>
            <p className="text-muted-foreground text-center mt-1">Ingresá tu número de WhatsApp para continuar</p>
          </div>
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input id="phone" type="tel" placeholder="Ej: 11 1234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={handlePhoneSubmit} disabled={loading || !phone.trim()}>
                {loading ? "Buscando..." : "Continuar"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // REGISTER VIEW
  if (view === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Registrarse</h1>
            <p className="text-muted-foreground text-center mt-1">Completá tus datos por única vez</p>
          </div>
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Nombre completo *</Label>
                <Input id="reg-name" placeholder="Tu nombre" value={regName} onChange={(e) => setRegName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={phone} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-address">Dirección</Label>
                <Input id="reg-address" placeholder="Calle, número, piso" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-notes">Aclaraciones</Label>
                <Textarea id="reg-notes" placeholder="Torre, departamento, código, etc." value={regNotes} onChange={(e) => setRegNotes(e.target.value)} rows={2} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" onClick={handleRegister} disabled={loading || !regName.trim()}>
                {loading ? "Registrando..." : "Ver Menú"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ORDER SENT VIEW
  if (view === "order-sent") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center">
          <div className="flex flex-col items-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
              <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-6" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">¡Pedido Enviado!</h1>
            <p className="text-muted-foreground mb-6">Tu pedido está siendo preparado. Te notificaremos cuando esté listo.</p>
            <Button onClick={() => setView("menu")} variant="outline">Volver al Menú</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // MENU VIEW
  const categories = [...new Set(menuItems.map((m) => m.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Menú</h1>
            <p className="text-xs text-muted-foreground">{customer?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setView("cart")} className="relative">
            <ShoppingCart className="h-4 w-4" />
            {getCartItemCount() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {getCartItemCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {menuItems.length === 0 ? (
          <div className="text-center py-16">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay productos disponibles</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{category}</h2>
              <div className="space-y-2">
                {menuItems
                  .filter((m) => m.category === category && m.isAvailable)
                  .map((item) => {
                    const isExpanded = expandedItem === item.id;
                    const hasVariants = item.variants && item.variants.length > 0;
                    const currentVariants = selectedVariants;

                    return (
                      <Card key={item.id} className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{item.name}</p>
                              {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                              <p className="text-sm font-bold text-primary mt-1">
                                ${hasVariants
                                  ? Math.min(...item.variants!.flatMap((v) => v.options.map((o) => o.price))).toLocaleString("es-AR")
                                  : item.price.toLocaleString("es-AR")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasVariants && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setExpandedItem(isExpanded ? null : item.id);
                                    setSelectedVariants({});
                                  }}
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              )}
                              {!hasVariants && (
                                <button
                                  type="button"
                                  className={`h-8 min-w-[2rem] rounded-full flex items-center justify-center flex-shrink-0 gap-1 px-2 ${
                                    getItemCartCount(item.id) > 0
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-primary text-primary-foreground"
                                  }`}
                                  onClick={() => addToCart(item)}
                                >
                                  {getItemCartCount(item.id) > 0 ? (
                                    <>
                                      <span className="text-xs font-bold">{getItemCartCount(item.id)}</span>
                                      <Plus className="h-3.5 w-3.5" />
                                    </>
                                  ) : (
                                    <Plus className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Variant selectors - multi-select */}
                          {isExpanded && hasVariants && (
                            <div className="mt-3 pt-3 border-t border-border space-y-3">
                              {item.variants.map((variant: ProductVariant) => {
                                const selectedGroup = currentVariants[variant.name] || {};
                                return (
                                  <div key={variant.name}>
                                    <p className="text-xs font-medium text-muted-foreground mb-1.5">{variant.name}</p>
                                    <div className="space-y-1.5">
                                      {variant.options.map((option) => {
                                        const qty = selectedGroup[option.name] || 0;
                                        const isSelected = qty > 0;
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
                                                onClick={() => toggleVariantOption(variant.name, option.name, option.price)}
                                              >
                                                <Plus className="h-4 w-4" />
                                              </button>
                                            ) : (
                                              <div className="flex items-center gap-1 bg-primary rounded-full flex-shrink-0">
                                                <button
                                                  type="button"
                                                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground"
                                                  onClick={() => setVariantOptionQty(variant.name, option.name, qty - 1)}
                                                >
                                                  <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-bold text-primary-foreground">{qty}</span>
                                                <button
                                                  type="button"
                                                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/80 text-primary-foreground"
                                                  onClick={() => setVariantOptionQty(variant.name, option.name, qty + 1)}
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

                              <Button
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => addToCart(item)}
                                disabled={!item.variants.some((v: ProductVariant) => {
                                  const group = currentVariants[v.name] || {};
                                  return Object.keys(group).length > 0;
                                })}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart FAB */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
            <Button className="w-full h-14 text-lg shadow-lg" onClick={() => setView("cart")}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ver Carrito ({getCartItemCount()}) — ${getCartTotal().toLocaleString("es-AR")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART MODAL */}
      <AnimatePresence>
        {view === "cart" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setView("menu")}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Tu Pedido</h2>
                <Button variant="ghost" size="sm" onClick={() => setView("menu")}>Cerrar</Button>
              </div>

              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">El carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map((c, index) => (
                      <div key={`${c.item.id}-${index}`} className="flex items-center justify-between py-2 border-b border-border">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{c.item.name}</p>
                          {Object.keys(c.selectedVariants).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(c.selectedVariants).map(([variantName, options]) =>
                                Object.entries(options).map(([optionName, qty]) => {
                                  if (qty <= 0) return null;
                                  const price = c.variantPrices[variantName]?.[optionName] || 0;
                                  return (
                                    <Badge key={`${variantName}-${optionName}`} variant="secondary" className="text-[10px]">
                                      {optionName}{qty > 1 ? ` x${qty}` : ""}{price > 0 ? ` +$${price * qty}` : ""}
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">${c.item.price.toLocaleString("es-AR")} x {c.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => removeFromCart(index)}>
                            {c.quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                          </Button>
                          <span className="w-6 text-center text-sm font-bold">{c.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Detalle / Notas */}
                  <div className="mb-4">
                    <Label htmlFor="cart-notes" className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                      <StickyNote className="h-3.5 w-3.5" />
                      Detalle del pedido
                    </Label>
                    <Textarea
                      id="cart-notes"
                      placeholder="Ej: sin azúcar, extra hielo, sin picante..."
                      value={cartNotes}
                      onChange={(e) => setCartNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-border mb-4">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">${getCartTotal().toLocaleString("es-AR")}</span>
                  </div>

                  {customer?.address && (
                    <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.address}</span>
                    </div>
                  )}

                  <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Enviando..." : "Enviar Pedido"}
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
