import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/shared/StatCard";
import { Users, TrendingUp, TrendingDown, Footprints, QrCode, Eye, ShoppingBag, Tag } from "lucide-react";

const customerData = [
  { month: "Ene", nuevos: 45, perdidos: 12 },
  { month: "Feb", nuevos: 62, perdidos: 18 },
  { month: "Mar", nuevos: 78, perdidos: 15 },
  { month: "Abr", nuevos: 95, perdidos: 22 },
  { month: "May", nuevos: 110, perdidos: 28 },
  { month: "Jun", nuevos: 156, perdidos: 32 },
];

const qrData = [
  { name: "Fidelización", scans: 1245, color: "#10b981" },
  { name: "Menú", scans: 3456, color: "#3b82f6" },
  { name: "Promociones", scans: 892, color: "#8b5cf6" },
  { name: "Página Pública", scans: 5670, color: "#f97316" },
];

const topProducts = [
  { name: "Cappuccino", views: 1245, sales: 892 },
  { name: "Latte", views: 980, sales: 654 },
  { name: "Espresso", views: 876, sales: 543 },
  { name: "Cold Brew", views: 654, sales: 432 },
  { name: "Croissant", views: 543, sales: 321 },
];

export default function StatisticsPage() {
  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Análisis detallado del rendimiento de tu negocio"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Reportes" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={Users} label="Clientes Nuevos" value="156" change={23} changeLabel="este mes" />
        <StatCard icon={TrendingDown} label="Clientes Perdidos" value="32" change={-8} changeLabel="este mes" />
        <StatCard icon={Footprints} label="Visitas" value="3,456" change={15} changeLabel="este mes" />
        <StatCard icon={QrCode} label="Escaneos QR" value="2,341" change={18} changeLabel="este mes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ChartCard title="Crecimiento de Clientes" description="Nuevos vs perdidos">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="nuevos" fill="#10b981" radius={[4, 4, 0, 0]} name="Nuevos" />
              <Bar dataKey="perdidos" fill="#ef4444" radius={[4, 4, 0, 0]} name="Perdidos" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Escaneos por QR" description="Distribución de escaneos">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qrData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="scans"
              >
                {qrData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {qrData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Productos Más Populares" description="Por vistas y ventas">
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={product.name} className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{product.name}</span>
                  <span className="text-sm text-muted-foreground">{product.views} vistas</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(product.views / topProducts[0].views) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
