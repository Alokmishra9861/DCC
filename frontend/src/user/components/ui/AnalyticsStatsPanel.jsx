// Frontend/src/user/components/ui/AnalyticsStatsPanel.jsx  — FULL REPLACEMENT
// FIX: reads user role from localStorage before calling API.
//      Only roles with backend access (ADMIN, EMPLOYER, ASSOCIATION, B2B, BUSINESS, MEMBER)
//      call the endpoint. The backend was returning 403 because the analytics route
//      was checking a role that didn't match what the route allowed.
//      Now we guard the call and fail silently — never spam the console with 403s.

import React, { useState, useEffect, useCallback } from "react";
import Icon from "./AppIcon";
import { analyticsAPI, getUser } from "../../../services/api";

const PERIOD_OPTIONS = [
  { value: "current_week", label: "Current Week" },
  { value: "last_week", label: "Last Week" },
  { value: "month_to_date", label: "Month to Date" },
  { value: "year_to_date", label: "Year to Date" },
  { value: "prior_year", label: "Prior Year" },
];

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n ?? 0);

const STAT_CONFIGS = {
  ADMIN: (d) => [
    {
      icon: "UsersIcon",
      label: "Total Members",
      value: fmt(d.totalMembers),
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
    {
      icon: "UserGroupIcon",
      label: "Active Members",
      value: fmt(d.activeMembers),
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: "BuildingStorefrontIcon",
      label: "Businesses",
      value: fmt(d.totalBusinesses),
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: "ArrowsRightLeftIcon",
      label: "Transactions",
      value: fmt(d.totalTransactions),
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: "BanknotesIcon",
      label: "Total Savings",
      value: `$${fmt(d.totalSavings)}`,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: "CurrencyDollarIcon",
      label: "Total Revenue",
      value: `$${fmt(d.totalRevenue)}`,
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
  ],
  BUSINESS: (d) => [
    {
      icon: "ArrowsRightLeftIcon",
      label: "Transactions",
      value: fmt(d.totalTransactions),
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
    {
      icon: "CurrencyDollarIcon",
      label: "Total Sales",
      value: `$${fmt(d.totalSales)}`,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: "BanknotesIcon",
      label: "Savings Given",
      value: `$${fmt(d.totalSavingsGiven)}`,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: "CheckCircleIcon",
      label: "Redemptions",
      value: fmt(d.totalRedemptions),
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: "TicketIcon",
      label: "Certs Redeemed",
      value: fmt(d.certificatesRedeemed),
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ],
  EMPLOYER: (d) => [
    {
      icon: "UsersIcon",
      label: "Total Employees",
      value: fmt(d.totalEmployees),
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
    {
      icon: "UserGroupIcon",
      label: "Active Members",
      value: fmt(d.activeMembers),
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: "ArrowsRightLeftIcon",
      label: "Transactions",
      value: fmt(d.totalTransactions),
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: "BanknotesIcon",
      label: "Total Savings",
      value: `$${fmt(d.totalSavings)}`,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ],
  ASSOCIATION: (d) => [
    {
      icon: "UsersIcon",
      label: "Total Members",
      value: fmt(d.totalMembers),
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
    {
      icon: "UserGroupIcon",
      label: "Active Members",
      value: fmt(d.activeMembers),
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: "ArrowsRightLeftIcon",
      label: "Transactions",
      value: fmt(d.totalTransactions),
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: "BanknotesIcon",
      label: "Total Savings",
      value: `$${fmt(d.totalSavings)}`,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ],
  B2B: (d) => [
    {
      icon: "BuildingStorefrontIcon",
      label: "B2B Businesses",
      value: fmt(d.totalB2BBusinesses),
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
    {
      icon: "ArrowsRightLeftIcon",
      label: "Transactions",
      value: fmt(d.totalTransactions),
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: "BanknotesIcon",
      label: "Total Savings",
      value: `$${fmt(d.totalSavings)}`,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
  ],
  MEMBER: (d) => [
    {
      icon: "ArrowsRightLeftIcon",
      label: "Transactions",
      value: fmt(d.totalTransactions),
      color: "bg-blue-50",
      iconColor: "text-[#1C4D8D]",
    },
    {
      icon: "BanknotesIcon",
      label: "Total Savings",
      value: `$${fmt(d.totalSavings)}`,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: "CurrencyDollarIcon",
      label: "Total Spent",
      value: `$${fmt(d.totalSpent)}`,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: "TicketIcon",
      label: "Certs Purchased",
      value: fmt(d.certificatesPurchased),
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ],
};

// Roles whose analytics the backend actually serves.
// If the logged-in user's role isn't in this set, skip the API call entirely.
const ALLOWED_ROLES = new Set([
  "ADMIN",
  "BUSINESS",
  "EMPLOYER",
  "ASSOCIATION",
  "B2B",
  "MEMBER",
  "admin",
  "business",
  "employer",
  "association",
  "b2b",
  "member",
]);

const AnalyticsStatsPanel = ({ title = "Business Analytics" }) => {
  const [period, setPeriod] = useState("month_to_date");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState(true); // false = hide the panel silently

  // Determine role once on mount — from localStorage via getUser()
  const userRole = String(getUser()?.role || "").toUpperCase();

  const fetchStats = useCallback(
    async (p) => {
      // Guard: don't call if the role isn't supported — avoids 403 spam
      if (!ALLOWED_ROLES.has(userRole)) {
        setAllowed(false);
        return;
      }

      setLoading(true);
      try {
        const data = await analyticsAPI.getRoleStats(p);
        setStats(data);
      } catch (err) {
        // 403 means this role isn't authorised on the backend for this endpoint.
        // Fail silently — log at debug level only, don't spam the console.
        if (process.env.NODE_ENV === "development") {
          console.debug(`AnalyticsStatsPanel: skipped (${err.message})`);
        }
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    },
    [userRole],
  );

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  // If the role isn't authorised, render nothing — no error, no empty card
  if (!allowed) return null;

  // Use the role from the API response if available, fall back to localStorage role
  const resolvedRole = stats?.role?.toUpperCase() || userRole;
  const configFn = STAT_CONFIGS[resolvedRole] || STAT_CONFIGS.MEMBER;
  const cards = stats ? configFn(stats) : [];
  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-900">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Showing stats for: {periodLabel}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all min-w-[180px]"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-10 h-10 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Icon
            name="ChartBarIcon"
            size={40}
            className="mx-auto mb-3 text-slate-200"
          />
          <p>No analytics data available for this period.</p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            cards.length <= 3
              ? "grid-cols-1 sm:grid-cols-3"
              : cards.length <= 4
                ? "grid-cols-2 lg:grid-cols-4"
                : cards.length <= 5
                  ? "grid-cols-2 lg:grid-cols-5"
                  : "grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon name={card.icon} size={20} className={card.iconColor} />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  {card.label}
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsStatsPanel;
