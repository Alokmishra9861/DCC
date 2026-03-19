// Frontend/src/admin/component/finance/Finance.jsx
// Finance dashboard: revenue overview, export CSV, recent transactions

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyticsAPI, adminAPI } from "../../../../src/services/api";

const fmt = (n = 0) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${Number(n).toFixed(2)}`;

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-slate-900">
          ${Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <span className="text-lg">{icon}</span>
    </div>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const Finance = () => {
  const [period, setPeriod] = useState("month");
  const [overview, setOverview] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [overviewRes, tsRes, catRes] = await Promise.allSettled([
          analyticsAPI.getOverview(period),
          analyticsAPI.getTimeSeries(period),
          analyticsAPI.getSavingsByCategory(period),
        ]);
        if (!isMounted) return;
        if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
        if (tsRes.status === "fulfilled") setTimeSeries(tsRes.value);
        if (catRes.status === "fulfilled") setByCategory(catRes.value || []);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load finance data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [period]);

  const handleExport = async () => {
    setExporting(true);
    setExportMsg("");
    try {
      const result = await analyticsAPI.exportReport({ period });
      setExportMsg(`✓ Export successful: ${result.filename}`);
    } catch (err) {
      setExportMsg("Export failed: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(""), 4000);
    }
  };

  // Monthly data for area chart
  const monthlyData = timeSeries
    ? [
        {
          period: "Previous",
          revenue: timeSeries.previous?.saleAmount ?? 0,
          savings: timeSeries.previous?.savingsAmount ?? 0,
        },
        {
          period: "Current",
          revenue: timeSeries.current?.saleAmount ?? 0,
          savings: timeSeries.current?.savingsAmount ?? 0,
        },
      ]
    : [];

  const categoryData = byCategory
    .map((c) => ({
      name: c.businessCategory || "Other",
      revenue: c._sum?.saleAmount || 0,
      savings: c._sum?.savingsAmount || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const PERIODS = ["today", "week", "month", "quarter", "year"];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Revenue, savings and transaction reporting
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  period === p
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] transition-colors disabled:opacity-60"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "↓"
            )}
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {exportMsg && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${exportMsg.includes("failed") ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}
        >
          {exportMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={fmt(overview?.totalRevenue)}
            sub={`Period: ${period}`}
            icon="💰"
          />
          <StatCard
            label="Total Savings"
            value={fmt(overview?.totalSavings)}
            sub="Delivered to members"
            icon="🏷️"
          />
          <StatCard
            label="Transactions"
            value={overview?.totalTransactions ?? 0}
            sub="Completed"
            icon="🔄"
          />
          <StatCard
            label="Active Members"
            value={overview?.activeMembers ?? 0}
            sub="With membership"
            icon="👥"
          />
        </div>
      )}

      {/* Revenue vs Savings chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-1">Revenue vs Savings</h3>
        <p className="text-xs text-slate-400 mb-5">
          Current vs previous {period}
        </p>
        {loading ? (
          <Skeleton className="h-52" />
        ) : monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C4D8D" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1C4D8D" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1C4D8D"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                name="Revenue"
                dot={{ fill: "#1C4D8D", r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#34d399"
                strokeWidth={2.5}
                fill="url(#savGrad)"
                name="Savings"
                dot={{ fill: "#34d399", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-55 flex items-center justify-center text-slate-300 text-sm">
            No data for this period
          </div>
        )}
      </div>

      {/* Revenue by category table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-900">Revenue by Category</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Top performing categories this {period}
          </p>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : categoryData.length === 0 ? (
          <div className="py-12 text-center text-slate-300 text-sm">
            No category data yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Category", "Revenue", "Savings", "Net"].map((h) => (
                    <th
                      key={h}
                      className={`py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider ${h === "Category" ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categoryData.map((cat, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full bg-[#1C4D8D] opacity-60"
                          style={{ opacity: 1 - i * 0.1 }}
                        />
                        <span className="font-medium text-slate-800">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-slate-900">
                      {fmt(cat.revenue)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-600 font-semibold">
                      {fmt(cat.savings)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          cat.revenue - cat.savings >= 0
                            ? "bg-blue-50 text-[#1C4D8D]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {fmt(cat.revenue - cat.savings)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Totals
                  </td>
                  <td className="py-3 px-5 text-right font-black text-slate-900">
                    {fmt(categoryData.reduce((s, c) => s + c.revenue, 0))}
                  </td>
                  <td className="py-3 px-5 text-right font-black text-emerald-600">
                    {fmt(categoryData.reduce((s, c) => s + c.savings, 0))}
                  </td>
                  <td className="py-3 px-5 text-right font-black text-[#1C4D8D]">
                    {fmt(
                      categoryData.reduce(
                        (s, c) => s + (c.revenue - c.savings),
                        0,
                      ),
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
