import React from "react";
import AdminDashboardContent from "../user/pages/AdminDashboard/AdminDashboardContent";
import Businesses from "./component/businesses/Businesses";
import Members from "./component/members/Members";
import Approvals from "./component/approvals/Approvals";
import Analytics from "./component/analytics/Analytics";
import Finance from "./component/finance/Finance";
import Settings from "./component/settings/Settings";
import { Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Sidebar from "./component/sidebar/Sidebar";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const Admin = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 overflow-hidden">
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
