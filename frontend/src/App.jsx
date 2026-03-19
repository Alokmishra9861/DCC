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
import AssociationDashboardContent from "./user/pages/AssociationDashboard/AssociationDashboardContent";
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

// ── NEW: Employer sub-pages ───────────────────────────────────────────────────
import BulkPurchase from "./user/pages/EmployerDashboard/BulkPurchase";
import EmployeeUpload from "./user/pages/EmployerDashboard/EmployeeUpload";
import EmployeeList from "./user/pages/EmployerDashboard/EmployeeList";
import AcceptInvite from "./user/pages/AcceptInvite";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const UserLayout = () => {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <Routes>
          {/* ── Public pages ─────────────────────────────────────────────── */}
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
          <Route
            path="/for-associations"
            element={<ForAssociationsContent />}
          />
          <Route path="/advertise" element={<AdvertiseContent />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route
            path="/categoriespage/:category"
            element={<CategoriesDetailsPage />}
          />
          {/* Browse discounts — accessible to all authenticated users (MEMBER, BUSINESS, EMPLOYER) and public */}
          <Route
            path="/browse-discounts"
            element={<BrowseDiscountsContent />}
          />

          {/* ── PUBLIC: Employee accepts invite from email ────────────────
              Must be public — employee has no account yet when they click  */}
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />

          {/* ── Member-only pages ─────────────────────────────────────────── */}
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

          {/* ── Business dashboard ────────────────────────────────────────── */}
          <Route
            path="/business-dashboard"
            element={
              <ProtectedRoute roles={["BUSINESS"]}>
                <BusinessDashboardContent />
              </ProtectedRoute>
            }
          />

          {/* ── Discounts & Certificates (Member + Business) ─────────────── */}
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

          {/* ── Employer dashboard + sub-pages ───────────────────────────────
              All under ProtectedRoute roles={["EMPLOYER"]}
              Order matters: specific paths before the base path            */}
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

          {/* ── Other role dashboards ─────────────────────────────────────── */}
          <Route
            path="/association-dashboard"
            element={
              <ProtectedRoute roles={["ASSOCIATION"]}>
                <AssociationDashboardContent />
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

          {/* ── Payment callbacks ─────────────────────────────────────────── */}
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

          {/* ── 404 ──────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

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
