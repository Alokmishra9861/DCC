// Frontend/src/admin/component/analytics/Analytics.jsx
import React, { useEffect, useState } from "react";
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
import { analyticsAPI } from "../../../services/api";

/* ─── Premium Color Tokens ───────────────────────────────────────────── */
const BLUE = "#1C4D8D";
const PIE_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#3b82f6", // Blue
];

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n ?? 0);

/* ─── Shared UI Components ───────────────────────────────────────────── */

const ChartTip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-3.5 min-w-[140px] animate-in fade-in zoom-in duration-200">
      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          className="text-sm font-bold m-0 flex items-center justify-between gap-4"
          style={{ color: p.color || BLUE }}
        >
          <span className="opacity-80 font-medium">{p.name}</span>
          <span>
            {prefix}
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const Skel = ({ h = 200 }) => (
  <div
    className="bg-slate-100/80 rounded-2xl animate-pulse"
    style={{ height: h }}
  />
);

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 ease-out group relative overflow-hidden">
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-50 transition-colors pointer-events-none" />
    <div className="relative">
      <p className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">
        {label}
      </p>
      <p
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-1"
        style={{
          fontFamily: "'Playfair Display', serif",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      {sub && <p className="text-xs font-medium text-slate-400">{sub}</p>}
    </div>
  </div>
);

/* Horizontal bar chart for categorical breakdowns */
const HBarList = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <div className="py-12 text-center text-sm font-medium text-slate-400">
        No data yet
      </div>
    );
  const max = Math.max(...data.map((d) => d.value || d.count || 0), 1);
  return (
    <div className="space-y-3.5 overflow-x-auto pr-2">
      {data.map((d, i) => {
        const val = d.value ?? d.count ?? 0;
        const pct = Math.round((val / max) * 100);
        const color = PIE_COLORS[i % PIE_COLORS.length];
        return (
          <div
            key={d.name || d.label || i}
            className="flex items-center gap-4 group"
          >
            <div className="w-[80px] text-xs font-bold text-slate-600 truncate flex-shrink-0">
              {d.name || d.label}
            </div>
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${pct}%`, background: color }}
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
            <div className="min-w-[40px] text-xs font-bold text-slate-900 text-right flex-shrink-0">
              {val}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DonutCard = ({ title, sub, data, loading }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
    <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30">
      <h3
        className="text-lg font-bold text-slate-900 tracking-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h3>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{sub}</p>
    </div>
    <div className="p-6 flex-1 flex flex-col justify-center">
      {loading ? (
        <Skel />
      ) : data.length === 0 ? (
        <div className="min-h-[160px] flex items-center justify-center text-sm font-medium text-slate-400">
          No data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2.5 mt-6">
            {data.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {d.name}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900 bg-slate-100/80 px-2 py-1 rounded-lg">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

/* ─── Analytics breakdown tabs ───────────────────────────────────────────── */
const BREAKDOWN_TABS = [
  { key: "type", label: "Membership Type" },
  { key: "category", label: "Business Category" },
  { key: "district", label: "District" },
  { key: "age", label: "Age Group" },
  { key: "sex", label: "Gender" },
  { key: "salary", label: "Salary Level" },
];

const BreakdownSection = ({ membership, byCategory, loading }) => {
  const [tab, setTab] = useState("type");

  const datasets = {
    type: (membership?.byType || []).filter((d) => d.value > 0),
    category: (byCategory || [])
      .map((c) => ({
        name: c.businessCategory || "Other",
        value: c._sum?.saleAmount || 0,
      }))
      .slice(0, 10),
    district: (membership?.byDistrict || []).filter((d) => d.value > 0),
    age: (membership?.byAge || []).filter((d) => d.value > 0),
    sex: (membership?.bySex || []).filter((d) => d.value > 0),
    salary: (membership?.bySalary || []).filter((d) => d.value > 0),
  };

  const current = datasets[tab] || [];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30">
        <h3
          className="text-lg font-bold text-slate-900 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Analytics Breakdown
        </h3>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          Analyze data across all dimensions
        </p>
      </div>
      <div className="p-6">
        <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner overflow-x-auto mb-8">
          {BREAKDOWN_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                tab === t.key
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Skel h={220} />
        ) : tab === "type" || tab === "sex" ? (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={current}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {current.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <HBarList data={current} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <HBarList data={current} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const Analytics = () => {
  const [period, setPeriod] = useState("month");
  const [overview, setOverview] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [membership, setMembership] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byDistrict, setByDistrict] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [overviewRes, timeRes, memberRes, categoryRes, districtRes] =
          await Promise.allSettled([
            analyticsAPI.getOverview(period),
            analyticsAPI.getTimeSeries(period),
            analyticsAPI.getMembershipAnalytics({}),
            analyticsAPI.getSavingsByCategory(period),
            analyticsAPI.getSavingsByDistrict(period),
          ]);
        if (!isMounted) return;
        if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
        if (timeRes.status === "fulfilled") setTimeSeries(timeRes.value);
        if (memberRes.status === "fulfilled") setMembership(memberRes.value);
        if (categoryRes.status === "fulfilled")
          setByCategory(categoryRes.value || []);
        if (districtRes.status === "fulfilled")
          setByDistrict(districtRes.value || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load analytics.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [period]);

  const categoryData = byCategory
    .map((item) => ({
      name: item.businessCategory || "Uncategorized",
      savings: item._sum?.savingsAmount || 0,
      sales: item._sum?.saleAmount || 0,
    }))
    .slice(0, 8);

  const districtData = byDistrict
    .map((item) => ({
      name: item.memberDistrict || "Unknown",
      savings: item._sum?.savingsAmount || 0,
    }))
    .slice(0, 8);

  const memberGrowth = membership?.byMonth || [];
  const memberType = (membership?.byType || []).filter((d) => d.value > 0);

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

  const PERIODS = ["today", "week", "month", "quarter", "year"];

  if (loading && !overview)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-slate-50 to-slate-100">
        <span className="w-12 h-12 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin mb-4 shadow-sm" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Compiling Data...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-[#1C4D8D] uppercase mb-2">
              Admin Console
            </p>
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Analytics Overview
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Platform performance, revenue metrics, and membership insights.
            </p>
          </div>

          <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner overflow-x-auto">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 capitalize whitespace-nowrap ${
                  period === p
                    ? "bg-white text-[#1C4D8D] shadow-sm ring-1 ring-slate-200/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl text-sm font-medium text-red-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-red-500 bg-red-100 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
              !
            </span>
            {error}
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Total Revenue",
              value: `$${fmt(overview?.totalRevenue || 0)}`,
              sub: `This ${period}`,
            },
            {
              label: "Total Savings",
              value: `$${fmt(overview?.totalSavings || 0)}`,
              sub: `This ${period}`,
            },
            {
              label: "Total Memberships",
              value: fmt(overview?.totalMembers || 0),
              sub: "All time",
            },
            {
              label: "Total Transactions",
              value: fmt(overview?.totalTransactions || 0),
              sub: `This ${period}`,
            },
            {
              label: "Active Members",
              value: fmt(overview?.activeMembers || 0),
              sub: "Currently active",
            },
            {
              label: "Platform Spending",
              value: `$${fmt(overview?.totalRevenue || 0)}`,
              sub: `This ${period}`,
            },
          ].map((c) =>
            loading ? (
              <Skel key={c.label} h={130} />
            ) : (
              <StatCard key={c.label} {...c} />
            ),
          )}
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30">
              <h3
                className="text-lg font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Revenue Comparison
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Current vs previous period
              </p>
            </div>
            <div className="p-6 flex-1">
              {loading ? (
                <Skel h="100%" />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={trendData} barGap={12} margin={{ top: 20 }}>
                    <defs>
                      <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#1d4ed8"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${fmt(v)}`}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      content={<ChartTip prefix="$" />}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#barBlue)"
                      radius={[8, 8, 0, 0]}
                      name="Revenue"
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full min-h-[280px] flex items-center justify-center text-sm font-medium text-slate-400">
                  No revenue data yet
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <DonutCard
              title="Members by Type"
              sub="Membership distribution"
              data={memberType}
              loading={loading}
            />
          </div>
        </div>

        {/* Full breakdown section */}
        <div className="mb-8">
          <BreakdownSection
            membership={membership}
            byCategory={byCategory}
            loading={loading}
          />
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30">
              <h3
                className="text-lg font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Member Growth
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                New members per month
              </p>
            </div>
            <div className="p-6 flex-1">
              {loading ? (
                <Skel h="100%" />
              ) : memberGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={memberGrowth}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="mgGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
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
                    />
                    <Tooltip content={<ChartTip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#mgGrad2)"
                      name="Members"
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full min-h-[260px] flex items-center justify-center text-sm font-medium text-slate-400">
                  No growth data yet
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30">
              <h3
                className="text-lg font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Savings by Category
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Top categories by member savings
              </p>
            </div>
            <div className="p-6 flex-1">
              {loading ? (
                <Skel h="100%" />
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData} margin={{ top: 10 }}>
                    <defs>
                      <linearGradient
                        id="barPurple"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#6d28d9"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${fmt(v)}`}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      content={<ChartTip prefix="$" />}
                    />
                    <Bar
                      dataKey="savings"
                      fill="url(#barPurple)"
                      radius={[6, 6, 0, 0]}
                      name="Savings"
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full min-h-[260px] flex items-center justify-center text-sm font-medium text-slate-400">
                  No category data yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Savings by district */}
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden mb-12">
          <div className="px-6 py-5 border-b border-slate-100/80 bg-slate-50/30">
            <h3
              className="text-lg font-bold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Savings by District
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Member savings broken down by location
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <Skel h={280} />
            ) : districtData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={districtData}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <defs>
                    <linearGradient id="barAmber" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${fmt(v)}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={<ChartTip prefix="$" />}
                  />
                  <Bar
                    dataKey="savings"
                    fill="url(#barAmber)"
                    radius={[0, 8, 8, 0]}
                    name="Savings"
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="min-h-[280px] flex items-center justify-center text-sm font-medium text-slate-400">
                No district data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
