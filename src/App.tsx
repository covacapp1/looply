import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/Dashboard";
import LoyaltyPage from "@/pages/Loyalty";
import RewardClaimPage from "@/pages/RewardClaim";
import MenuPage from "@/pages/Menu";
import MenuQRPage from "@/pages/MenuQRPage";
import PricingPage from "@/pages/PricingPage";
import PromotionsPage from "@/pages/Promotions";
import CustomersPage from "@/pages/Customers";
import StatisticsPage from "@/pages/Statistics";
import SettingsPage from "@/pages/Settings";

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/qr" element={<MenuQRPage />} />
            <Route path="/menu/pricing" element={<PricingPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomersPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/reward/:id" element={<RewardClaimPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}
