import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ShoppingCart, Link, CreditCard, DollarSign, TrendingUp, Users, Calendar, Lock, Star, Warehouse } from "lucide-react";
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
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${(reg.closingAmount || 0).toLocaleString("es-AR")}</p>
                      <Badge variant="outline" className="text-[10px]">Cerrada</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "mes" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ventas del Mes</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-border"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ingresos</p>
              <p className="text-lg font-bold text-emerald-600">${monthlyStats.ventas.toLocaleString("es-AR")}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Costos</p>
              <p className="text-lg font-bold text-red-600">${monthlyStats.costos.toLocaleString("es-AR")}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Ganancia</p>
              <p className="text-lg font-bold text-primary">${monthlyStats.ganancia.toLocaleString("es-AR")}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Pedidos</p>
              <p className="text-lg font-bold text-foreground">{monthlyStats.pedidos}</p>
            </CardContent></Card>
          </div>
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
