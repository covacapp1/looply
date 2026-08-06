import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserPlus,
  Gift,
  Star,
  Ticket,
  Footprints,
  Eye,
  QrCode,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { mockDashboardMetrics } from "@/services/mock";

export default function DashboardPage() {
  const metrics = mockDashboardMetrics;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Bienvenido de vuelta, Café Aroma"
        actions={<QuickActions />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        <StatCard icon={Users} label="Clientes Totales" value={metrics.totalCustomers.toLocaleString()} change={12} />
        <StatCard icon={UserCheck} label="Clientes Activos" value={metrics.activeCustomers.toLocaleString()} change={8} />
        <StatCard icon={UserPlus} label="Nuevos Clientes" value={metrics.newCustomers.toLocaleString()} change={23} />
        <StatCard icon={Gift} label="Canjes" value={metrics.totalRedemptions.toLocaleString()} change={15} />
        <StatCard icon={Star} label="Puntos Entregados" value={metrics.pointsIssued.toLocaleString()} change={18} />
      </div>

      <div className="grid gap-6 lg:grid-cols-7 mb-8">
        <div className="lg:col-span-4">
          <ChartCard title="Visitas por Día" description="Esta semana">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="lg:col-span-3">
          <ChartCard title="Actividad Reciente" description="Últimas interacciones">
            <ActivityFeed activities={metrics.recentActivity} />
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ChartCard title="Crecimiento de Clientes" description="Últimos 6 meses">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.customerGrowth}>
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
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={Ticket}
            label="Sellos Completados"
            value={metrics.stampsCompleted.toLocaleString()}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
          <MetricCard
            icon={Footprints}
            label="Visitas Totales"
            value={metrics.totalVisits.toLocaleString()}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <MetricCard
            icon={Eye}
            label="Visitas al Menú"
            value={metrics.menuViews.toLocaleString()}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
          <MetricCard
            icon={QrCode}
            label="Escaneos QR"
            value={metrics.qrScans.toLocaleString()}
            iconBg="bg-pink-100"
            iconColor="text-pink-600"
          />
        </div>
      </div>
    </div>
  );
}
