// Frontend/src/user/pages/AdminDashboard/AdminDashboardContent.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminAPI, analyticsAPI } from "../../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n ?? 0);

const pct = (val) => {
  if (val == null) return null;
  return val >= 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`;
};

const PIE_COLORS = [
  "#1C4D8D",
  "#4988C4",
  "#34d399",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
];

const QUICK_LINKS = [
  {
    label: "Members",
    sub: "View & manage",
    icon: "👥",
    to: "/admin/members",
    color: "#1C4D8D",
    bg: "#EBF2FF",
  },
  {
    label: "Businesses",
    sub: "Approve & manage",
    icon: "🏪",
    to: "/admin/businesses",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    label: "Approvals",
    sub: "Pending actions",
    icon: "✅",
    to: "/admin/approvals",
    color: "#d97706",
    bg: "#FFFBEB",
  },
  {
    label: "Analytics",
    sub: "Revenue & insights",
    icon: "📊",
    to: "/admin/analytics",
    color: "#7c3aed",
    bg: "#F5F3FF",
  },
  {
    label: "Ads",
    sub: "Manage banners",
    icon: "📢",
    to: "/admin/settings",
    color: "#0891b2",
    bg: "#ECFEFF",
  },
  {
    label: "Reports",
    sub: "Export CSV",
    icon: "📁",
    to: "/admin/finance",
    color: "#be123c",
    bg: "#FFF1F2",
  },
];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, bg, change }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ background: bg }}
      >
        {icon}
      </div>
      {change != null && (
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            parseFloat(change) >= 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1">
        {value}
      </p>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Tooltip ───────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />
);

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [memberDemo, setMemberDemo] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [statsRes, tsRes, demoRes] = await Promise.allSettled([
        adminAPI.getStats(),
        analyticsAPI.getTimeSeries("month"),
        analyticsAPI.getMembershipAnalytics({}),
      ]);

      if (statsRes.status === "fulfilled") {
        const s = statsRes.value;
        setStats(s);
        if (Array.isArray(s?.recentMembers)) setRecentMembers(s.recentMembers);
        if (Array.isArray(s?.recentBusinesses))
          setRecentBusinesses(s.recentBusinesses);
        if (s?.totalPending !== undefined) setPendingCount(s.totalPending);
      }
      if (tsRes.status === "fulfilled") setTimeSeries(tsRes.value);
      if (demoRes.status === "fulfilled") setMemberDemo(demoRes.value);
    } catch (e) {
      console.error("Admin dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = stats?.totalMembers ?? 0;
  const activeMembers = stats?.activeMembers ?? 0;
  const totalBusinesses = stats?.totalBusinesses ?? 0;
  const totalRevenue = timeSeries?.current?.saleAmount ?? 0;
  const totalSavings = stats?.totalSavings ?? 0;
  const totalTx = stats?.totalTransactions ?? 0;
  const revenueChange = pct(timeSeries?.changes?.saleAmount);
  const txChange = pct(timeSeries?.changes?.transactions);

  const trendData = timeSeries
    ? [
        {
          period: "Previous",
          revenue: timeSeries.previous?.saleAmount ?? 0,
          transactions: timeSeries.previous?.transactions ?? 0,
        },
        {
          period: "Current",
          revenue: timeSeries.current?.saleAmount ?? 0,
          transactions: timeSeries.current?.transactions ?? 0,
        },
      ]
    : [];

  const pieData = (memberDemo?.byType ?? []).filter((d) => d.value > 0);
  const districtData = (memberDemo?.byDistrict ?? [])
    .filter((d) => d.value > 0)
    .slice(0, 7);
  const monthlyData = memberDemo?.byMonth ?? [];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-5 pt-8 space-y-7">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1C4D8D] mb-1">
              Admin Console
            </p>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              Platform Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {pendingCount > 0 && (
            <Link
              to="/admin/approvals"
              className="inline-flex items-center gap-2.5 px-5 py-3 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 text-sm"
            >
              <span className="w-6 h-6 bg-white text-amber-600 rounded-full text-xs font-black flex items-center justify-center">
                {pendingCount}
              </span>
              Pending Approvals
            </Link>
          )}
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Members"
              value={fmt(totalMembers)}
              sub={`${activeMembers} active`}
              icon="👥"
              bg="#EBF2FF"
            />
            <StatCard
              label="Active Businesses"
              value={fmt(totalBusinesses)}
              sub="Approved listings"
              icon="🏪"
              bg="#ECFDF5"
            />
            <StatCard
              label="Total Revenue"
              value={`$${fmt(totalRevenue)}`}
              sub="This month"
              icon="💰"
              bg="#FFFBEB"
              change={revenueChange}
            />
            <StatCard
              label="Transactions"
              value={fmt(totalTx)}
              sub="This month"
              icon="🔄"
              bg="#F5F3FF"
              change={txChange}
            />
          </div>
        )}

        {/* ── Savings highlight banner ─────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] rounded-2xl p-7 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">
                Platform Impact
              </p>
              <h2 className="text-4xl font-black text-white mb-1">
                ${fmt(totalSavings)}
              </h2>
              <p className="text-blue-200 text-sm">
                Total savings delivered to members
              </p>
            </div>
            <div className="flex gap-8">
              {[
                { label: "Members", value: fmt(totalMembers) },
                { label: "Businesses", value: fmt(totalBusinesses) },
                { label: "Transactions", value: fmt(totalTx) },
              ].map(({ label, value }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div className="w-px bg-white/20" />}
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{value}</p>
                    <p className="text-blue-200 text-xs mt-1">{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick links ──────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-slate-700 mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {QUICK_LINKS.map(({ label, sub, icon, to, bg }) => (
              <Link
                key={label}
                to={to}
                className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center text-center gap-2"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200"
                  style={{ background: bg }}
                >
                  {icon}
                </div>
                <p className="text-xs font-bold text-slate-900">{label}</p>
                <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                  {sub}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Charts row 1 ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Revenue comparison */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900">Revenue Comparison</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current vs previous period
                </p>
              </div>
              {revenueChange && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    parseFloat(revenueChange) >= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {revenueChange}
                </span>
              )}
            </div>
            {loading ? (
              <Skeleton className="h-52" />
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={trendData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${fmt(v)}`}
                  />
                  <Tooltip content={<ChartTip prefix="$" />} />
                  <Bar
                    dataKey="revenue"
                    fill="#1C4D8D"
                    radius={[8, 8, 0, 0]}
                    name="Revenue"
                    maxBarSize={64}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[210px] flex items-center justify-center text-slate-300 text-sm">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Members by type */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">Members by Type</h3>
            <p className="text-xs text-slate-400 mb-5">
              Membership distribution
            </p>
            {loading ? (
              <Skeleton className="h-52" />
            ) : pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {pieData.map((d, i) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-xs text-slate-600">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* ── Charts row 2 ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Member growth */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">Member Growth</h3>
            <p className="text-xs text-slate-400 mb-5">New members per month</p>
            {loading ? (
              <Skeleton className="h-52" />
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#1C4D8D"
                        stopOpacity={0.12}
                      />
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
                  />
                  <Tooltip content={<ChartTip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#1C4D8D"
                    strokeWidth={2.5}
                    fill="url(#memberGrad)"
                    name="New Members"
                    dot={{ fill: "#1C4D8D", r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">
                No growth data yet
              </div>
            )}
          </div>

          {/* Members by district */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-1">
              Members by District
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Geographic distribution
            </p>
            {loading ? (
              <Skeleton className="h-52" />
            ) : districtData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={districtData}
                  layout="vertical"
                  margin={{ left: 8 }}
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
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Bar
                    dataKey="value"
                    fill="#4988C4"
                    radius={[0, 6, 6, 0]}
                    name="Members"
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">
                No district data yet
              </div>
            )}
          </div>
        </div>

        {/* ── Recent activity ───────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent members */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Recent Members</h3>
                <p className="text-xs text-slate-400">Latest registrations</p>
              </div>
              <Link
                to="/admin/members"
                className="text-xs font-semibold text-[#1C4D8D] hover:underline"
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-300 text-sm">
                No members yet
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {recentMembers.slice(0, 5).map((m, i) => (
                  <li
                    key={m.id || i}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#EBF2FF] flex items-center justify-center text-[#1C4D8D] font-bold text-sm flex-shrink-0">
                      {(m.firstName || m.user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {m.firstName || "—"} {m.lastName || ""}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {m.user?.email || "—"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        m.membership?.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {m.membership?.status ?? "PENDING"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent businesses */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">Recent Businesses</h3>
                <p className="text-xs text-slate-400">Latest listings</p>
              </div>
              <Link
                to="/admin/businesses"
                className="text-xs font-semibold text-[#1C4D8D] hover:underline"
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : recentBusinesses.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-300 text-sm">
                No businesses yet
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {recentBusinesses.slice(0, 5).map((b, i) => (
                  <li
                    key={b.id || i}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (b.name || "B")[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {b.name || "—"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {b.category?.name || "—"} ·{" "}
                        {b.district || "Cayman Islands"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        b.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {b.status ?? "PENDING"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
