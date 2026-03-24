import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Admin
import Admin from "./admin/Admin";

// User Components
import Header from "./user/components/common/Header";
import Footer from "./user/components/common/Footer";
import ProtectedRoute from "./user/components/common/ProtectedRoute";

// User Pages
import CategoriesPage from "./user/pages/Categories/CategoriesPage";
import NotFoundPage from "./user/pages/NotFoundPage";
import AboutContent from "./user/pages/About/AboutContent";
import Contact from "./user/pages/Contact/Contact";
import BrowseDiscountsContent from "./user/pages/BrowseDiscounts/BrowseDiscountsContent";
import AdvertiseContent from "./user/pages/Advertise/AdvertiseContent";
import BusinessProfileContent from "./user/pages/Businessprofile/BusinessProfileContent";
import BusinessDashboardContent from "./user/pages/BusinessDashboard/BusinessDashboardContent";
import B2BDashboardContent from "./user/pages/B2BDashboard/B2BDashboardContent";
import AdminDashboardContent from "./user/pages/AdminDashboard/AdminDashboardContent";
import DiscountsContent from "./user/pages/Discounts/DiscountsContent";
import HomePage from "./user/pages/Homepage/HomePage";
import ForIndividualsContent from "./user/pages/ForIndividulas/ForIndividualsContent";
import ForEmployersContent from "./user/pages/ForEmployers/ForEmployersContent";
import ForAssociationsContent from "./user/pages/ForAssociations/ForAssociationsContent";
import EmployerDashboardContent from "./user/pages/EmployerDashboard/EmployerDashboardContent";
import PricingContent from "./user/pages/Pricing/PricingContent";
import LoginContent from "./user/pages/Login/LoginContent";
import SignupContent from "./user/pages/SignUp/SignupContent";
import MemberShipFormContent from "./user/pages/Membership/MemberShipFormContent";
import VerifyEmailPage from "./user/pages/VerifyEmail/VerifyEmailPage";
import CertificationContent from "./user/pages/Certificates/CertificationContent";
import MemberDashboardContent from "./user/pages/MemberDashboard/MemberDashboardContent";
import TravelContent from "./user/pages/Travel/TravelContent";
import CategoriesDetailsPage from "./user/pages/Categories/CategoriesDetailsPage";
import ForBusinessContent from "./user/pages/ForBusinesses/ForBusinessContent";
import PaymentSuccessPage from "./user/pages/Payment/PaymentSuccessPage";
import B2BDirectoryPage from "./user/pages/B2BDirectory/B2BDirectoryPage";

// Employer sub-pages
import BulkPurchase from "./user/pages/EmployerDashboard/BulkPurchase";
import EmployeeUpload from "./user/pages/EmployerDashboard/EmployeeUpload";
import EmployeeList from "./user/pages/EmployerDashboard/EmployeeList";
import AcceptInvite from "./user/pages/AcceptInvite";

// Association dashboards + invite acceptance pages
import AssociationMemberDashboard from "./user/pages/AssociationDashboard/AssociationMemberDashboard";
import AssociationBusinessDashboard from "./user/pages/AssociationDashboard/AssociationBusinessDashboard";
import AcceptAssociationMemberInvite from "./user/pages/Association/AcceptAssociationMemberInvite";
import AcceptAssociationBusinessInvite from "./user/pages/Association/AcceptAssociationBusinessInvite";
import B2BDiscountsContent from "./user/pages/B2BDiscounts/B2BDiscountsContent";

import { getAssociationType, associationAPI } from "./services/api";

// ── Scroll to top on route change ─────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// ── AssociationTypeGuard ───────────────────────────────────────────────────────
// Reads associationType from localStorage (set by saveAuthData on login).
// If missing (e.g. old session before the patch), fetches from the API once
// and caches it, then redirects to the correct dashboard.
const AssociationTypeGuard = ({ requiredType, children }) => {
  const [resolved, setResolved] = React.useState(() => {
    // Try reading from localStorage immediately
    const stored = localStorage.getItem("dcc_association_type");
    return stored || null; // null = not yet known
  });
  const [loading, setLoading] = React.useState(!resolved);

  React.useEffect(() => {
    if (resolved) return; // already known
    // associationType missing from localStorage (old session / first load after patch)
    // Fetch from API once and cache it
    associationAPI
      .getProfile()
      .then((profile) => {
        const type = profile?.associationType || "MEMBER";
        localStorage.setItem("dcc_association_type", type);
        setResolved(type);
      })
      .catch(() => {
        setResolved("MEMBER"); // safe fallback
      })
      .finally(() => setLoading(false));
  }, [resolved]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (resolved !== requiredType) {
    const correct =
      resolved === "BUSINESS"
        ? "/association-business-dashboard"
        : "/association-member-dashboard";
    return <Navigate to={correct} replace />;
  }

  return children;
};

// ── User layout (header + footer wrapping all non-admin routes) ───────────────
const UserLayout = () => (
  <>
    <Header />
    <main className="flex-1 pt-20">
      <Routes>
        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutContent />} />
        <Route path="/pricing" element={<PricingContent />} />
        <Route path="/login" element={<LoginContent />} />
        <Route path="/sign-up" element={<SignupContent />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/for-individuals" element={<ForIndividualsContent />} />
        <Route path="/for-businesses" element={<ForBusinessContent />} />
        <Route path="/for-employers" element={<ForEmployersContent />} />
        <Route path="/for-associations" element={<ForAssociationsContent />} />
        <Route path="/advertise" element={<AdvertiseContent />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route
          path="/categoriespage/:category"
          element={<CategoriesDetailsPage />}
        />
        <Route path="/browse-discounts" element={<BrowseDiscountsContent />} />

        {/* Public invite acceptance — employee has no account yet */}
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />

        {/* Public association invite acceptance */}
        <Route
          path="/association/accept-invite/:token"
          element={<AcceptAssociationMemberInvite />}
        />
        <Route
          path="/association/business-invite/:token"
          element={<AcceptAssociationBusinessInvite />}
        />

        {/* ── Member ──────────────────────────────────────────────────────── */}
        <Route
          path="/membership"
          element={
            <ProtectedRoute roles={["MEMBER"]}>
              <MemberShipFormContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/travel"
          element={
            <ProtectedRoute roles={["MEMBER"]} requireMembership>
              <TravelContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business-profile/:id"
          element={
            <ProtectedRoute roles={["MEMBER", "BUSINESS"]} requireMembership>
              <BusinessProfileContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member-dashboard"
          element={
            <ProtectedRoute roles={["MEMBER"]} requireMembership>
              <MemberDashboardContent />
            </ProtectedRoute>
          }
        />

        {/* ── Business ────────────────────────────────────────────────────── */}
        <Route
          path="/business-dashboard"
          element={
            <ProtectedRoute roles={["BUSINESS"]}>
              <BusinessDashboardContent />
            </ProtectedRoute>
          }
        />

        {/* ── Discounts & Certificates ────────────────────────────────────── */}
        <Route
          path="/discounts"
          element={
            <ProtectedRoute roles={["MEMBER", "BUSINESS"]}>
              <DiscountsContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certification"
          element={
            <ProtectedRoute roles={["MEMBER", "BUSINESS"]} requireMembership>
              <CertificationContent />
            </ProtectedRoute>
          }
        />

        {/* ── Employer ────────────────────────────────────────────────────── */}
        <Route
          path="/employer-dashboard/bulk-purchase"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <BulkPurchase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-dashboard/employees/upload"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <EmployeeUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-dashboard/employees"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <EmployeeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <EmployerDashboardContent />
            </ProtectedRoute>
          }
        />

        {/* ── Association — MEMBER type ────────────────────────────────────── */}
        <Route
          path="/association-member-dashboard/*"
          element={
            <ProtectedRoute roles={["ASSOCIATION"]}>
              <AssociationTypeGuard requiredType="MEMBER">
                <AssociationMemberDashboard />
              </AssociationTypeGuard>
            </ProtectedRoute>
          }
        />

        {/* ── Association — BUSINESS type ──────────────────────────────────── */}
        <Route
          path="/association-business-dashboard/*"
          element={
            <ProtectedRoute roles={["ASSOCIATION"]}>
              <AssociationTypeGuard requiredType="BUSINESS">
                <AssociationBusinessDashboard />
              </AssociationTypeGuard>
            </ProtectedRoute>
          }
        />

        {/* Legacy /association-dashboard redirect → correct typed dashboard */}
        <Route
          path="/association-dashboard"
          element={
            <ProtectedRoute roles={["ASSOCIATION"]}>
              <Navigate
                to={
                  getAssociationType() === "BUSINESS"
                    ? "/association-business-dashboard"
                    : "/association-member-dashboard"
                }
                replace
              />
            </ProtectedRoute>
          }
        />

        {/* ── B2B ─────────────────────────────────────────────────────────── */}
        {/* ── B2B Discounts — businesses, employers, associations and B2B ─ */}
        <Route
          path="/b2b-discounts"
          element={
            <ProtectedRoute
              roles={["BUSINESS", "EMPLOYER", "ASSOCIATION", "B2B"]}
            >
              <B2BDiscountsContent />
            </ProtectedRoute>
          }
        />

        {/* ── B2B Directory — businesses, employers, associations, B2B (not members) ── */}
        <Route
          path="/b2b-directory"
          element={
            <ProtectedRoute
              roles={["BUSINESS", "EMPLOYER", "ASSOCIATION", "B2B"]}
            >
              <B2BDirectoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/b2b-dashboard"
          element={
            <ProtectedRoute roles={["B2B"]}>
              <B2BDashboardContent />
            </ProtectedRoute>
          }
        />

        {/* ── Payment ─────────────────────────────────────────────────────── */}
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/cancelled"
          element={<Navigate to="/pricing" replace />}
        />

        {/* ── 404 ─────────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <Footer />
  </>
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<UserLayout />} />
      </Routes>
    </div>
  );
}
