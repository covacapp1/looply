import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ShoppingCart, Link, CreditCard, DollarSign, TrendingUp, Users, Calendar, Lock, Star, Warehouse, Eye, ArrowLeft, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByMerchant, getSalesByMerchant, getShopCustomers, getMenuItems, getClosedRegisters } from "@/services/supabase";
import { supabase } from "@/lib/supabase";
import type { Order, Sale, MenuItem, DailyRegister } from "@/types";

const tabs = [
  { id: "cajas", label: "Historial de cajas" },
  { id: "mes", label: "Ventas del mes" },
  { id: "anio", label: "Ventas por año" },
  { id: "cajeros", label: "Historial de cajeros" },
  { id: "ranking", label: "Ranking productos" },
  { id: "rentabilidad", label: "Rentabilidad" },
  { id: "depositos", label: "Locales" },
];

export default function StatisticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cajas");
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [registers, setRegisters] = useState<DailyRegister[]>([]);
  const [fidelidadCount, setFidelidadCount] = useState(0);
  const [clientesCount, setClientesCount] = useState(0);
  const [selectedRegister, setSelectedRegister] = useState<DailyRegister | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthFrom, setMonthFrom] = useState(1);
  const [monthTo, setMonthTo] = useState(12);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [ordersData, salesData, customersData, menuData, registersData] = await Promise.all([
      getOrdersByMerchant(user.id),
      getSalesByMerchant(user.id),
      getShopCustomers(user.id),
      getMenuItems(user.id),
      getClosedRegisters(user.id, 500),
    ]);
    const { count: fidelidad } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .or(`merchant_id.eq.${user.id},merchant_id.is.null`);
    setOrders(ordersData);
    setSales(salesData);
    setMenuItems(menuData);
    setRegisters(registersData);
    setFidelidadCount(fidelidad || 0);
    setClientesCount(customersData.length);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const menuItemsMap = useMemo(() => new Map(menuItems.map((m) => [m.id, m])), [menuItems]);

  // --- Historial de cajas ---
  const formatMonth = (key: string) => {
    const [y, m] = key.split("-");
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  };

  // --- Ventas del mes ---
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const monthlyOrders = useMemo(() => orders.filter((o) => {
    const d = new Date(o.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === currentMonth;
  }), [orders, currentMonth]);
  const monthlySales = useMemo(() => sales.filter((s) => {
    const d = new Date(s.createdAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === currentMonth;
  }), [sales, currentMonth]);
  const monthlyStats = useMemo(() => {
    let totalVentas = 0, totalCostos = 0;
    monthlyOrders.forEach((o) => {
      totalVentas += o.total;
      o.items.forEach((i) => { const mi = menuItemsMap.get(i.menuItemId); if (mi) totalCostos += mi.cost * i.quantity; });
    });
    monthlySales.forEach((s) => { totalVentas += s.amount; });
    return { ventas: totalVentas, costos: totalCostos, ganancia: totalVentas - totalCostos, pedidos: monthlyOrders.length + monthlySales.length };
  }, [monthlyOrders, monthlySales, menuItemsMap]);

  // --- Ventas por año ---
  const currentYear = new Date().getFullYear();
  const yearlyOrders = useMemo(() => orders.filter((o) => new Date(o.createdAt).getFullYear() === currentYear), [orders, currentYear]);
  const yearlySales = useMemo(() => sales.filter((s) => new Date(s.createdAt).getFullYear() === currentYear), [sales, currentYear]);
  const yearlyByMonth = useMemo(() => {
    const months: Record<string, { ventas: number; costos: number; pedidos: number }> = {};
    yearlyOrders.forEach((o) => {
      const key = new Date(o.createdAt).toLocaleDateString("es-AR", { month: "short" });
      if (!months[key]) months[key] = { ventas: 0, costos: 0, pedidos: 0 };
      months[key].ventas += o.total;
      months[key].pedidos++;
      o.items.forEach((i) => { const mi = menuItemsMap.get(i.menuItemId); if (mi) months[key].costos += mi.cost * i.quantity; });
    });
    yearlySales.forEach((s) => {
      const key = new Date(s.createdAt).toLocaleDateString("es-AR", { month: "short" });
      if (!months[key]) months[key] = { ventas: 0, costos: 0, pedidos: 0 };
      months[key].ventas += s.amount;
      months[key].pedidos++;
    });
    return months;
  }, [yearlyOrders, yearlySales, menuItemsMap]);

  // --- Ranking productos ---
  const productRanking = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((o) => o.items.forEach((i) => {
      const mi = menuItemsMap.get(i.menuItemId);
      if (!counts[i.menuItemId]) counts[i.menuItemId] = { name: mi?.name || "Desconocido", count: 0, revenue: 0 };
      counts[i.menuItemId].count += i.quantity;
      counts[i.menuItemId].revenue += i.price * i.quantity;
    }));
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [orders, menuItemsMap]);

  // --- Detalle de caja seleccionada ---
  const registerDetail = useMemo(() => {
    if (!selectedRegister) return null;
    const from = new Date(selectedRegister.openedAt);
    const to = selectedRegister.closedAt ? new Date(selectedRegister.closedAt) : new Date();
    const regSales = sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= from && d <= to;
    });
    const regOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= from && d <= to;
    });
    const total = regSales.reduce((sum, s) => sum + s.amount, 0) + regOrders.reduce((sum, o) => sum + o.total, 0);
    const paymentBreakdown: Record<string, number> = {};
    regSales.forEach((s) => {
      const method = s.paymentMethod || "manual";
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + s.amount;
    });
    regOrders.forEach((o) => {
      const method = o.paymentMethod || "order";
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + o.total;
    });
    const items: { name: string; qty: number; total: number }[] = [];
    regOrders.forEach((o) => o.items.forEach((i) => {
      const existing = items.find((x) => x.name === (menuItemsMap.get(i.menuItemId)?.name || i.name));
      if (existing) { existing.qty += i.quantity; existing.total += i.price * i.quantity; }
      else items.push({ name: menuItemsMap.get(i.menuItemId)?.name || i.name, qty: i.quantity, total: i.price * i.quantity });
    }));
    return { sales: regSales, orders: regOrders, total, paymentBreakdown, items: items.sort((a, b) => b.total - a.total) };
  }, [selectedRegister, sales, orders, menuItemsMap]);

  // --- Datos anuales por mes ---
  const yearData = useMemo(() => {
    const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const yearOrders = orders.filter((o) => new Date(o.createdAt).getFullYear() === selectedYear);
    const yearSales = sales.filter((s) => new Date(s.createdAt).getFullYear() === selectedYear);
    const totalYearVentas = yearOrders.reduce((s, o) => s + o.total, 0) + yearSales.reduce((s, sr) => s + sr.amount, 0);
    return months.map((name, idx) => {
      const monthOrders = yearOrders.filter((o) => new Date(o.createdAt).getMonth() === idx);
      const monthSalesList = yearSales.filter((s) => new Date(s.createdAt).getMonth() === idx);
      const ventas = monthOrders.reduce((s, o) => s + o.total, 0) + monthSalesList.reduce((s, sr) => s + sr.amount, 0);
      let costos = 0;
      monthOrders.forEach((o) => o.items.forEach((i) => { const mi = menuItemsMap.get(i.menuItemId); if (mi) costos += mi.cost * i.quantity; }));
      const beneficios = ventas - costos;
      const rentabilidad = ventas > 0 ? Math.round((beneficios / ventas) * 100) : 0;
      const pctAnio = totalYearVentas > 0 ? Math.round((ventas / totalYearVentas) * 100) : 0;
      return { name, month: idx, ventas, costos, beneficios, total: ventas, rentabilidad, pctAnio, orderCount: monthOrders.length, saleCount: monthSalesList.length };
    });
  }, [orders, sales, selectedYear, menuItemsMap]);

  const filteredYearData = yearData.filter((m) => m.month + 1 >= monthFrom && m.month + 1 <= monthTo);
  const totalPages = Math.ceil(filteredYearData.length / rowsPerPage);
  const pagedYearData = filteredYearData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const monthDetail = useMemo(() => {
    if (selectedMonthDetail === null) return null;
    const m = yearData[selectedMonthDetail];
    if (!m) return null;
    const monthOrders = orders.filter((o) => { const d = new Date(o.createdAt); return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthDetail; });
    const monthSalesList = sales.filter((s) => { const d = new Date(s.createdAt); return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthDetail; });
    const allItems: { date: string; name: string; qty: number; price: number; subtotal: number; payment: string }[] = [];
    monthOrders.forEach((o) => o.items.forEach((i) => {
      allItems.push({ date: new Date(o.createdAt).toLocaleDateString("es-AR"), name: menuItemsMap.get(i.menuItemId)?.name || i.name, qty: i.quantity, price: i.price, subtotal: i.price * i.quantity, payment: o.paymentMethod || "Pedido" });
    }));
    monthSalesList.forEach((s) => {
      allItems.push({ date: new Date(s.createdAt).toLocaleDateString("es-AR"), name: s.description, qty: 1, price: s.amount, subtotal: s.amount, payment: s.paymentMethod || "Manual" });
    });
    return { ...m, items: allItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) };
  }, [selectedMonthDetail, yearData, orders, sales, selectedYear, menuItemsMap]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Reportes" description="Estadísticas de tu negocio" />
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reportes" description="Estadísticas de tu negocio" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "cajas" && (
        <div>
          {selectedRegister && registerDetail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => setSelectedRegister(null)}
                  className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Caja del {new Date(selectedRegister.openedAt).toLocaleDateString("es-AR")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedRegister.openedAt).toLocaleTimeString("es-AR")} - {selectedRegister.closedAt ? new Date(selectedRegister.closedAt).toLocaleTimeString("es-AR") : "Abierta"}
                  </p>
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Apertura</p>
                  <p className="text-lg font-bold text-foreground">${selectedRegister.openingAmount.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Cierre</p>
                  <p className="text-lg font-bold text-foreground">${(selectedRegister.closingAmount || 0).toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Ingresos</p>
                  <p className="text-lg font-bold text-emerald-600">${registerDetail.total.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Movimientos</p>
                  <p className="text-lg font-bold text-foreground">{registerDetail.sales.length + registerDetail.orders.length}</p>
                </CardContent></Card>
              </div>

              {/* Desglose por método de pago */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ingresos por Método de Pago</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { key: "efectivo", label: "Efectivo", color: "text-emerald-600" },
                      { key: "transferencia", label: "Transferencia", color: "text-amber-600" },
                      { key: "debito", label: "Débito", color: "text-blue-600" },
                      { key: "credito", label: "Crédito", color: "text-violet-600" },
                      { key: "qr", label: "QR", color: "text-cyan-600" },
                      { key: "delivery", label: "Delivery", color: "text-rose-600" },
                    ].map((m) => (
                      <div key={m.key} className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                        <p className={`text-sm font-bold ${m.color}`}>
                          ${(registerDetail.paymentBreakdown[m.key] || 0).toLocaleString("es-AR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Productos vendidos */}
              {registerDetail.items.length > 0 && (
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Productos Vendidos</p>
                    <div className="space-y-2">
                      {registerDetail.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-5">#{idx + 1}</span>
                            <span className="text-sm text-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">x{item.qty}</span>
                            <span className="text-sm font-bold text-emerald-600">${item.total.toLocaleString("es-AR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Historial de Cajas</h2>
              {registers.length === 0 ? (
                <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground"><Lock className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No hay cajas cerradas</p></CardContent></Card>
              ) : (
                <div className="space-y-2">
                  {registers.map((reg) => (
                    <Card key={reg.id} className="border-border">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{new Date(reg.openedAt).toLocaleDateString("es-AR")}</p>
                            <p className="text-xs text-muted-foreground">Apertura: ${reg.openingAmount.toLocaleString("es-AR")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">${(reg.closingAmount || 0).toLocaleString("es-AR")}</p>
                            <Badge variant="outline" className="text-[10px]">Cerrada</Badge>
                          </div>
                          <button
                            onClick={() => setSelectedRegister(reg)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "mes" && (
        <div className="space-y-4">
          {selectedMonthDetail !== null && monthDetail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedMonthDetail(null)} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{monthDetail.name} {selectedYear}</h2>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Ventas</p>
                  <p className="text-lg font-bold text-foreground">{monthDetail.orderCount + monthDetail.saleCount}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-emerald-600">${monthDetail.ventas.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Costos</p>
                  <p className="text-lg font-bold text-red-600">${monthDetail.costos.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Beneficio</p>
                  <p className="text-lg font-bold text-primary">${monthDetail.beneficios.toLocaleString("es-AR")}</p>
                </CardContent></Card>
              </div>
              {monthDetail.items.length > 0 ? (
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Detalle de productos vendidos</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-xs text-muted-foreground">
                            <th className="pb-2 font-medium">Fecha</th>
                            <th className="pb-2 font-medium">Producto</th>
                            <th className="pb-2 font-medium text-center">Cant.</th>
                            <th className="pb-2 font-medium text-right">Precio</th>
                            <th className="pb-2 font-medium text-right">Subtotal</th>
                            <th className="pb-2 font-medium text-right">Pago</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthDetail.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-border last:border-0">
                              <td className="py-2 text-foreground">{item.date}</td>
                              <td className="py-2 text-foreground">{item.name}</td>
                              <td className="py-2 text-center text-foreground">{item.qty}</td>
                              <td className="py-2 text-right text-foreground">${item.price.toLocaleString("es-AR")}</td>
                              <td className="py-2 text-right font-medium text-foreground">${item.subtotal.toLocaleString("es-AR")}</td>
                              <td className="py-2 text-right"><Badge variant="outline" className="text-[10px] uppercase">{item.payment}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">Sin ventas este mes</CardContent></Card>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground">
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={monthFrom} onChange={(e) => { setMonthFrom(parseInt(e.target.value)); setCurrentPage(1); }} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground">
                  {["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"].map((m, i) => <option key={i} value={i + 1}>Desde {m}</option>)}
                </select>
                <select value={monthTo} onChange={(e) => { setMonthTo(parseInt(e.target.value)); setCurrentPage(1); }} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground">
                  {["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"].map((m, i) => <option key={i} value={i + 1}>Hasta {m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total ventas del año</p>
                  <p className="text-lg font-bold text-foreground">${yearData.reduce((s, m) => s + m.ventas, 0).toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Beneficio del año</p>
                  <p className="text-lg font-bold text-foreground">${yearData.reduce((s, m) => s + m.beneficios, 0).toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Rentabilidad promedio</p>
                  <p className="text-lg font-bold text-foreground">{yearData.length > 0 ? Math.round(yearData.reduce((s, m) => s + m.rentabilidad, 0) / yearData.length) : 0}%</p>
                </CardContent></Card>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Mes</th>
                      <th className="pb-2 font-medium text-right">Ventas</th>
                      <th className="pb-2 font-medium text-right">Costos</th>
                      <th className="pb-2 font-medium text-right">Beneficios</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      <th className="pb-2 font-medium text-right">Rentabilidad</th>
                      <th className="pb-2 font-medium text-right">% año</th>
                      <th className="pb-2 font-medium text-center">Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedYearData.map((m) => (
                      <tr key={m.month} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium text-foreground">{m.name}</td>
                        <td className="py-3 text-right text-foreground">{m.orderCount + m.saleCount}</td>
                        <td className="py-3 text-right text-red-600">${m.costos.toLocaleString("es-AR")}</td>
                        <td className="py-3 text-right text-emerald-600">${m.beneficios.toLocaleString("es-AR")}</td>
                        <td className="py-3 text-right font-bold text-foreground">${m.ventas.toLocaleString("es-AR")}</td>
                        <td className="py-3 text-right text-foreground">{m.rentabilidad}%</td>
                        <td className="py-3 text-right text-foreground">{m.pctAnio}%</td>
                        <td className="py-3 text-center">
                          <button onClick={() => setSelectedMonthDetail(m.month)} className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredYearData.length === 0 && (
                <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">No hay datos para este período</CardContent></Card>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Filas por página:</span>
                    <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 rounded border border-border bg-background text-foreground text-xs">
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50 hover:bg-muted transition-colors">Anterior</button>
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border border-border text-xs disabled:opacity-50 hover:bg-muted transition-colors">Siguiente</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "anio" && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ventas por Año ({currentYear})</h2>
          <div className="space-y-2">
            {Object.entries(yearlyByMonth).map(([month, data]) => (
              <Card key={month} className="border-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground capitalize">{month}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">{data.pedidos} pedidos</span>
                    <span className="font-bold text-emerald-600">${data.ventas.toLocaleString("es-AR")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {Object.keys(yearlyByMonth).length === 0 && (
              <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">No hay datos este año</CardContent></Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "cajeros" && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Historial de Cajeros</h2>
          <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Próximamente: historial de ventas por cajero</p>
          </CardContent></Card>
        </div>
      )}

      {activeTab === "ranking" && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ranking de Productos</h2>
          {productRanking.length === 0 ? (
            <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" /><p>No hay ventas registradas</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {productRanking.map((item, idx) => (
                <Card key={idx} className="border-border">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.count} vendidos</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">${item.revenue.toLocaleString("es-AR")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "rentabilidad" && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Rentabilidad</h2>
          {(() => {
            let totalVentas = 0, totalCostos = 0;
            orders.forEach((o) => { totalVentas += o.total; o.items.forEach((i) => { const mi = menuItemsMap.get(i.menuItemId); if (mi) totalCostos += mi.cost * i.quantity; }); });
            sales.forEach((s) => { totalVentas += s.amount; });
            const ganancia = totalVentas - totalCostos;
            const margen = totalVentas > 0 ? ((ganancia / totalVentas) * 100).toFixed(1) : "0";
            return (
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Ingresos Totales</p>
                  <p className="text-xl font-bold text-emerald-600">${totalVentas.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Costos Totales</p>
                  <p className="text-xl font-bold text-red-600">${totalCostos.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Ganancia Neta</p>
                  <p className="text-xl font-bold text-primary">${ganancia.toLocaleString("es-AR")}</p>
                </CardContent></Card>
                <Card className="border-border"><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Margen</p>
                  <p className="text-xl font-bold text-foreground">{margen}%</p>
                </CardContent></Card>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "depositos" && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Locales</h2>
          <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground">
            <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Próximamente: gestión de locales</p>
          </CardContent></Card>
        </div>
      )}
    </div>
  );
}
