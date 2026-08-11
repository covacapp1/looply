import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import LoyaltyPage from "@/pages/Loyalty";
import RewardClaimPage from "@/pages/RewardClaim";
import MenuPage from "@/pages/Menu";
import PromotionsPage from "@/pages/Promotions";
import CustomersPage from "@/pages/Customers";
import StatisticsPage from "@/pages/Statistics";
import SettingsPage from "@/pages/Settings";
import NotificationsPage from "@/pages/Notifications";
import AdminPage from "@/pages/Admin";
import OrdersPage from "@/pages/Orders";
import ShopPage from "@/pages/Shop";
import CajaPage from "@/pages/Caja";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route path="/reward/:id" element={<RewardClaimPage />} />
            <Route path="/shop/:merchantId" element={<ShopPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomersPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/caja" element={<CajaPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </TooltipProvider>
  );
}
