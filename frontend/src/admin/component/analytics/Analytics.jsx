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

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n ?? 0);

const PIE_COLORS = ["#1C4D8D", "#4988C4", "#34d399", "#f59e0b", "#8b5cf6"];

const ChartTip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
      {label}
    </p>
    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

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
          setByCategory(categoryRes.value);
        if (districtRes.status === "fulfilled")
          setByDistrict(districtRes.value);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">
            Platform performance and membership insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["today", "week", "month", "quarter", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${fmt(overview?.totalRevenue || 0)}`}
          sub={period}
        />
        <StatCard
          label="Total Savings"
          value={`$${fmt(overview?.totalSavings || 0)}`}
          sub={period}
        />
        <StatCard
          label="Transactions"
          value={fmt(overview?.totalTransactions || 0)}
          sub={period}
        />
        <StatCard
          label="Active Members"
          value={fmt(overview?.activeMembers || 0)}
          sub="All time"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-900">Revenue Comparison</h3>
            <p className="text-xs text-slate-400">Current vs previous period</p>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
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
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-300 text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-900">Members by Type</h3>
            <p className="text-xs text-slate-400">Membership distribution</p>
          </div>
          {memberType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={memberType}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {memberType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {memberType.map((d, i) => (
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
              No membership data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-900">Member Growth</h3>
            <p className="text-xs text-slate-400">New members per month</p>
          </div>
          {memberGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memberGrowth}>
                <defs>
                  <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
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

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-5">
            <h3 className="font-bold text-slate-900">Savings by Category</h3>
            <p className="text-xs text-slate-400">Top categories by savings</p>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${fmt(v)}`}
                />
                <Tooltip content={<ChartTip prefix="$" />} />
                <Bar
                  dataKey="savings"
                  fill="#4988C4"
                  radius={[6, 6, 0, 0]}
                  name="Savings"
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-300 text-sm">
              No category data yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="mb-5">
          <h3 className="font-bold text-slate-900">Savings by District</h3>
          <p className="text-xs text-slate-400">Member savings by district</p>
        </div>
        {districtData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
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
              <Tooltip content={<ChartTip prefix="$" />} />
              <Bar
                dataKey="savings"
                fill="#1C4D8D"
                radius={[0, 6, 6, 0]}
                name="Savings"
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-300 text-sm">
            No district data yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
