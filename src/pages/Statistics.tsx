import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ShoppingCart, Link, CreditCard, DollarSign, TrendingUp, Package, Users, Calendar, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByMerchant, getSalesByMerchant, getShopCustomers, getMenuItems, getClosedRegisters } from "@/services/supabase";
import { supabase } from "@/lib/supabase";
import type { Order, Sale, MenuItem, DailyRegister } from "@/types";

export default function StatisticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
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
      getClosedRegisters(user.id, 200),
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Available months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    sales.forEach((s) => {
      const d = new Date(s.createdAt);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort().reverse();
  }, [orders, sales]);

  // Filter by month
  const filteredOrders = useMemo(() => {
    if (selectedMonth === "all") return orders;
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === selectedMonth;
    });
  }, [orders, selectedMonth]);

  const filteredSales = useMemo(() => {
    if (selectedMonth === "all") return sales;
    return sales.filter((s) => {
      const d = new Date(s.createdAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === selectedMonth;
    });
  }, [sales, selectedMonth]);

  const filteredRegisters = useMemo(() => {
    if (selectedMonth === "all") return registers;
    return registers.filter((r) => {
      const d = new Date(r.openedAt);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === selectedMonth;
    });
  }, [registers, selectedMonth]);

  // Calculate stats
  const menuItemsMap = useMemo(() => new Map(menuItems.map((m) => [m.id, m])), [menuItems]);

  const stats = useMemo(() => {
    const pedidosLink = filteredOrders.length;
    const ventasLink = filteredOrders.reduce((sum, o) => sum + o.total, 0);

    const ventasManuales = filteredSales.filter((s) => s.type === "manual");
    const pedidosLocal = ventasManuales.length;
    const ventasLocal = ventasManuales.reduce((sum, s) => sum + s.amount, 0);

    let totalCostos = 0;
    let totalIngresos = 0;

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItem = menuItemsMap.get(item.menuItemId);
        if (menuItem) {
          totalCostos += menuItem.cost * item.quantity;
        }
        totalIngresos += item.price * item.quantity;
      });
    });

    ventasManuales.forEach((sale) => {
      totalIngresos += sale.amount;
    });

    const productosVendidos = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    return {
      pedidosLink,
      pedidosLocal,
      ventasLink,
      ventasLocal,
      totalCostos,
      totalGanancia: totalIngresos - totalCostos,
      totalIngresos,
      productosVendidos,
    };
  }, [filteredOrders, filteredSales, menuItemsMap]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const months: Record<string, { ventas: number; costos: number; ganancia: number; pedidos: number }> = {};

    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { ventas: 0, costos: 0, ganancia: 0, pedidos: 0 };
      months[key].pedidos++;
      months[key].ventas += order.total;
      order.items.forEach((item) => {
        const mi = menuItemsMap.get(item.menuItemId);
        if (mi) months[key].costos += mi.cost * item.quantity;
      });
    });

    sales.filter((s) => s.type === "manual").forEach((sale) => {
      const d = new Date(sale.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { ventas: 0, costos: 0, ganancia: 0, pedidos: 0 };
      months[key].ventas += sale.amount;
    });

    Object.keys(months).forEach((key) => {
      months[key].ganancia = months[key].ventas - months[key].costos;
    });

    return months;
  }, [orders, sales, menuItemsMap]);

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

  const formatMonth = (key: string) => {
    const [y, m] = key.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  };

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Estadísticas de tu negocio"
      />

      {/* Month Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedMonth("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            selectedMonth === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Todo
        </button>
        {availableMonths.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedMonth === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {formatMonth(m)}
          </button>
        ))}
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="text-lg font-bold text-emerald-600">${stats.totalIngresos.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Costos</p>
                <p className="text-lg font-bold text-red-600">${stats.totalCostos.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ganancia</p>
                <p className="text-lg font-bold text-primary">${stats.totalGanancia.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prod. Vendidos</p>
                <p className="text-lg font-bold text-foreground">{stats.productosVendidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos por Canal */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Pedidos por Canal
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Link className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Por Link</p>
                  <p className="text-xs text-muted-foreground">Pedidos online</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{stats.pedidosLink}</p>
                <p className="text-xs text-muted-foreground">${stats.ventasLink.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">En el Local</p>
                  <p className="text-xs text-muted-foreground">Carga manual</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{stats.pedidosLocal}</p>
                <p className="text-xs text-muted-foreground">${stats.ventasLocal.toLocaleString("es-AR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fidelidad */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Programa de Fidelidad
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tarjetas Activas</p>
                <p className="text-xs text-muted-foreground">Clientes con tarjeta de fidelidad</p>
              </div>
            </div>
            <div className="mt-3 text-right">
              <p className="text-2xl font-bold text-foreground">{fidelidadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Clientes Registrados</p>
                <p className="text-xs text-muted-foreground">Desde link de tienda</p>
              </div>
            </div>
            <div className="mt-3 text-right">
              <p className="text-2xl font-bold text-foreground">{clientesCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Cajas */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Historial de Cajas
      </h2>
      {filteredRegisters.length === 0 ? (
        <Card className="border-border mb-6">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay cajas cerradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 mb-6">
          {filteredRegisters.map((reg) => (
            <Card key={reg.id} className="border-border">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(reg.openedAt).toLocaleDateString("es-AR")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apertura: ${reg.openingAmount.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${(reg.closingAmount || 0).toLocaleString("es-AR")}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    Cerrada
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resumen Mensual */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Resumen Mensual
      </h2>
      {Object.keys(monthlyData).length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay datos mensuales</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {Object.entries(monthlyData)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([key, data]) => (
              <Card key={key} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-foreground capitalize">{formatMonth(key)}</p>
                    <Badge variant="outline">{data.pedidos} pedidos</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                      <p className="text-sm font-bold text-emerald-600">${data.ventas.toLocaleString("es-AR")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Costos</p>
                      <p className="text-sm font-bold text-red-600">${data.costos.toLocaleString("es-AR")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ganancia</p>
                      <p className="text-sm font-bold text-primary">${data.ganancia.toLocaleString("es-AR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
