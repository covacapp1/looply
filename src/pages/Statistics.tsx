import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ShoppingCart, Link, CreditCard, DollarSign, TrendingUp, Package, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByMerchant, getSalesByMerchant, getShopCustomers, getMenuItems, getClosedRegisters } from "@/services/supabase";
import { supabase } from "@/lib/supabase";

export default function StatisticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPedidosLink: 0,
    totalPedidosLocal: 0,
    totalFidelidad: 0,
    totalVentasLink: 0,
    totalVentasLocal: 0,
    totalCostos: 0,
    totalGanancia: 0,
    clientesRegistrados: 0,
    productosVendidos: 0,
    cajasCerradas: 0,
    totalCajaHistorico: 0,
  });

  const loadData = useCallback(async () => {
    if (!user) return;

    const [orders, sales, customers, menuItems, registers] = await Promise.all([
      getOrdersByMerchant(user.id),
      getSalesByMerchant(user.id),
      getShopCustomers(user.id),
      getMenuItems(user.id),
      getClosedRegisters(user.id, 100),
    ]);

    // Pedidos por link vs local
    const pedidosLink = orders.length;
    const ventasLink = orders.reduce((sum, o) => sum + o.total, 0);

    // Ventas manuales (local)
    const ventasManuales = sales.filter((s) => s.type === "manual");
    const pedidosLocal = ventasManuales.length;
    const ventasLocal = ventasManuales.reduce((sum, s) => sum + s.amount, 0);

    // Fidelidad - count loyalty customers
    const { count: fidelidadCount } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true });

    // Costos y ganancias
    const menuItemsMap = new Map(menuItems.map((m) => [m.id, m]));
    let totalCostos = 0;
    let totalIngresos = 0;

    // Costos de pedidos del link
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItem = menuItemsMap.get(item.menuItemId);
        if (menuItem) {
          totalCostos += menuItem.cost * item.quantity;
        }
        totalIngresos += item.price * item.quantity;
      });
    });

    // Costos de ventas manuales
    sales.filter((s) => s.type === "manual").forEach((sale) => {
      totalIngresos += sale.amount;
    });

    // Productos vendidos (de pedidos)
    const productosVendidos = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    setStats({
      totalPedidosLink: pedidosLink,
      totalPedidosLocal: pedidosLocal,
      totalFidelidad: fidelidadCount || 0,
      totalVentasLink: ventasLink,
      totalVentasLocal: ventasLocal,
      totalCostos,
      totalGanancia: totalIngresos - totalCostos,
      clientesRegistrados: customers.length,
      productosVendidos,
      cajasCerradas: registers.length,
      totalCajaHistorico: registers.reduce((sum, r) => sum + (r.closingAmount || 0), 0),
    });

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <PageHeader
        title="Reportes"
        description="Estadísticas de tu negocio"
      />

      {/* Resumen General */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ganancia</p>
                <p className="text-lg font-bold text-emerald-600">${stats.totalGanancia.toLocaleString("es-AR")}</p>
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
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Clientes</p>
                <p className="text-lg font-bold text-foreground">{stats.clientesRegistrados}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.totalPedidosLink}</p>
                <p className="text-xs text-muted-foreground">${stats.totalVentasLink.toLocaleString("es-AR")}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.totalPedidosLocal}</p>
                <p className="text-xs text-muted-foreground">${stats.totalVentasLocal.toLocaleString("es-AR")}</p>
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
              <p className="text-2xl font-bold text-foreground">{stats.totalFidelidad}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-foreground">Cajas Cerradas</p>
                <p className="text-xs text-muted-foreground">Sesiones de caja finalizadas</p>
              </div>
            </div>
            <div className="mt-3 text-right">
              <p className="text-2xl font-bold text-foreground">{stats.cajasCerradas}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
