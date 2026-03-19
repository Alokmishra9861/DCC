// Frontend/src/user/components/ui/MemberStatsBlock.jsx
// Fully wired to GET /api/member/savings?period=...
//
// API response shape (after request() unwraps { success, data }):
// {
//   period,
//   summary: { membershipCost, totalSavings, roi, roiLabel, netBenefit },
//   transactions: [{ saleAmount, savingsAmount, ... }],
//   certPurchases: [{ savingsAmount, ... }],
//   savingsByCategory: { "Food": 120, ... }
// }

import React, { useEffect, useState, useCallback } from "react";
import { memberAPI } from "../../../services/api";

// ── Period options — map to backend-accepted values ───────────────────────────
const PERIODS = [
  { key: "month", label: "Month" },
  { key: "3months", label: "3 Months" },
  { key: "year", label: "Year" },
  { key: "lifetime", label: "All time" },
];

// ── Stat tile ─────────────────────────────────────────────────────────────────
const Tile = ({ icon, label, value, sub, accent, loading }) => (
  <div
    className={`flex flex-col justify-between p-5 rounded-2xl border ${accent}`}
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xl leading-none">{icon}</span>
      <p className="text-xs font-bold uppercase tracking-wider opacity-60 leading-tight">
        {label}
      </p>
    </div>
    {loading ? (
      <div className="h-8 w-28 bg-current opacity-10 rounded-lg animate-pulse" />
    ) : (
      <p className="text-2xl font-black leading-none tracking-tight">{value}</p>
    )}
    {sub && <p className="text-xs mt-2 opacity-50 font-medium">{sub}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const MemberStatsBlock = () => {
  const [period, setPeriod] = useState("month");
  const [raw, setRaw] = useState(null); // full API response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // memberAPI.getSavings calls GET /api/member/savings?period=...
      // request() unwraps { success: true, data: { period, summary, transactions, certPurchases, ... } }
      const res = await memberAPI.getSavings(period);
      setRaw(res);

      // ── DEBUG: Log raw data to check for double-counting ──
      console.log("=== MemberStatsBlock Data Debug ===");
      console.log("Summary totalSavings:", res?.summary?.totalSavings);
      console.log("Transactions count:", res?.transactions?.length);
      console.log("Cert Purchases count:", res?.certPurchases?.length);
      const txSavings = res?.transactions?.reduce(
        (s, t) => s + (t.savingsAmount || 0),
        0,
      );
      const certSavings = res?.certPurchases?.reduce(
        (s, c) => s + (c.savingsAmount || 0),
        0,
      );
      console.log("Calculated TX savings:", txSavings);
      console.log("Calculated Cert savings:", certSavings);
      console.log("Sum (TX + Cert):", txSavings + certSavings);
      console.log("Transactions:", res?.transactions || []);
      console.log("Cert Purchases:", res?.certPurchases || []);
    } catch (err) {
      console.error("MemberStatsBlock error:", err.message);
      setError("Could not load stats");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Extract values from real API response ─────────────────────────────────
  const summary = raw?.summary ?? {};
  const transactions = raw?.transactions ?? [];
  const certPurchases = raw?.certPurchases ?? [];

  // summary fields (from buildMemberSummary)
  const totalSavings = summary.totalSavings ?? 0;
  const membershipCost = summary.membershipCost ?? 0;
  const roi = summary.roi ?? 0;
  const netBenefit = summary.netBenefit ?? 0;

  // derived fields (not in summary — calculated client-side)
  const txCount = transactions.length;
  const totalSpent =
    transactions.reduce((s, t) => s + (t.saleAmount || 0), 0) +
    certPurchases.reduce((s, c) => s + (c.amountPaid || 0), 0);
  const certsCount = certPurchases.length;

  // breakeven progress
  const breakevenPct =
    membershipCost > 0
      ? Math.min(100, (totalSavings / membershipCost) * 100)
      : totalSavings > 0
        ? 100
        : 0;
  const paidOff = totalSavings >= membershipCost && membershipCost > 0;
  const roiPositive = roi >= 1;

  return (
    <div className="mb-10 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
        <div>
          <h2 className="font-bold text-slate-900 text-base">
            My Savings Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing stats for:{" "}
            <span className="font-semibold text-slate-600">
              {PERIODS.find((p) => p.key === period)?.label}
            </span>
          </p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-6 py-3 text-xs text-red-500 bg-red-50 border-b border-red-100">
          {error} —{" "}
          <button onClick={load} className="underline font-semibold">
            retry
          </button>
        </div>
      )}

      {/* ── 6-tile grid ── */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Transactions */}
        <Tile
          icon="🔄"
          label="Transactions"
          value={txCount.toLocaleString()}
          sub="Redemptions"
          accent="bg-slate-50 border-slate-100 text-slate-800"
          loading={loading}
        />

        {/* Total Savings */}
        <Tile
          icon="💰"
          label="Total Savings"
          value={`$${totalSavings.toFixed(2)}`}
          sub="You saved"
          accent="bg-emerald-50 border-emerald-100 text-emerald-800"
          loading={loading}
        />

        {/* Total Spent */}
        <Tile
          icon="🛍️"
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          sub="At partners"
          accent="bg-blue-50 border-blue-100 text-[#1C4D8D]"
          loading={loading}
        />

        {/* Certs Purchased */}
        <Tile
          icon="🎟️"
          label="Certs Purchased"
          value={certsCount.toLocaleString()}
          sub="Certificates"
          accent="bg-violet-50 border-violet-100 text-violet-800"
          loading={loading}
        />

        {/* Membership Cost */}
        <Tile
          icon="💳"
          label="Membership Cost"
          value={membershipCost > 0 ? `$${membershipCost.toFixed(2)}` : "—"}
          sub="Annual fee"
          accent="bg-slate-50 border-slate-100 text-slate-700"
          loading={loading}
        />

        {/* ROI Multiplier */}
        <Tile
          icon={roiPositive ? "📈" : "📉"}
          label="ROI Multiplier"
          value={`${roi.toFixed(1)}×`}
          sub={roiPositive ? "Savings ÷ cost" : "Keep saving!"}
          accent={
            roiPositive
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-amber-50 border-amber-100 text-amber-800"
          }
          loading={loading}
        />
      </div>

      {/* ── Breakeven progress bar ── */}
      <div className="px-5 pb-5">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500">
              {membershipCost > 0
                ? `Savings toward $${membershipCost.toFixed(0)} membership breakeven`
                : "Total savings progress"}
            </p>
            <p className="text-xs font-bold text-slate-700">
              {breakevenPct.toFixed(0)}%
            </p>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                paidOff ? "bg-emerald-500" : "bg-[#1C4D8D]"
              }`}
              style={{ width: `${breakevenPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[11px] text-slate-400">$0</p>
            <p className="text-[11px] font-semibold">
              {paidOff ? (
                <span className="text-emerald-600">✓ Membership paid off!</span>
              ) : membershipCost > 0 ? (
                <span className="text-slate-400">
                  ${(membershipCost - totalSavings).toFixed(2)} to go
                </span>
              ) : (
                <span className="text-slate-400">
                  ${totalSavings.toFixed(2)} saved
                </span>
              )}
            </p>
          </div>

          {/* Net benefit callout */}
          {!loading && netBenefit !== 0 && membershipCost > 0 && (
            <div
              className={`mt-3 pt-3 border-t border-slate-200 flex items-center justify-between`}
            >
              <p className="text-xs text-slate-500">Net benefit this period</p>
              <p
                className={`text-sm font-black ${netBenefit >= 0 ? "text-emerald-600" : "text-amber-600"}`}
              >
                {netBenefit >= 0 ? "+" : ""}${netBenefit.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberStatsBlock;
