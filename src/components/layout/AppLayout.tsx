import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-56">
        {!isDashboard && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main className={isDashboard ? "" : "p-4 sm:p-6 pb-20 lg:pb-6"}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
