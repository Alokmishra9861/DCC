import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { employerAPI, getUser, businessAPI } from "../../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const CategoriesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(getUser());
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (user && String(user.role || "").toUpperCase() === "EMPLOYER") {
      setDashboardLoading(true);
      employerAPI
        .getDashboard()
        .then((res) => setDashboard(res || null))
        .catch(() => setDashboard(null))
        .finally(() => setDashboardLoading(false));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    businessAPI
      .getAll({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.businesses)
          ? res.businesses
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setBusinesses(list);
      })
      .catch((err) => {
        console.error("Error loading businesses:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      
      {/* Hero Header */}
      <div className="bg-[#111936] text-white py-20 md:py-24 overflow-hidden relative border-b border-white/8">
        <div className="absolute inset-0 bg-[#D4A62A]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4A62A]/15 border border-[#D4A62A]/30 rounded-full text-[#D4A62A] font-bold text-xs uppercase tracking-wider mb-6">
              🏪 Partner Network Directory
            </span>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4"
              style={HEADING_FONT}
            >
              Control Where You Save.
            </h1>
            <p className="text-base sm:text-lg text-[#B8C0D4] font-medium leading-relaxed">
              Explore the verified local businesses that power DCC's exclusive private discount ecosystem across the Cayman Islands.
            </p>
          </div>
        </div>
      </div>

      {/* Employer Analytics Section */}
      {user && String(user.role || "").toUpperCase() === "EMPLOYER" && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          {dashboardLoading ? (
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ) : dashboard ? (
            <div className="space-y-8">
              {dashboard.topCategories && dashboard.topCategories.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6" style={HEADING_FONT}>
                    Top Categories Used by Employees
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboard.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#D4A62A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Comparative Column Layout - Light Theme */}
      <div className="py-16 bg-[#F5F2EB] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">
                Outside Your Control
              </span>
              <h4 className="text-2xl font-bold text-slate-900" style={HEADING_FONT}>
                Costs Outside Your Control
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm font-semibold text-slate-500">
                <li>Global inflation driving local food index higher.</li>
                <li>Import duties on transportation, auto fuel, and parts.</li>
                <li>Unpredictable seasonal electricity and utility bills.</li>
              </ul>
            </div>
            {/* Right Column */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-[#D4A62A] uppercase tracking-widest block">
                Inside Your Control
              </span>
              <h4 className="text-2xl font-bold text-slate-900" style={HEADING_FONT}>
                Savings You Can Plan
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm font-semibold text-slate-600">
                <li>Compounding weekly grocery and retail discounts.</li>
                <li>Secured pre-paid value certificates for everyday dining.</li>
                <li>Private, member-only global travel discount portal.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Businesses Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2
            className="text-3xl font-extrabold text-slate-900"
            style={HEADING_FONT}
          >
            Featured Businesses
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Click on any partner store to view their exclusive discounts, active campaigns, and available prepaid value certificates.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {businesses.map((business) => {
              const categoryLabel = business.category?.name || business.category?.slug || business.category || "Premium Partner";
              return (
                <Link
                  key={business.id || business._id}
                  to={`/business-profile/${business.id || business._id}`}
                  className="group bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-[2rem] p-6 flex flex-col items-center text-center cursor-pointer"
                >
                  {/* Logo block */}
                  <div className="w-16 h-16 rounded-2xl mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1 shadow-inner group-hover:border-[#D4A62A]/40 transition-all duration-300">
                    {business.logoUrl ? (
                      <AppImage
                        src={business.logoUrl}
                        alt={business.name}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <Icon
                        name="BuildingStorefrontIcon"
                        size={28}
                        className="text-slate-400 group-hover:text-[#D4A62A] transition-colors"
                      />
                    )}
                  </div>

                  {/* Business Name */}
                  <h3
                    className="text-base font-extrabold text-slate-800 group-hover:text-[#1C4D8D] transition-colors line-clamp-1 w-full"
                    style={HEADING_FONT}
                  >
                    {business.name}
                  </h3>

                  {/* Category breadcrumb */}
                  <p className="text-xs font-bold text-[#D4A62A] uppercase tracking-wider mt-1.5 truncate w-full">
                    {categoryLabel}
                  </p>

                  {/* District / Address badge */}
                  <span className="mt-5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black tracking-widest uppercase text-slate-500 border border-slate-200/40 truncate w-full">
                    {business.district || "Cayman Islands"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CategoriesPage;
