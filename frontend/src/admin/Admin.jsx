// Frontend/src/admin/Admin.jsx
import React, { useState } from "react";
import AdminDashboardContent from "../user/pages/AdminDashboard/AdminDashboardContent";
import Businesses from "./component/businesses/Businesses";
import Members from "./component/members/Members";
import Approvals from "./component/approvals/Approvals";
import Analytics from "./component/analytics/Analytics";
import Finance from "./component/finance/Finance";
import Settings from "./component/settings/Settings";
import BannerApprovalPage from "../user/pages/AdminDashboard/BannerApprovalPage";
import { Route, Routes, useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./component/sidebar/Sidebar";

const ADMIN_FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
`;

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const Admin = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="flex flex-col min-h-screen bg-slate-50"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{ADMIN_FONTS}</style>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 overflow-y-auto bg-slate-50/80">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/businesses"
                element={
                  <PageTransition>
                    <Businesses />
                  </PageTransition>
                }
              />
              <Route
                path="/members"
                element={
                  <PageTransition>
                    <Members />
                  </PageTransition>
                }
              />
              <Route
                path="/approvals"
                element={
                  <PageTransition>
                    <Approvals />
                  </PageTransition>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PageTransition>
                    <Analytics />
                  </PageTransition>
                }
              />
              <Route
                path="/finance"
                element={
                  <PageTransition>
                    <Finance />
                  </PageTransition>
                }
              />
              <Route
                path="/settings"
                element={
                  <PageTransition>
                    <Settings />
                  </PageTransition>
                }
              />
              <Route
                path="/banners"
                element={
                  <PageTransition>
                    <BannerApprovalPage />
                  </PageTransition>
                }
              />
              <Route
                path="*"
                element={
                  <PageTransition>
                    <AdminDashboardContent />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Admin;
