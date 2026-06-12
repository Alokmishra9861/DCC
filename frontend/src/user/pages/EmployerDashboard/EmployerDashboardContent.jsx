// Frontend/src/employer/pages/EmployerDashboardContent.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { employerAPI, getUser } from "../../../services/api";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// ── Premium UI Tokens ────────────────────────────────────────────────────────
const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };
const CHART_COLORS = ["#1C4D8D", "#4988C4", "#10b981", "#f59e0b", "#8b5cf6"];

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
    cls: "bg-amber-50 text-amber-700 border border-amber-100",
    icon: "EnvelopeIcon",
  },
  ACTIVE: {
    label: "Active",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    icon: "CheckCircleIcon",
  },
  REMOVED: {
    label: "Removed",
    cls: "bg-rose-50 text-rose-600 border border-rose-100",
    icon: "XCircleIcon",
  },
};

// ── Custom Chart Tooltip ──────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3.5 min-w-[120px]">
      <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          className="text-sm font-black m-0 flex items-center justify-between gap-4"
          style={{ color: p.color || "#1C4D8D" }}
        >
          <span>
            {prefix}
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── Employer Analytics Component ──────────────────────────────────────────────
const EmployerAnalytics = ({ dashboard, loadingDash }) => {
  if (loadingDash) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-100 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6 text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
          <Icon name="ChartBarIcon" size={28} className="text-slate-300" />
        </div>
        <p className="text-lg font-bold text-slate-700">
          No analytics data yet
        </p>
        <p className="text-sm font-medium text-slate-500 mt-1">
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

  const PIE_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
        <h2
          className="text-2xl font-bold text-slate-900 tracking-tight mb-6"
          style={HEADING_FONT}
        >
          Employee Analytics
        </h2>

        {/* ROI summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Savings",
              value: `$${Number(roi.totalSavings || 0).toFixed(2)}`,
              color: "text-emerald-600",
              bg: "bg-emerald-50/50",
            },
            {
              label: "ROI",
              value: `${roi.roiPercent || 0}%`,
              color: "text-[#1C4D8D]",
              bg: "bg-blue-50/50",
            },
            {
              label: "Total Redemptions",
              value: roi.totalRedemptions || 0,
              color: "text-indigo-600",
              bg: "bg-indigo-50/50",
            },
            {
              label: "Avg / Employee",
              value: `$${Number(roi.avgSavingsPerEmployee || 0).toFixed(2)}`,
              color: "text-amber-600",
              bg: "bg-amber-50/50",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className={`${bg} rounded-3xl border border-slate-100/80 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                {label}
              </p>
              <p
                className={`text-4xl font-bold tracking-tight ${color}`}
                style={HEADING_FONT}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly savings trend */}
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8">
            <h3 className="font-bold text-slate-900 mb-1 tracking-tight text-lg">
              Monthly Savings Trend
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Last 6 months
            </p>
            {monthlySavings.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={monthlySavings}
                  margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="savingsGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#1C4D8D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1C4D8D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    content={<ChartTip prefix="$" />}
                    cursor={{
                      stroke: "#cbd5e1",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#1C4D8D"
                    strokeWidth={3}
                    fill="url(#savingsGrad)"
                    name="Savings"
                    activeDot={{
                      r: 6,
                      fill: "#1C4D8D",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-slate-400 font-medium text-sm">
                No trend data yet
              </div>
            )}
          </div>

          {/* Employee status pie */}
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8">
            <h3 className="font-bold text-slate-900 mb-1 tracking-tight text-lg">
              Employee Status
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Breakdown by status
            </p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={4}
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#64748b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-slate-400 font-medium text-sm">
                No employee data yet
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Top categories */}
          {topCategories.length > 0 && (
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8">
              <h3 className="font-bold text-slate-900 mb-1 tracking-tight text-lg">
                Top Categories Used
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                By redemption count
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topCategories} margin={{ top: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    name="Redemptions"
                    maxBarSize={40}
                  >
                    {topCategories.map((_, i) => (
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

          {/* Top employees table */}
          {topEmployees.length > 0 && (
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8">
              <h3 className="font-bold text-slate-900 mb-6 tracking-tight text-lg">
                Top Savers
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      {["Employee", "Total Saved", "Redemptions"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`py-4 px-5 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap ${i > 0 ? "text-right" : ""}`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {topEmployees.map((emp, i) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-[10px] font-black text-slate-400">
                              {i + 1}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 shadow-sm border border-blue-200/50">
                              <span className="text-[#1C4D8D] text-xs font-black">
                                {(emp.name || "?").charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {emp.name}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500 truncate">
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-right font-black text-emerald-600">
                          ${Number(emp.totalSavings || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-5 text-right font-bold text-slate-600">
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
      </div>
    </div>
  );
};

// ── Stat card Component ───────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  icon,
  accent = "bg-blue-50 text-[#1C4D8D]",
}) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
        {label}
      </p>
      <div className={`p-2.5 rounded-xl shadow-sm ${accent}`}>
        <Icon name={icon} size={20} />
      </div>
    </div>
    <p className="text-4xl font-bold tracking-tight mb-1" style={HEADING_FONT}>
      {value}
    </p>
    {sub && (
      <p className="text-xs font-medium text-slate-400 line-clamp-1">{sub}</p>
    )}
  </div>
);

// ── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = ({ rows = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-16 bg-slate-100/80 rounded-2xl" />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const EmployerDashboardContent = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [dashboard, setDashboard] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [errorDash, setErrorDash] = useState("");
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

  const fetchEmployees = useCallback(async () => {
    setLoadingEmp(true);
    setErrorEmp("");
    try {
      const res = await employerAPI.getEmployees({
        page: empPage,
        limit: 15,
        ...(empStatusFilter ? { status: empStatusFilter } : {}),
      });
      setEmployees(res.employees || res || []);
      setEmpPagination(res.pagination || {});
    } catch (err) {
      setErrorEmp(err.message || "Failed to load employees");
    } finally {
      setLoadingEmp(false);
    }
  }, [empPage, empStatusFilter]);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfileData = async () => {
    setLoadingProfile(true);
    try {
      const res = await employerAPI.getProfile();
      setProfile(res?.data || res);
    } catch (error) {
      console.error("Error fetching employer profile:", error);
      showToast("error", "Failed to load profile details");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "overview" || activeTab === "seats") fetchDashboard();
    if (activeTab === "employees") fetchEmployees();
    if (activeTab === "profile") fetchProfileData();
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (activeTab === "employees") fetchEmployees();
  }, [empPage, empStatusFilter]);

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
      fetchDashboard();
    } catch (err) {
      showToast("error", err.message || "Failed to remove employee");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-[2rem] p-10 max-w-md text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              name="ExclamationCircleIcon"
              size={40}
              className="text-red-500"
            />
          </div>
          <h2
            className="text-2xl font-bold text-slate-900 mb-2"
            style={HEADING_FONT}
          >
            Session Expired
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            Please log in again to continue managing your account.
          </p>
          <a
            href="/login"
            className="inline-block w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-[#1C4D8D] transition-colors shadow-md"
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
    { key: "profile", label: "Profile", icon: "UserCircleIcon" },
  ];

  const employerId = user?.employer?.id || user?.employer?._id || user?.profile?.id || user?.profile?._id || dashboard?.employerId || dashboard?.id || dashboard?._id;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#1C4D8D]/20">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-60">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50/40 to-teal-50/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-bold animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-white/95 backdrop-blur-md border-emerald-200 text-emerald-800"
              : "bg-white/95 backdrop-blur-md border-rose-200 text-rose-800"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
          >
            <Icon
              name={toast.type === "success" ? "CheckIcon" : "XMarkIcon"}
              size={14}
            />
          </div>
          {toast.msg}
        </div>
      )}

      {/* Remove Confirm Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-rose-100">
              <Icon
                name="ExclamationTriangleIcon"
                size={28}
                className="text-rose-500"
              />
            </div>
            <h3
              className="text-2xl font-bold text-slate-900 mb-2 tracking-tight"
              style={HEADING_FONT}
            >
              Remove Employee?
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-8">
              Their membership will be cancelled and account deactivated
              immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-md shadow-rose-500/20 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Hero */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0A1628] via-[#1C4D8D] to-[#4988C4] p-10 md:p-14 shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <p className="text-blue-300/90 text-xs font-black uppercase tracking-[0.3em] mb-3">
                  Dashboard
                </p>
                <h1
                  className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md"
                  style={HEADING_FONT}
                >
                  Employer Dashboard
                </h1>
                <p className="text-blue-100/90 text-lg font-medium">
                  Manage your company memberships and employee benefits.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {employerId && (
                  <button
                    onClick={() => window.open(`/business-profile/${employerId}`, "_blank")}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 shadow-lg"
                  >
                    <Icon name="EyeIcon" size={18} /> View Live Profile
                  </button>
                )}
                <button
                  onClick={() => navigate("/employer-dashboard/bulk-purchase")}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 shadow-lg"
                >
                  <Icon name="ShoppingCartIcon" size={18} /> Buy Seats
                </button>
                <button
                  onClick={() =>
                    navigate("/employer-dashboard/employees/upload")
                  }
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Icon name="ArrowUpTrayIcon" size={18} /> Add Employees
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="mb-10">
          <div className="flex gap-1.5 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto w-fit">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === key
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Icon
                  name={icon}
                  size={18}
                  className={activeTab === key ? "opacity-100" : "opacity-70"}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {errorDash && (
              <div className="p-5 bg-gradient-to-r from-rose-50 to-red-50/50 border border-rose-200/60 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 text-rose-600 shadow-sm">
                  <Icon name="ExclamationTriangleIcon" size={20} />
                </div>
                <div className="pt-2">
                  <p className="font-bold text-rose-900">{errorDash}</p>
                </div>
              </div>
            )}

            {loadingDash ? (
              <Skeleton rows={2} />
            ) : dashboard ? (
              <>
                {/* ROI stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    label="Total Savings"
                    value={currency(dashboard.roi?.totalSavings)}
                    icon="CurrencyDollarIcon"
                    accent="bg-emerald-50/80 text-emerald-600"
                    sub="Across all employees"
                  />
                  <StatCard
                    label="ROI"
                    value={`${dashboard.roi?.roiPercent ?? 0}%`}
                    icon="ArrowTrendingUpIcon"
                    accent="bg-blue-50/80 text-[#1C4D8D]"
                    sub={`$${dashboard.roi?.totalMembershipCost?.toFixed(2) ?? "0.00"} spent`}
                  />
                  <StatCard
                    label="Redemptions"
                    value={fmt(dashboard.roi?.totalRedemptions)}
                    icon="TagIcon"
                    accent="bg-indigo-50/80 text-indigo-600"
                    sub="Total transactions"
                  />
                  <StatCard
                    label="Avg / Employee"
                    value={currency(dashboard.roi?.avgSavingsPerEmployee)}
                    icon="UserIcon"
                    accent="bg-amber-50/80 text-amber-600"
                    sub="Per active employee"
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Seat summary */}
                  <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                      <h3
                        className="text-2xl font-bold text-slate-900 tracking-tight"
                        style={HEADING_FONT}
                      >
                        Seat Usage
                      </h3>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider">
                        {dashboard.seatsUsed} / {dashboard.seatsPurchased} Used
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#1C4D8D] transition-all duration-1000 ease-out"
                        style={{
                          width:
                            dashboard.seatsPurchased > 0
                              ? `${Math.min(100, (dashboard.seatsUsed / dashboard.seatsPurchased) * 100)}%`
                              : "0%",
                        }}
                      >
                        <div
                          className="absolute inset-0 bg-white/20 w-full"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-auto">
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
                          className="text-center bg-slate-50/50 border border-slate-100 rounded-2xl py-5"
                        >
                          <p
                            className={`text-3xl font-bold ${color}`}
                            style={HEADING_FONT}
                          >
                            {value}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan details & breakdown */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                      <h3
                        className="text-2xl font-bold text-slate-900 tracking-tight mb-6"
                        style={HEADING_FONT}
                      >
                        Plan Details
                      </h3>
                      <div className="space-y-4">
                        {[
                          [
                            "Plan",
                            <span className="px-2.5 py-1 bg-blue-50 text-[#1C4D8D] rounded-md text-[10px] font-black uppercase tracking-wider">
                              {dashboard.planType || "—"}
                            </span>,
                          ],
                          [
                            "Seats Purchased",
                            <span className="font-bold">
                              {dashboard.seatsPurchased ?? 0}
                            </span>,
                          ],
                          [
                            "Plan Started",
                            <span className="font-bold">
                              {dashboard.planStartDate
                                ? new Date(
                                    dashboard.planStartDate,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>,
                          ],
                          [
                            "Plan Expires",
                            <span className="font-bold">
                              {dashboard.planExpiryDate
                                ? new Date(
                                    dashboard.planExpiryDate,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>,
                          ],
                          [
                            "Total Paid",
                            <span className="font-bold text-emerald-600">
                              {currency(
                                dashboard.roi?.totalMembershipCost || 0,
                              )}
                            </span>,
                          ],
                        ].map(([label, value], i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                          >
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                              {label}
                            </span>
                            <span className="text-slate-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {dashboard.planExpiryDate && (
                      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-yellow-50/30 border border-amber-200/60 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                            <Icon name="CalendarDaysIcon" size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-amber-900 text-sm">
                              Plan expires soon
                            </p>
                            <p className="text-xs font-medium text-amber-700/80 mt-0.5">
                              {new Date(
                                dashboard.planExpiryDate,
                              ).toLocaleDateString("en-KY", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate("/employer-dashboard/bulk-purchase")
                          }
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-xs hover:bg-amber-600 transition-colors shadow-sm"
                        >
                          Renew
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employee status breakdown */}
                <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                  <h3
                    className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                    style={HEADING_FONT}
                  >
                    Employee Status Breakdown
                  </h3>
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      {
                        label: "Active",
                        value: dashboard.employeeCounts?.active ?? 0,
                        cls: "bg-emerald-50/50 border-emerald-100 text-emerald-700",
                      },
                      {
                        label: "Invited",
                        value: dashboard.employeeCounts?.invited ?? 0,
                        cls: "bg-amber-50/50 border-amber-100 text-amber-700",
                      },
                      {
                        label: "Removed",
                        value: dashboard.employeeCounts?.removed ?? 0,
                        cls: "bg-rose-50/50 border-rose-100 text-rose-600",
                      },
                    ].map(({ label, value, cls }) => (
                      <div
                        key={label}
                        className={`rounded-3xl p-6 text-center border shadow-sm ${cls}`}
                      >
                        <p
                          className="text-4xl font-bold tracking-tight mb-2"
                          style={HEADING_FONT}
                        >
                          {value}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-80">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200/60">
                  <Icon
                    name="TicketIcon"
                    size={32}
                    className="text-slate-400"
                  />
                </div>
                <h3
                  className="text-2xl font-bold text-slate-900 mb-2 tracking-tight"
                  style={HEADING_FONT}
                >
                  No membership plan yet
                </h3>
                <p className="text-slate-500 font-medium mb-8">
                  Purchase bulk memberships to start adding employees to your
                  roster.
                </p>
                <button
                  onClick={() => navigate("/employer-dashboard/bulk-purchase")}
                  className="px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Icon name="ShoppingCartIcon" size={18} /> Buy Memberships
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: EMPLOYEES
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "employees" && (
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <h2
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                  style={HEADING_FONT}
                >
                  Employee Roster
                </h2>
                {empPagination.total > 0 && (
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Managing {empPagination.total} total members
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate("/employer-dashboard/employees/upload")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-900/20"
              >
                <Icon name="PlusIcon" size={18} /> Add Employees
              </button>
            </div>

            {/* Status filter Pills */}
            <div className="flex gap-2 flex-wrap bg-slate-50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-100">
              {[
                { key: "", label: "All" },
                { key: "ACTIVE", label: "Active" },
                { key: "INVITED", label: "Invited" },
                { key: "REMOVED", label: "Removed" },
              ].map(({ key, label }) => (
                <button
                  key={label}
                  onClick={() => {
                    setEmpStatus(key);
                    setEmpPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    empStatusFilter === key
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {errorEmp && (
              <div className="p-5 bg-gradient-to-r from-rose-50 to-red-50/50 border border-rose-200/60 rounded-2xl flex items-start gap-4 shadow-sm mb-8">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 text-rose-600 shadow-sm">
                  <Icon name="ExclamationTriangleIcon" size={20} />
                </div>
                <div className="pt-2">
                  <p className="font-bold text-rose-900">{errorEmp}</p>
                </div>
              </div>
            )}

            {loadingEmp ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin shadow-sm" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  Loading roster...
                </p>
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <Icon
                    name="UserGroupIcon"
                    size={28}
                    className="text-slate-300"
                  />
                </div>
                <p className="text-lg font-bold text-slate-700">
                  No employees found
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1 mb-6">
                  Start building your team roster to distribute memberships.
                </p>
                <button
                  onClick={() =>
                    navigate("/employer-dashboard/employees/upload")
                  }
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition-colors"
                >
                  Add Your First Employee
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200/60">
                      <tr>
                        {[
                          "Employee",
                          "Status",
                          "Savings",
                          "Redemptions",
                          "Actions",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={`py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap ${h === "Redemptions" ? "hidden sm:table-cell text-right" : h === "Savings" ? "text-right" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {employees.map((emp) => {
                        const sc =
                          STATUS_CONFIG[emp.status] || STATUS_CONFIG.INVITED;
                        const act = actionLoading[emp.id];
                        return (
                          <tr
                            key={emp.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 shadow-sm border border-slate-300/50">
                                  <span className="text-slate-600 text-sm font-black">
                                    {(emp.name || "?").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">
                                    {emp.name}
                                  </p>
                                  <p className="text-xs font-medium text-slate-500 truncate">
                                    {emp.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider ${sc.cls}`}
                              >
                                <Icon name={sc.icon} size={12} /> {sc.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-black text-emerald-600">
                              {currency(emp.totalSavings || 0)}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-slate-600 hidden sm:table-cell">
                              {emp.totalRedemptions || 0}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                                {emp.status === "INVITED" && (
                                  <button
                                    onClick={() => handleResend(emp)}
                                    disabled={!!act}
                                    title="Resend invite"
                                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#1C4D8D] hover:border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-40 shadow-sm"
                                  >
                                    {act === "resend" ? (
                                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Icon
                                        name="PaperAirplaneIcon"
                                        size={16}
                                      />
                                    )}
                                  </button>
                                )}
                                {emp.status !== "REMOVED" && (
                                  <button
                                    onClick={() => setConfirmRemove(emp.id)}
                                    disabled={!!act}
                                    title="Remove employee"
                                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-40 shadow-sm"
                                  >
                                    <Icon name="TrashIcon" size={16} />
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
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Page {empPagination.page} of {empPagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEmpPage((p) => Math.max(1, p - 1))}
                        disabled={empPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() =>
                          setEmpPage((p) =>
                            Math.min(empPagination.pages, p + 1),
                          )
                        }
                        disabled={empPage === empPagination.pages}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <h2
                className="text-2xl font-bold text-slate-900 tracking-tight"
                style={HEADING_FONT}
              >
                Seat Management
              </h2>
              <button
                onClick={() => navigate("/employer-dashboard/bulk-purchase")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
              >
                <Icon name="PlusCircleIcon" size={18} /> Buy More Seats
              </button>
            </div>

            {loadingDash ? (
              <Skeleton rows={3} />
            ) : dashboard ? (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Visual seat usage bar */}
                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3
                      className="text-xl font-bold text-slate-900 tracking-tight"
                      style={HEADING_FONT}
                    >
                      Seat Usage
                    </h3>
                    <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                      {dashboard.seatsUsed} / {dashboard.seatsPurchased} Used
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/60 rounded-full h-4 mb-8 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#1C4D8D] transition-all duration-1000 ease-out"
                      style={{
                        width:
                          dashboard.seatsPurchased > 0
                            ? `${Math.min(100, (dashboard.seatsUsed / dashboard.seatsPurchased) * 100)}%`
                            : "0%",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-white/20 w-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-auto">
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
                        className="text-center bg-white border border-slate-100 shadow-sm rounded-2xl py-5"
                      >
                        <p
                          className={`text-3xl font-bold ${color}`}
                          style={HEADING_FONT}
                        >
                          {value}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1.5">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Plan details */}
                  <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-8">
                    <h3
                      className="text-xl font-bold text-slate-900 tracking-tight mb-6"
                      style={HEADING_FONT}
                    >
                      Plan Details
                    </h3>
                    <div className="space-y-4">
                      {[
                        [
                          "Plan Tier",
                          <span className="px-2.5 py-1 bg-blue-50 text-[#1C4D8D] rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-100">
                            {dashboard.planType || "—"}
                          </span>,
                        ],
                        [
                          "Seats Purchased",
                          <span className="font-bold text-slate-900">
                            {dashboard.seatsPurchased ?? 0}
                          </span>,
                        ],
                        [
                          "Plan Started",
                          <span className="font-bold text-slate-900">
                            {dashboard.planStartDate
                              ? new Date(
                                  dashboard.planStartDate,
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>,
                        ],
                        [
                          "Plan Expires",
                          <span className="font-bold text-slate-900">
                            {dashboard.planExpiryDate
                              ? new Date(
                                  dashboard.planExpiryDate,
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>,
                        ],
                        [
                          "Total Paid",
                          <span className="font-bold text-emerald-600">
                            {currency(dashboard.roi?.totalMembershipCost || 0)}
                          </span>,
                        ],
                      ].map(([label, value], i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center pb-4 border-b border-slate-200/60 last:border-0 last:pb-0"
                        >
                          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                            {label}
                          </span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan expiry notice */}
                  {dashboard.planExpiryDate && (
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-yellow-50/30 border border-amber-200/60 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 shadow-sm">
                          <Icon name="CalendarDaysIcon" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-amber-900 text-sm tracking-tight">
                            Plan expires soon
                          </p>
                          <p className="text-xs font-medium text-amber-700/80 mt-0.5">
                            {new Date(
                              dashboard.planExpiryDate,
                            ).toLocaleDateString("en-KY", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          navigate("/employer-dashboard/bulk-purchase")
                        }
                        className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        Renew Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <Icon
                    name="TicketIcon"
                    size={28}
                    className="text-slate-300"
                  />
                </div>
                <h3
                  className="text-xl font-bold text-slate-900 tracking-tight mb-2"
                  style={HEADING_FONT}
                >
                  No membership plan yet
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-6">
                  Purchase bulk memberships to start adding employees.
                </p>
                <button
                  onClick={() => navigate("/employer-dashboard/bulk-purchase")}
                  className="px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors shadow-md"
                >
                  Buy Memberships
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: PROFILE
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          loadingProfile || !profile ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#1C4D8D]/20 rounded-full animate-spin border-t-[#1C4D8D]" />
            </div>
          ) : (
            <EmployerProfileForm
              profile={profile}
              onSave={async (data) => {
                try {
                  const updated = await employerAPI.updateProfile(data);
                  setProfile(updated?.data || updated);
                  showToast("success", "Profile updated successfully!");
                } catch (err) {
                  showToast("error", err.message || "Failed to update profile");
                  throw err;
                }
              }}
            />
          )
        )}
      </div>
    </div>
  );
};

const EmployerProfileForm = ({ profile, onSave }) => {
  const [form, setForm] = useState({
    companyName: profile?.companyName || "",
    industry: profile?.industry || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    logoUrl: profile?.logoUrl || "",
    coverBannerUrl: profile?.coverBannerUrl || "",
    description: profile?.description || "",
    address: profile?.address || "",
    addressLine1: profile?.addressLine1 || "",
    addressLine2: profile?.addressLine2 || "",
    landmark: profile?.landmark || "",
    country: profile?.country || "Cayman Islands",
    district: profile?.district || "George Town",
  });

  const [galleryImages, setGalleryImages] = useState(profile?.imageUrls || []);
  const [documentUrls, setDocumentUrls] = useState(profile?.documentUrls || []);

  const defaultHours = [
    { day: "Monday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Tuesday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Wednesday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Thursday", open: "9:00 AM", close: "10:00 PM", closed: false },
    { day: "Friday", open: "9:00 AM", close: "11:00 PM", closed: false },
    { day: "Saturday", open: "10:00 AM", close: "11:00 PM", closed: false },
    { day: "Sunday", open: "10:00 AM", close: "9:00 PM", closed: true }
  ];
  const [hours, setHours] = useState(() => {
    if (profile?.workingHours) {
      try {
        const parsed = JSON.parse(profile.workingHours);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      } catch {}
    }
    return defaultHours;
  });

  const [socials, setSocials] = useState(() => {
    if (profile?.socialLinks) {
      try {
        const parsed = JSON.parse(profile.socialLinks);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handle = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadAPI.image(file);
      setForm((f) => ({ ...f, logoUrl: res.url || res.secure_url }));
    } catch {
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadAPI.image(file);
      setForm((f) => ({ ...f, coverBannerUrl: res.url || res.secure_url }));
    } catch {
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryAdd = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (galleryImages.length >= 6) {
      setError("Maximum of 6 gallery images allowed.");
      return;
    }
    setUploadingGallery(true);
    try {
      const res = await uploadAPI.image(files[0]);
      setGalleryImages((prev) => [...prev, res.url || res.secure_url]);
    } catch (err) {
      setError("Gallery upload failed: " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryRemove = (idx) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDocumentAdd = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (documentUrls.length >= 5) {
      setError("Maximum of 5 documents allowed.");
      return;
    }
    setUploadingDoc(true);
    try {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Document size must be under 10MB");
        return;
      }
      const res = await uploadAPI.document(file);
      setDocumentUrls((prev) => [...prev, res.url || res.secure_url]);
    } catch (err) {
      setError("Document upload failed: " + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDocumentRemove = (idx) => {
    setDocumentUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleHourToggle = (idx) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, closed: !h.closed } : h));
  };

  const handleHourTimeChange = (idx, field, value) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const addSocialLink = () => {
    setSocials((prev) => [...prev, { platform: "facebook", url: "" }]);
  };

  const handleSocialChange = (idx, field, value) => {
    setSocials((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSocialLink = (idx) => {
    setSocials((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        imageUrls: galleryImages,
        documentUrls,
        workingHours: JSON.stringify(hours),
        socialLinks: JSON.stringify(socials),
      };
      await onSave(payload);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, field, placeholder, type = "text" }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={handle(field)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors font-semibold"
      />
    </div>
  );

  const DISTRICTS = [
    "George Town", "West Bay", "Bodden Town", "North Side", "East End", "Cayman Brac", "Little Cayman"
  ];

  const TIME_OPTIONS = [
    "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", 
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", 
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", 
    "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "1:00 AM", "2:00 AM"
  ];

  const SOCIAL_PLATFORMS = [
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" }
  ];

  return (
    <form onSubmit={submit} className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm space-y-8 font-sans">
      <div>
        <h3 className="font-black text-slate-900 text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Employer Profile</h3>
        <p className="text-sm text-slate-400 mt-1 font-semibold">
          Update all elements of your public Employer profile page.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-semibold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 text-sm border-b pb-2 uppercase tracking-wider text-[11px] text-slate-400">Basic Information</h4>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Company/Employer Name *"
            field="companyName"
            placeholder="Cayman Enterprises Ltd"
          />
          <Field
            label="Industry"
            field="industry"
            placeholder="e.g. Financial Services, Construction"
          />
          <Field
            label="Phone"
            field="phone"
            placeholder="+1 (345) 555-0000"
            type="tel"
          />
          <Field
            label="Contact Email"
            field="email"
            placeholder="hr@caymanenterprises.ky"
            type="email"
          />
          <Field
            label="Website"
            field="website"
            placeholder="https://caymanenterprises.ky"
            type="url"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            About / Description
          </label>
          <textarea
            value={form.description}
            onChange={handle("description")}
            placeholder="Describe your company's focus, values, and services..."
            rows={4}
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors resize-none font-semibold"
          />
        </div>
      </div>

      {/* Location Details */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 text-sm border-b pb-2 uppercase tracking-wider text-[11px] text-slate-400">Address & Map Location</h4>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Address Line 1"
            field="addressLine1"
            placeholder="e.g. 50 Elgin Avenue"
          />
          <Field
            label="Address Line 2 (Optional)"
            field="addressLine2"
            placeholder="e.g. Governor's Square"
          />
          <Field
            label="Landmark"
            field="landmark"
            placeholder="e.g. Opposite Government Administration Building"
          />
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              District
            </label>
            <select
              value={form.district}
              onChange={handle("district")}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors font-semibold"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media & Gallery / Documents */}
      <div className="space-y-6">
        <h4 className="font-bold text-slate-800 text-sm border-b pb-2 uppercase tracking-wider text-[11px] text-slate-400">Media, Gallery & Document Attachments</h4>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Logo (Square)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1C4D8D] hover:file:bg-blue-100 cursor-pointer"
            />
            {uploadingLogo && (
              <p className="text-xs text-slate-400 mt-1 animate-pulse">Uploading logo...</p>
            )}
            {form.logoUrl && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Cover Banner (Landscape)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1C4D8D] hover:file:bg-blue-100 cursor-pointer"
            />
            {uploadingCover && (
              <p className="text-xs text-slate-400 mt-1 animate-pulse">Uploading banner...</p>
            )}
            {form.coverBannerUrl && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-28 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img
                    src={form.coverBannerUrl}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, coverBannerUrl: "" }))}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Business Images / Gallery (Maximum 6)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="relative rounded-xl h-20 border border-slate-200 overflow-hidden group shadow-sm bg-slate-50">
                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleGalleryRemove(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            {galleryImages.length < 6 && (
              <div className="relative border-2 border-dashed border-slate-300 hover:border-[#1C4D8D] rounded-xl h-20 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-blue-50/20 group">
                {uploadingGallery ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-slate-400 group-hover:text-[#1C4D8D] font-bold text-lg">+</span>
                    <span className="text-[10px] text-slate-400 group-hover:text-[#1C4D8D] uppercase font-bold tracking-wide">Add</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryAdd}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Document Uploads */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Documents (Maximum 5 PDFs/Docs)
          </label>
          <div className="space-y-2">
            {documentUrls.map((url, i) => {
              const filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0] || `document_${i + 1}.pdf`;
              const decodedName = decodeURIComponent(filename);
              return (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-md">📎 {decodedName}</span>
                  <button
                    type="button"
                    onClick={() => handleDocumentRemove(i)}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors flex items-center gap-1"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            {documentUrls.length < 5 && (
              <div className="relative border-2 border-dashed border-slate-300 hover:border-[#1C4D8D] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-blue-50/10 text-center">
                {uploadingDoc ? (
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-950 rounded-full animate-spin mb-2" />
                ) : (
                  <>
                    <span className="text-slate-500 font-extrabold text-sm">Upload PDF / Word document</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Files must be under 10MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleDocumentAdd}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 text-sm border-b pb-2 uppercase tracking-wider text-[11px] text-slate-400">Opening Hours</h4>
        <div className="space-y-3">
          {hours.map((h, idx) => (
            <div 
              key={h.day}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 rounded-xl border transition-all ${h.closed ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200"}`}
            >
              <span className="font-bold text-slate-800 w-28 text-sm">{h.day}</span>
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <select
                  value={h.open}
                  disabled={h.closed}
                  onChange={(e) => handleHourTimeChange(idx, "open", e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 focus:outline-none"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-slate-400 text-xs font-bold">to</span>
                <select
                  value={h.close}
                  disabled={h.closed}
                  onChange={(e) => handleHourTimeChange(idx, "close", e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 focus:outline-none"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleHourToggle(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${h.closed ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100"}`}
              >
                {h.closed ? "Open" : "Closed"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-[11px] text-slate-400">Social Media Links</h4>
          <button
            type="button"
            onClick={addSocialLink}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
          >
            + Add Social Link
          </button>
        </div>
        
        {socials.length === 0 ? (
          <p className="text-slate-400 text-xs italic">No social links added yet.</p>
        ) : (
          <div className="space-y-3">
            {socials.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <select
                  value={s.platform}
                  onChange={(e) => handleSocialChange(idx, "platform", e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={s.url}
                  onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] font-semibold"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(idx)}
                  className="w-10 h-10 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center text-rose-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-black text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
      >
        {saving ? "Saving Profile..." : "Save Profile Details"}
      </button>
    </form>
  );
};

export default EmployerDashboardContent;
