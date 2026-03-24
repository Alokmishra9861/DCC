// Frontend/src/employer/pages/EmployerDashboardContent.jsx
// Fully wired to the real employer API endpoints.
// Tabs: Overview (ROI stats) | Employees | Seat Management | Analytics

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { employerAPI, getUser } from "../../../services/api";
import { AreaChart, Area, PieChart, Pie, Legend } from "recharts";

// ── Small helpers ─────────────────────────────────────────────────────────────
const fmt = (n = 0) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n);

const currency = (n = 0) => `$${Number(n).toFixed(2)}`;

const STATUS_CONFIG = {
  INVITED: {
    label: "Invited",
    cls: "bg-amber-100 text-amber-700",
    icon: "EnvelopeIcon",
  },
  ACTIVE: {
    label: "Active",
    cls: "bg-emerald-100 text-emerald-700",
    icon: "CheckCircleIcon",
  },
  REMOVED: {
    label: "Removed",
    cls: "bg-red-100 text-red-500",
    icon: "XCircleIcon",
  },
};

// ── Employer-scoped Analytics (uses only employerAPI.getDashboard — no admin routes) ──
const EmployerAnalytics = ({ dashboard, loadingDash }) => {
  if (loadingDash) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6 text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Icon
          name="ChartBarIcon"
          size={40}
          className="mx-auto text-slate-300 mb-3"
        />
        <p className="font-semibold text-slate-400">No analytics data yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Purchase seats and add employees to see analytics.
        </p>
      </div>
    );
  }

  const {
    roi = {},
    monthlySavings = [],
    topCategories = [],
    topEmployees = [],
    employeeCounts = {},
  } = dashboard;

  const pieData = [
    { name: "Active", value: employeeCounts.active || 0 },
    { name: "Invited", value: employeeCounts.invited || 0 },
    { name: "Removed", value: employeeCounts.removed || 0 },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ["#1C4D8D", "#f59e0b", "#ef4444"];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Employee Analytics</h2>
        <p className="text-sm text-slate-400">Based on your team's activity</p>
      </div>

      {/* ROI summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Savings",
            value: `$${Number(roi.totalSavings || 0).toFixed(2)}`,
            color: "text-emerald-600",
          },
          {
            label: "ROI",
            value: `${roi.roiPercent || 0}%`,
            color: "text-[#1C4D8D]",
          },
          {
            label: "Total Redemptions",
            value: roi.totalRedemptions || 0,
            color: "text-violet-600",
          },
          {
            label: "Avg / Employee",
            value: `$${Number(roi.avgSavingsPerEmployee || 0).toFixed(2)}`,
            color: "text-amber-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {label}
            </p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Monthly savings trend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1">
            Monthly Savings Trend
          </h3>
          <p className="text-xs text-slate-400 mb-5">Last 6 months</p>
          {monthlySavings.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlySavings}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C4D8D" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1C4D8D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, "Savings"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#1C4D8D"
                  strokeWidth={2.5}
                  fill="url(#savingsGrad)"
                  name="Savings"
                  dot={{ fill: "#1C4D8D", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-50 flex items-center justify-center text-slate-300 text-sm">
              No trend data yet
            </div>
          )}
        </div>

        {/* Employee status pie */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1">Employee Status</h3>
          <p className="text-xs text-slate-400 mb-5">Breakdown by status</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                  nameKey="name"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-50 flex items-center justify-center text-slate-300 text-sm">
              No employee data yet
            </div>
          )}
        </div>
      </div>

      {/* Top categories bar chart */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1">Top Categories Used</h3>
          <p className="text-xs text-slate-400 mb-5">
            By employee redemption count
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                name="Redemptions"
                maxBarSize={48}
              >
                {topCategories.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top employees table */}
      {topEmployees.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Top Savers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Saved
                  </th>
                  <th className="text-right pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Redemptions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topEmployees.map((emp, i) => (
                  <tr key={emp.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-xs font-bold text-slate-300">
                          {i + 1}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-[#1C4D8D]/10 flex items-center justify-center">
                          <span className="text-[#1C4D8D] text-xs font-bold">
                            {(emp.name || "?").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600">
                      ${Number(emp.totalSavings || 0).toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {emp.totalRedemptions || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const CHART_COLORS = ["#1C4D8D", "#4988C4", "#34d399", "#f59e0b", "#8b5cf6"];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent = "bg-blue-50 text-[#1C4D8D]",
}) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(28,77,141,0.1)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-4">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
    >
      <Icon name={icon} size={22} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = ({ rows = 4 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-slate-100 rounded-xl" />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const EmployerDashboardContent = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview / ROI state ──────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [errorDash, setErrorDash] = useState("");

  // ── Employees state ───────────────────────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [empPagination, setEmpPagination] = useState({});
  const [empPage, setEmpPage] = useState(1);
  const [empStatusFilter, setEmpStatus] = useState("");
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [errorEmp, setErrorEmp] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch dashboard (overview + seat summary) ─────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    setErrorDash("");
    try {
      const data = await employerAPI.getDashboard();
      setDashboard(data);
    } catch (err) {
      setErrorDash(err.message || "Failed to load dashboard");
    } finally {
      setLoadingDash(false);
    }
  }, []);

  // ── Fetch employees ───────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoadingEmp(true);
    setErrorEmp("");
    try {
      const res = await employerAPI.getEmployees({
        page: empPage,
        limit: 15,
        ...(empStatusFilter ? { status: empStatusFilter } : {}),
      });
      // API returns { employees: [...], pagination: {...} }
      setEmployees(res.employees || res || []);
      setEmpPagination(res.pagination || {});
    } catch (err) {
      setErrorEmp(err.message || "Failed to load employees");
    } finally {
      setLoadingEmp(false);
    }
  }, [empPage, empStatusFilter]);

  // ── Tab-based fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "overview" || activeTab === "seats") fetchDashboard();
    if (activeTab === "employees") fetchEmployees();
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (activeTab === "employees") fetchEmployees();
  }, [empPage, empStatusFilter]);

  // ── Employee actions ──────────────────────────────────────────────────────
  const handleResend = async (emp) => {
    setActionLoading((p) => ({ ...p, [emp.id]: "resend" }));
    try {
      await employerAPI.resendInvite(emp.id);
      showToast("success", `Invite resent to ${emp.email}`);
    } catch (err) {
      showToast("error", err.message || "Failed to resend invite");
    } finally {
      setActionLoading((p) => ({ ...p, [emp.id]: null }));
    }
  };

  const handleRemove = async (id) => {
    setConfirmRemove(null);
    setActionLoading((p) => ({ ...p, [id]: "remove" }));
    try {
      await employerAPI.removeEmployee(id);
      showToast("success", "Employee removed");
      fetchEmployees();
      fetchDashboard(); // refresh seat counts
    } catch (err) {
      showToast("error", err.message || "Failed to remove employee");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <Icon
            name="ExclamationCircleIcon"
            size={48}
            className="mx-auto text-red-500 mb-4"
          />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Session expired
          </h2>
          <p className="text-slate-500 mb-6">
            Please log in again to continue.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold"
          >
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: "HomeIcon" },
    { key: "employees", label: "Employees", icon: "UserGroupIcon" },
    { key: "seats", label: "Seat Management", icon: "TicketIcon" },
    { key: "analytics", label: "Analytics", icon: "ChartBarIcon" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-indigo-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-100/30 to-teal-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-100/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm border text-sm font-semibold ${
            toast.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-700"
              : "bg-red-50/90 border-red-200 text-red-600"
          }`}
        >
          <Icon
            name={
              toast.type === "success"
                ? "CheckCircleIcon"
                : "ExclamationCircleIcon"
            }
            size={18}
          />
          {toast.msg}
        </div>
      )}

      {/* Remove confirm modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full shadow-[0_24px_64px_rgba(0,0,0,0.15)]">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon
                name="ExclamationTriangleIcon"
                size={24}
                className="text-red-500"
              />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">
              Remove Employee?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Their membership will be cancelled and account deactivated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#1C4D8D] to-[#4988C4] p-8 md:p-10 shadow-[0_20px_60px_rgba(10,22,40,0.3)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-blue-300/80 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Dashboard</p>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                  Employer Dashboard
                </h1>
                <p className="text-blue-200/80 mt-1">
                  Manage your company memberships and employee benefits
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/employer-dashboard/bulk-purchase")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all border border-white/20 shadow-sm"
                >
                  <Icon name="ShoppingCartIcon" size={16} /> Buy Seats
                </button>
                <button
                  onClick={() => navigate("/employer-dashboard/employees/upload")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/80 backdrop-blur-sm text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-all border border-emerald-400/30 shadow-sm"
                >
                  <Icon name="ArrowUpTrayIcon" size={16} /> Add Employees
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab nav ── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-6 overflow-hidden">
          <div className="border-b border-slate-100/80 px-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2">
              {tabs.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === key
                      ? "bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white shadow-md shadow-[#1C4D8D]/20"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Icon name={icon} size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              TAB: OVERVIEW
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="p-6 space-y-6">
              {errorDash && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <Icon
                    name="ExclamationCircleIcon"
                    size={18}
                    className="text-red-500"
                  />
                  <p className="text-sm text-red-600">{errorDash}</p>
                </div>
              )}

              {loadingDash ? (
                <Skeleton rows={2} />
              ) : dashboard ? (
                <>
                  {/* ROI stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Savings"
                      value={currency(dashboard.roi?.totalSavings)}
                      icon="CurrencyDollarIcon"
                      accent="bg-emerald-50 text-emerald-600"
                      sub="Across all employees"
                    />
                    <StatCard
                      label="ROI"
                      value={`${dashboard.roi?.roiPercent ?? 0}%`}
                      icon="ArrowTrendingUpIcon"
                      accent="bg-blue-50 text-[#1C4D8D]"
                      sub={`$${dashboard.roi?.totalMembershipCost?.toFixed(2) ?? "0.00"} spent`}
                    />
                    <StatCard
                      label="Redemptions"
                      value={fmt(dashboard.roi?.totalRedemptions)}
                      icon="TagIcon"
                      accent="bg-violet-50 text-violet-600"
                      sub="Total transactions"
                    />
                    <StatCard
                      label="Avg / Employee"
                      value={currency(dashboard.roi?.avgSavingsPerEmployee)}
                      icon="UserIcon"
                      accent="bg-amber-50 text-amber-600"
                      sub="Per active employee"
                    />
                  </div>

                  {/* Seat summary row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Seats Purchased",
                        value: dashboard.seatsPurchased ?? 0,
                        color: "text-slate-900",
                      },
                      {
                        label: "Seats Used",
                        value: dashboard.seatsUsed ?? 0,
                        color: "text-[#1C4D8D]",
                      },
                      {
                        label: "Seats Available",
                        value:
                          (dashboard.seatsPurchased ?? 0) -
                          (dashboard.seatsUsed ?? 0),
                        color: "text-emerald-600",
                      },
                    ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-100/80"
                      >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          {label}
                        </p>
                        <p className={`text-4xl font-black ${color}`}>
                          {value}
                        </p>
                        {dashboard.planType && (
                          <p className="text-xs text-slate-400 mt-1">
                            {dashboard.planType} plan
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Monthly savings chart */}
                  {dashboard.monthlySavings?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                      <h3 className="font-bold text-slate-900 mb-1">
                        Monthly Employee Savings
                      </h3>
                      <p className="text-xs text-slate-400 mb-5">
                        Last 6 months
                      </p>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={dashboard.monthlySavings}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${fmt(v)}`}
                          />
                          <Tooltip
                            formatter={(v) => [
                              `$${Number(v).toFixed(2)}`,
                              "Savings",
                            ]}
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="savings"
                            stroke="#1C4D8D"
                            strokeWidth={2.5}
                            dot={{ fill: "#1C4D8D", r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Savings"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Two columns: top employees + top categories */}
                  <div className="grid lg:grid-cols-2 gap-5">
                    {/* Top employees */}
                    {dashboard.topEmployees?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">
                          Top Savers
                        </h3>
                        <div className="space-y-3">
                          {dashboard.topEmployees.map((emp, i) => (
                            <div
                              key={emp.id}
                              className="flex items-center gap-3"
                            >
                              <span className="w-6 text-xs font-bold text-slate-400">
                                {i + 1}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-[#1C4D8D]/10 flex items-center justify-center shrink-0">
                                <span className="text-[#1C4D8D] text-xs font-bold">
                                  {emp.name?.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {emp.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {emp.email}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-emerald-600 shrink-0">
                                {currency(emp.totalSavings)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top categories */}
                    {dashboard.topCategories?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">
                          Popular Categories
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart
                            data={dashboard.topCategories}
                            layout="vertical"
                            margin={{ left: 4 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f1f5f9"
                              horizontal={false}
                            />
                            <XAxis
                              type="number"
                              tick={{ fontSize: 11, fill: "#94a3b8" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              type="category"
                              dataKey="category"
                              tick={{ fontSize: 11, fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                              width={90}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="count"
                              radius={[0, 6, 6, 0]}
                              name="Redemptions"
                              maxBarSize={20}
                            >
                              {dashboard.topCategories.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Plan expiry notice */}
                  {dashboard.planExpiryDate && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <Icon
                        name="CalendarDaysIcon"
                        size={18}
                        className="text-amber-600 shrink-0"
                      />
                      <p className="text-sm text-amber-700">
                        Your plan expires on{" "}
                        <strong>
                          {new Date(
                            dashboard.planExpiryDate,
                          ).toLocaleDateString("en-KY", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </strong>
                        .{" "}
                        <button
                          onClick={() =>
                            navigate("/employer-dashboard/bulk-purchase")
                          }
                          className="underline font-semibold"
                        >
                          Renew now
                        </button>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* No plan purchased yet */
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Icon
                    name="TicketIcon"
                    size={48}
                    className="mx-auto text-slate-300 mb-4"
                  />
                  <h3 className="font-bold text-slate-600 mb-2">
                    No membership plan yet
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Purchase bulk memberships to start adding employees.
                  </p>
                  <button
                    onClick={() =>
                      navigate("/employer-dashboard/bulk-purchase")
                    }
                    className="px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors"
                  >
                    Buy Memberships
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB: EMPLOYEES
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "employees" && (
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  Employee Roster
                  {empPagination.total ? (
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      ({empPagination.total} total)
                    </span>
                  ) : null}
                </h2>
                <button
                  onClick={() =>
                    navigate("/employer-dashboard/employees/upload")
                  }
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] transition-colors"
                >
                  <Icon name="PlusIcon" size={16} /> Add Employees
                </button>
              </div>

              {/* Status filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "", label: "All" },
                  { key: "ACTIVE", label: "Active" },
                  { key: "INVITED", label: "Invited" },
                  { key: "REMOVED", label: "Removed" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setEmpStatus(key);
                      setEmpPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      empStatusFilter === key
                        ? "bg-[#1C4D8D] text-white"
                        : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {errorEmp && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <Icon
                    name="ExclamationCircleIcon"
                    size={18}
                    className="text-red-500"
                  />
                  <p className="text-sm text-red-600">{errorEmp}</p>
                </div>
              )}

              {loadingEmp ? (
                <Skeleton rows={6} />
              ) : employees.length === 0 ? (
                <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Icon
                    name="UserGroupIcon"
                    size={40}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="font-semibold text-slate-400">
                    No employees found
                  </p>
                  <button
                    onClick={() =>
                      navigate("/employer-dashboard/employees/upload")
                    }
                    className="mt-4 px-5 py-2 bg-[#1C4D8D] text-white rounded-xl text-sm font-semibold"
                  >
                    Add Your First Employee
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Savings
                          </th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                            Redemptions
                          </th>
                          <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employees.map((emp) => {
                          const sc =
                            STATUS_CONFIG[emp.status] || STATUS_CONFIG.INVITED;
                          const act = actionLoading[emp.id];
                          return (
                            <tr
                              key={emp.id}
                              className="hover:bg-slate-50/60 transition-colors"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1C4D8D]/10 flex items-center justify-center shrink-0">
                                    <span className="text-[#1C4D8D] text-xs font-bold">
                                      {(emp.name || "?")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">
                                      {emp.name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                      {emp.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sc.cls}`}
                                >
                                  <Icon name={sc.icon} size={11} />
                                  {sc.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                                {currency(emp.totalSavings || 0)}
                              </td>
                              <td className="px-5 py-3.5 text-right text-slate-500 hidden sm:table-cell">
                                {emp.totalRedemptions || 0}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-1.5">
                                  {emp.status === "INVITED" && (
                                    <button
                                      onClick={() => handleResend(emp)}
                                      disabled={!!act}
                                      title="Resend invite"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#1C4D8D] hover:bg-blue-50 transition-colors disabled:opacity-40"
                                    >
                                      {act === "resend" ? (
                                        <svg
                                          className="animate-spin w-4 h-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          />
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                          />
                                        </svg>
                                      ) : (
                                        <Icon
                                          name="PaperAirplaneIcon"
                                          size={15}
                                        />
                                      )}
                                    </button>
                                  )}
                                  {emp.status !== "REMOVED" && (
                                    <button
                                      onClick={() => setConfirmRemove(emp.id)}
                                      disabled={!!act}
                                      title="Remove employee"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                    >
                                      <Icon name="TrashIcon" size={15} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {empPagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-slate-400">
                        Page {empPagination.page} of {empPagination.pages}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEmpPage((p) => Math.max(1, p - 1))}
                          disabled={empPage === 1}
                          className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:border-slate-300"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setEmpPage((p) =>
                              Math.min(empPagination.pages, p + 1),
                            )
                          }
                          disabled={empPage === empPagination.pages}
                          className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:border-slate-300"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB: SEAT MANAGEMENT
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "seats" && (
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Seat Management
                </h2>
                <button
                  onClick={() => navigate("/employer-dashboard/bulk-purchase")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] transition-colors"
                >
                  <Icon name="PlusCircleIcon" size={16} /> Buy More Seats
                </button>
              </div>

              {loadingDash ? (
                <Skeleton rows={3} />
              ) : dashboard ? (
                <>
                  {/* Visual seat usage bar */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Seat Usage
                      </span>
                      <span className="text-sm text-slate-500">
                        {dashboard.seatsUsed} / {dashboard.seatsPurchased} used
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                      <div
                        className="h-3 rounded-full bg-[#1C4D8D] transition-all"
                        style={{
                          width:
                            dashboard.seatsPurchased > 0
                              ? `${Math.min(100, (dashboard.seatsUsed / dashboard.seatsPurchased) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          label: "Purchased",
                          value: dashboard.seatsPurchased ?? 0,
                          color: "text-slate-900",
                        },
                        {
                          label: "Used",
                          value: dashboard.seatsUsed ?? 0,
                          color: "text-[#1C4D8D]",
                        },
                        {
                          label: "Available",
                          value:
                            (dashboard.seatsPurchased ?? 0) -
                            (dashboard.seatsUsed ?? 0),
                          color: "text-emerald-600",
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="text-center bg-slate-50 rounded-xl py-4"
                        >
                          <p className={`text-3xl font-black ${color}`}>
                            {value}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan details */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">
                      Plan Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      {[
                        ["Plan", dashboard.planType || "—"],
                        ["Seats purchased", dashboard.seatsPurchased ?? 0],
                        [
                          "Plan started",
                          dashboard.planStartDate
                            ? new Date(
                                dashboard.planStartDate,
                              ).toLocaleDateString()
                            : "—",
                        ],
                        [
                          "Plan expires",
                          dashboard.planExpiryDate
                            ? new Date(
                                dashboard.planExpiryDate,
                              ).toLocaleDateString()
                            : "—",
                        ],
                        [
                          "Total paid",
                          currency(dashboard.roi?.totalMembershipCost || 0),
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex justify-between py-2 border-b border-slate-50 last:border-0"
                        >
                          <span className="text-slate-500">{label}</span>
                          <span className="font-semibold text-slate-800">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee status breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">
                      Employee Status Breakdown
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Active",
                          value: dashboard.employeeCounts?.active ?? 0,
                          cls: "bg-emerald-50 text-emerald-700",
                        },
                        {
                          label: "Invited",
                          value: dashboard.employeeCounts?.invited ?? 0,
                          cls: "bg-amber-50 text-amber-700",
                        },
                        {
                          label: "Removed",
                          value: dashboard.employeeCounts?.removed ?? 0,
                          cls: "bg-red-50 text-red-500",
                        },
                      ].map(({ label, value, cls }) => (
                        <div
                          key={label}
                          className={`rounded-xl p-4 text-center ${cls}`}
                        >
                          <p className="text-2xl font-black">{value}</p>
                          <p className="text-xs font-semibold mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Icon
                    name="TicketIcon"
                    size={40}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="font-semibold text-slate-400 mb-4">
                    No memberships purchased yet
                  </p>
                  <button
                    onClick={() =>
                      navigate("/employer-dashboard/bulk-purchase")
                    }
                    className="px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold"
                  >
                    Purchase Your First Plan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB: ANALYTICS — reuse existing Analytics component
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === "analytics" && (
            <EmployerAnalytics
              dashboard={dashboard}
              loadingDash={loadingDash}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardContent;
