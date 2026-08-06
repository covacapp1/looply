import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/Dashboard";
import LoyaltyPage from "@/pages/Loyalty";
import DigitalCardPage from "@/pages/DigitalCardPage";
import LoyaltyQRPage from "@/pages/LoyaltyQRPage";
import MenuPage from "@/pages/Menu";
import MenuQRPage from "@/pages/MenuQRPage";
import PricingPage from "@/pages/PricingPage";
import PromotionsPage from "@/pages/Promotions";
import BirthdayPage from "@/pages/Birthday";
import RewardsPage from "@/pages/Rewards";
import ReferralsPage from "@/pages/Referrals";
import CustomersPage from "@/pages/Customers";
import StatisticsPage from "@/pages/Statistics";
import QRCodesPage from "@/pages/QRCodes";
import ImportExportPage from "@/pages/ImportExport";
import SettingsPage from "@/pages/Settings";

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/loyalty/card" element={<DigitalCardPage />} />
            <Route path="/loyalty/qr" element={<LoyaltyQRPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/qr" element={<MenuQRPage />} />
            <Route path="/menu/pricing" element={<PricingPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/birthday" element={<BirthdayPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomersPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/qr-codes" element={<QRCodesPage />} />
            <Route path="/import-export" element={<ImportExportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}
