// Frontend/src/association/pages/AssociationDashboardContent.jsx
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Icon from "../../components/ui/AppIcon";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { associationAPI } from "../../../services/api";
import AnalyticsStatsPanel from "../../components/ui/AnalyticsStatsPanel";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };
const CHART_COLORS = ["#1C4D8D", "#4988C4", "#10b981", "#f59e0b", "#8b5cf6"];

const AssociationDashboardContent = () => {
  const [activeTab, setActiveTab] = useState("home");

  const [homeStats, setHomeStats] = useState({
    totalCompanies: 0,
    activeEmployees: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    upcomingRenewals: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [dateFilter, setDateFilter] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [companies, setCompanies] = useState([]);
  const [sortField, setSortField] = useState("employee_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyEmployees, setCompanyEmployees] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const [revenueSummary, setRevenueSummary] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
  });
  const [revenueFilter, setRevenueFilter] = useState("month");
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);

  const [analyticsOverview, setAnalyticsOverview] = useState({
    activeEmployees: 0,
    totalCost: 0,
    totalSavings: 0,
    returnMultiple: 0,
    associationProfit: 0,
  });
  const [analyticsCompanies, setAnalyticsCompanies] = useState([]);
  const [selectedAnalyticsCompany, setSelectedAnalyticsCompany] =
    useState(null);
  const [showCompanyAnalytics, setShowCompanyAnalytics] = useState(false);
  const [savingsBreakdown, setSavingsBreakdown] = useState(null);
  const [discountsByCategory, setDiscountsByCategory] = useState([]);
  const [certificateRedemptions, setCertificateRedemptions] = useState([]);

  const [renewalCompanies, setRenewalCompanies] = useState([]);
  const [renewalFilter, setRenewalFilter] = useState("30");

  const [loading, setLoading] = useState(false);
  const [associationStatus, setAssociationStatus] = useState("APPROVED");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (activeTab === "home") fetchHomeData();
    else if (activeTab === "companies") fetchCompanies();
    else if (activeTab === "revenue") fetchRevenueSummary();
    else if (activeTab === "analytics") fetchAnalyticsData();
    else if (activeTab === "renewals") fetchRenewalData();
  }, [activeTab, dateFilter, revenueFilter, renewalFilter]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [dashboard, members] = await Promise.all([
        associationAPI.getDashboard(),
        associationAPI.getMembers().catch(() => []),
      ]);

      if (dashboard?.status && dashboard.status !== "APPROVED") {
        setAssociationStatus(dashboard.status);
        setStatusMessage(
          dashboard.message || "Your association is pending approval",
        );
      }

      const summary = dashboard?.summary || {
        totalMembershipCost: 0,
        totalSavings: 0,
        roi: 0,
      };
      const totalMembers = dashboard?.totalMembers ?? members?.length ?? 0;
      const companyCount = new Set(
        (members || []).map((member) => member.employerId).filter(Boolean),
      ).size;
      const totalRevenue = summary.totalMembershipCost || 0;
      const totalCost = summary.totalSavings || 0;
      const totalProfit = totalRevenue - totalCost;
      const upcomingRenewals = (members || []).filter((member) => {
        const endDate = member.membership?.endDate
          ? new Date(member.membership.endDate)
          : null;
        if (!endDate) return false;
        const now = new Date();
        const inThirtyDays = new Date();
        inThirtyDays.setDate(now.getDate() + 30);
        return endDate >= now && endDate <= inThirtyDays;
      }).length;

      setHomeStats({
        totalCompanies: companyCount,
        activeEmployees: totalMembers,
        totalRevenue,
        totalCost,
        totalProfit,
        upcomingRenewals,
      });
      setRevenueChartData(generateChartData(dateFilter));
      setCompanies(members || []);
    } catch (error) {
      console.error("Error fetching home data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (filter) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month) => ({ month, revenue: 0, cost: 0, profit: 0 }));
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const members = await associationAPI.getMembers();
      setCompanies(members || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const buildMemberRow = (member) => ({
    id: member.id,
    employee_name: `${member.firstName} ${member.lastName}`,
    email: member.user?.email || "—",
    phone: member.phone || "—",
    membership_status: member.membership?.status || "pending",
    expiry_date: member.membership?.endDate || null,
    district: member.district || "—",
    total_savings: member.totalSavings || 0,
    membership_cost: member.membership?.priceUSD || 0,
    net_benefit:
      (member.totalSavings || 0) - (member.membership?.priceUSD || 0),
  });

  const handleViewEmployees = (company) => {
    setSelectedCompany(company);
    setCompanyEmployees([buildMemberRow(company)]);
    setShowEmployeeModal(true);
  };

  const handleSort = (field) => {
    if (sortField === field)
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedMembers = [...companies].sort((a, b) => {
    const aRow = buildMemberRow(a);
    const bRow = buildMemberRow(b);
    const aValue = aRow[sortField] ?? "";
    const bValue = bRow[sortField] ?? "";
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const fetchRevenueSummary = async () => {
    setLoading(true);
    try {
      const [dashboard, members] = await Promise.all([
        associationAPI.getDashboard(),
        associationAPI.getMembers(),
      ]);
      const summary = dashboard?.summary || {
        totalMembershipCost: 0,
        totalSavings: 0,
      };
      const totalRevenue = summary.totalMembershipCost || 0;
      const totalCost = summary.totalSavings || 0;
      const totalProfit = totalRevenue - totalCost;
      const profitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      setRevenueSummary({ totalRevenue, totalCost, totalProfit, profitMargin });
      setRevenueBreakdown(
        (members || []).map((member) => buildMemberRow(member)),
      );
    } catch (error) {
      console.error("Error fetching revenue summary:", error);
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [dashboard, members] = await Promise.all([
        associationAPI.getDashboard(),
        associationAPI.getMembers(),
      ]);
      const summary = dashboard?.summary || {
        totalMembershipCost: 0,
        totalSavings: 0,
        roi: 0,
      };
      const totalCost = summary.totalMembershipCost || 0;
      const totalSavings = summary.totalSavings || 0;
      const associationProfit = totalSavings - totalCost;

      setAnalyticsOverview({
        activeEmployees: dashboard?.totalMembers ?? members?.length ?? 0,
        totalCost,
        totalSavings,
        returnMultiple: summary.roi || 0,
        associationProfit,
      });
      setAnalyticsCompanies(
        (members || []).map((member) => ({
          ...buildMemberRow(member),
          return_multiple: member.membership?.priceUSD
            ? (member.totalSavings || 0) / member.membership.priceUSD
            : 0,
        })),
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAnalyticsDetail = async () => {
    try {
      setSavingsBreakdown(null);
      setDiscountsByCategory([]);
      setCertificateRedemptions([]);
    } catch (error) {
      console.error("Error fetching company analytics detail:", error);
      toast.error("Failed to load company analytics");
    }
  };

  const handleViewCompanyAnalytics = async (company) => {
    setSelectedAnalyticsCompany(company);
    await fetchCompanyAnalyticsDetail();
    setShowCompanyAnalytics(true);
  };

  const fetchRenewalData = async () => {
    setLoading(true);
    try {
      const members = await associationAPI.getMembers();
      const now = new Date();
      const filtered = (members || []).filter((member) => {
        const endDate = member.membership?.endDate
          ? new Date(member.membership.endDate)
          : null;
        if (!endDate) return false;
        if (renewalFilter === "expired") return endDate < now;
        const threshold = new Date();
        threshold.setDate(now.getDate() + parseInt(renewalFilter, 10));
        return endDate >= now && endDate <= threshold;
      });
      setRenewalCompanies(filtered.map((member) => buildMemberRow(member)));
    } catch (error) {
      console.error("Error fetching renewal data:", error);
      toast.error("Failed to load renewal data");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (company) => {
    try {
      toast.success(
        `Reminder sent to ${company.employee_name || company.name || "member"}`,
      );
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const exportToCSV = (data, filename, headers) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const csvHeaders = headers || Object.keys(data[0]);
    const csvContent = [
      csvHeaders.join(","),
      ...data.map((row) =>
        csvHeaders.map((header) => JSON.stringify(row[header] || "")).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const handleExportMembers = () => {
    const exportData = companies.map((member) => ({
      member_name: `${member.firstName} ${member.lastName}`,
      email: member.user?.email || "",
      phone: member.phone || "",
      district: member.district || "",
      status: member.membership?.status || "pending",
      expiry_date: member.membership?.endDate || "",
      total_savings: member.totalSavings || 0,
      membership_cost: member.membership?.priceUSD || 0,
    }));
    exportToCSV(exportData, "association_members");
  };

  const exportRevenueToPDF = () => {
    exportToCSV(revenueBreakdown, "revenue_summary", [
      "employee_name",
      "membership_cost",
      "total_savings",
      "net_benefit",
    ]);
  };

  const getReturnMultipleColor = (rm) => {
    if (rm < 1) return "text-rose-600";
    if (rm < 2) return "text-amber-600";
    if (rm < 4) return "text-emerald-500";
    return "text-emerald-700";
  };

  const getStatusColor = (status) => {
    if (status === "active")
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
    if (status === "expiring_soon")
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
    if (status === "pending")
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-300";
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20";
  };

  const getStatusLabel = (status) => {
    if (status === "active") return "Active";
    if (status === "expiring_soon") return "Expiring Soon";
    if (status === "pending") return "Pending";
    return "Expired";
  };

  const getRenewalStatus = (endDate) => {
    if (!endDate) return "pending";
    const now = new Date();
    const end = new Date(endDate);
    if (end < now) return "expired";
    const soon = new Date();
    soon.setDate(now.getDate() + 30);
    if (end <= soon) return "expiring_soon";
    return "active";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#1C4D8D]/20">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-60">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50/40 to-teal-50/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <Toaster position="top-right" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Hero */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0A1628] via-[#1C4D8D] to-[#4988C4] p-10 md:p-14 shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
            <div className="relative z-10">
              <p className="text-blue-300/90 text-xs font-black uppercase tracking-[0.3em] mb-3">
                Dashboard
              </p>
              <h1
                className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md"
                style={HEADING_FONT}
              >
                Association Dashboard
              </h1>
              <p className="text-blue-100/90 text-lg font-medium">
                Manage your association members and revenue.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Approval Banner */}
        {associationStatus !== "APPROVED" && (
          <div className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-yellow-50/30 border border-amber-200/60 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in duration-500">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 shadow-sm">
              <Icon name="ExclamationTriangleIcon" size={20} />
            </div>
            <div className="pt-0.5">
              <h3 className="font-bold text-amber-900 tracking-tight">
                {associationStatus === "PENDING"
                  ? "Pending Admin Approval"
                  : "Status: " + associationStatus}
              </h3>
              <p className="text-sm font-medium text-amber-700/80 mt-1">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        <AnalyticsStatsPanel title="Association Analytics" />

        {/* Segmented Control Tabs */}
        <div className="mb-10">
          <div className="flex gap-1.5 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto w-fit">
            {[
              { key: "home", label: "Overview", icon: "HomeIcon" },
              {
                key: "companies",
                label: "Companies",
                icon: "BuildingOfficeIcon",
              },
              { key: "revenue", label: "Revenue", icon: "CurrencyDollarIcon" },
              { key: "analytics", label: "Analytics", icon: "ChartBarIcon" },
              { key: "renewals", label: "Renewals", icon: "ClockIcon" },
              { key: "profile", label: "Profile", icon: "UserCircleIcon" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={18}
                  className={
                    activeTab === tab.key ? "opacity-100" : "opacity-70"
                  }
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mb-20">
          {/* ── Home / Overview ── */}
          {activeTab === "home" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2
                    className="text-2xl font-bold text-slate-900 tracking-tight"
                    style={HEADING_FONT}
                  >
                    Dashboard Overview
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Key performance metrics at a glance
                  </p>
                </div>
                <button
                  onClick={handleExportMembers}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 font-bold text-sm shadow-sm hover:shadow"
                >
                  <Icon name="ArrowDownTrayIcon" size={18} /> Export Members
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: "BuildingOfficeIcon",
                    color: "bg-blue-500",
                    value: homeStats.totalCompanies,
                    label: "Total Companies",
                    bgLight: "bg-blue-50",
                  },
                  {
                    icon: "UsersIcon",
                    color: "bg-emerald-500",
                    value: homeStats.activeEmployees,
                    label: "Active Employees",
                    bgLight: "bg-emerald-50",
                  },
                  {
                    icon: "CurrencyDollarIcon",
                    color: "bg-indigo-500",
                    value: `$${homeStats.totalRevenue.toFixed(2)}`,
                    label: "Total Revenue",
                    bgLight: "bg-indigo-50",
                  },
                  {
                    icon: "BanknotesIcon",
                    color: "bg-rose-500",
                    value: `$${homeStats.totalCost.toFixed(2)}`,
                    label: "Total Cost",
                    bgLight: "bg-rose-50",
                  },
                  {
                    icon: "ArrowTrendingUpIcon",
                    color: "bg-emerald-600",
                    value: `$${homeStats.totalProfit.toFixed(2)}`,
                    label: "Total Profit",
                    bgLight: "bg-emerald-50",
                  },
                  {
                    icon: "ClockIcon",
                    color: "bg-amber-500",
                    value: homeStats.upcomingRenewals,
                    label: "Upcoming Renewals (30 Days)",
                    bgLight: "bg-amber-50",
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`w-14 h-14 ${card.bgLight} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon
                          name={card.icon}
                          size={28}
                          className={card.color.replace("bg-", "text-")}
                        />
                      </div>
                      <div>
                        <p
                          className="text-3xl font-bold text-slate-900 tracking-tight"
                          style={HEADING_FONT}
                        >
                          {card.value}
                        </p>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">
                          {card.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h2
                    className="text-2xl font-bold text-slate-900 tracking-tight"
                    style={HEADING_FONT}
                  >
                    Revenue vs Cost vs Profit
                  </h2>
                  <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    {["month", "quarter", "year", "custom"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setDateFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${dateFilter === f ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                {dateFilter === "custom" && (
                  <div className="flex gap-4 mb-8">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20"
                    />
                  </div>
                )}
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "#64748b",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                          padding: "12px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "#64748b",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        name="Cost"
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── Companies Tab ── */}
          {activeTab === "companies" && (
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
              <h2
                className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                style={HEADING_FONT}
              >
                Registered Members
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      {[
                        { f: "employee_name", l: "Member Name" },
                        { f: null, l: "Email" },
                        { f: null, l: "Phone" },
                        { f: "district", l: "District" },
                        { f: "membership_status", l: "Status" },
                        { f: "expiry_date", l: "Membership End" },
                        { f: null, l: "Actions" },
                      ].map((col, i) => (
                        <th
                          key={i}
                          className={`py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap ${col.f ? "cursor-pointer hover:text-[#1C4D8D] transition-colors" : ""}`}
                          onClick={() => col.f && handleSort(col.f)}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.l}
                            {col.f && sortField === col.f && (
                              <Icon
                                name={
                                  sortDirection === "asc"
                                    ? "ChevronUpIcon"
                                    : "ChevronDownIcon"
                                }
                                size={14}
                                className="text-[#1C4D8D]"
                              />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs"
                        >
                          Loading members...
                        </td>
                      </tr>
                    ) : companies.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-slate-500 font-bold"
                        >
                          No members found
                        </td>
                      </tr>
                    ) : (
                      sortedMembers.map((company) => {
                        const memberRow = buildMemberRow(company);
                        return (
                          <tr
                            key={company.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleViewEmployees(company)}
                                className="font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors text-left"
                              >
                                {memberRow.employee_name}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-500">
                              {memberRow.email}
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-500">
                              {memberRow.phone}
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-500">
                              {memberRow.district}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(memberRow.membership_status)}`}
                              >
                                {getStatusLabel(memberRow.membership_status)}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                              {memberRow.expiry_date
                                ? new Date(
                                    memberRow.expiry_date,
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleViewEmployees(company)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold uppercase tracking-wider"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Revenue Tab ── */}
          {activeTab === "revenue" && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                <h2
                  className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                  style={HEADING_FONT}
                >
                  Revenue Summary (P&L)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Total Revenue",
                      value: `$${revenueSummary.totalRevenue.toFixed(2)}`,
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                    },
                    {
                      label: "Total Cost",
                      value: `$${revenueSummary.totalCost.toFixed(2)}`,
                      bg: "bg-rose-50",
                      text: "text-rose-600",
                    },
                    {
                      label: "Total Profit",
                      value: `$${revenueSummary.totalProfit.toFixed(2)}`,
                      bg: "bg-emerald-50",
                      text: "text-emerald-600",
                    },
                    {
                      label: "Profit Margin %",
                      value: `${revenueSummary.profitMargin.toFixed(1)}%`,
                      bg: "bg-indigo-50",
                      text: "text-indigo-600",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        {card.label}
                      </p>
                      <p
                        className={`text-4xl font-bold tracking-tight ${card.text}`}
                        style={HEADING_FONT}
                      >
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2
                      className="text-2xl font-bold text-slate-900 tracking-tight"
                      style={HEADING_FONT}
                    >
                      Breakdown by Member
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                      {["month", "quarter", "year", "custom"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setRevenueFilter(f)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${revenueFilter === f ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={exportRevenueToPDF}
                      className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-800 transition-all flex items-center gap-2"
                    >
                      <Icon name="DocumentArrowDownIcon" size={18} /> PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200/60">
                      <tr>
                        {[
                          "Member",
                          "Membership Cost",
                          "Savings",
                          "Net Benefit",
                        ].map((h) => (
                          <th
                            key={h}
                            className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs"
                          >
                            Loading data...
                          </td>
                        </tr>
                      ) : revenueBreakdown.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-12 text-slate-500 font-bold"
                          >
                            No data available
                          </td>
                        </tr>
                      ) : (
                        revenueBreakdown.map((company) => (
                          <tr
                            key={company.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-4 px-6 font-bold text-slate-900">
                              {company.employee_name}
                            </td>
                            <td className="py-4 px-6 text-sm font-black text-slate-700">
                              $
                              {parseFloat(company.membership_cost || 0).toFixed(
                                2,
                              )}
                            </td>
                            <td className="py-4 px-6 text-sm font-black text-slate-700">
                              $
                              {parseFloat(company.total_savings || 0).toFixed(
                                2,
                              )}
                            </td>
                            <td className="py-4 px-6 text-sm font-black text-emerald-600 bg-emerald-50/30">
                              $
                              {parseFloat(
                                (company.total_savings || 0) -
                                  (company.membership_cost || 0),
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Analytics Tab ── */}
          {activeTab === "analytics" && !showCompanyAnalytics && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                <h2
                  className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                  style={HEADING_FONT}
                >
                  Analytics (Usage + Savings + ROI)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    {
                      label: "Active Employees",
                      value: analyticsOverview.activeEmployees,
                      color: "text-blue-600",
                      cols: "col-span-1",
                    },
                    {
                      label: "Total Cost",
                      value: `$${analyticsOverview.totalCost.toFixed(2)}`,
                      color: "text-rose-600",
                      cols: "col-span-1",
                    },
                    {
                      label: "Total Savings",
                      value: `$${analyticsOverview.totalSavings.toFixed(2)}`,
                      color: "text-indigo-600",
                      cols: "col-span-1",
                    },
                    {
                      label: "Return Multiple",
                      value:
                        analyticsOverview.totalCost > 0
                          ? `${analyticsOverview.returnMultiple.toFixed(1)}×`
                          : "N/A",
                      color: getReturnMultipleColor(
                        analyticsOverview.returnMultiple,
                      ),
                      cols: "col-span-1 md:col-span-2 lg:col-span-1",
                    },
                    {
                      label: "Association Profit",
                      value: `$${analyticsOverview.associationProfit.toFixed(2)}`,
                      color: "text-emerald-600",
                      cols: "col-span-1",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className={`bg-slate-50/50 rounded-3xl p-6 border border-slate-100 ${stat.cols}`}
                    >
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        {stat.label}
                      </p>
                      <p
                        className={`text-4xl font-bold tracking-tight ${stat.color}`}
                        style={HEADING_FONT}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                <h2
                  className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                  style={HEADING_FONT}
                >
                  Member Analytics
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200/60">
                      <tr>
                        {["Member", "Cost", "Savings", "Return", "Actions"].map(
                          (h) => (
                            <th
                              key={h}
                              className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs"
                          >
                            Loading data...
                          </td>
                        </tr>
                      ) : analyticsCompanies.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-12 text-slate-500 font-bold"
                          >
                            No data available
                          </td>
                        </tr>
                      ) : (
                        analyticsCompanies.map((company) => (
                          <tr
                            key={company.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <button
                                onClick={() =>
                                  handleViewCompanyAnalytics(company)
                                }
                                className="font-bold text-slate-900 hover:text-[#1C4D8D] transition-colors"
                              >
                                {company.employee_name}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-sm font-black text-slate-700">
                              $
                              {parseFloat(company.membership_cost || 0).toFixed(
                                2,
                              )}
                            </td>
                            <td className="py-4 px-6 text-sm font-black text-slate-700">
                              $
                              {parseFloat(company.total_savings || 0).toFixed(
                                2,
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`font-black ${getReturnMultipleColor(company.return_multiple)}`}
                              >
                                {company.return_multiple > 0
                                  ? `${company.return_multiple.toFixed(1)}×`
                                  : "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() =>
                                  handleViewCompanyAnalytics(company)
                                }
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold uppercase tracking-wider"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Individual Company Analytics View ── */}
          {activeTab === "analytics" &&
            showCompanyAnalytics &&
            selectedAnalyticsCompany && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <button
                      onClick={() => setShowCompanyAnalytics(false)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-[#1C4D8D] transition-colors"
                    >
                      <Icon name="ArrowLeftIcon" size={20} />
                    </button>
                    <h1
                      className="text-3xl font-bold text-slate-900 tracking-tight"
                      style={HEADING_FONT}
                    >
                      {selectedAnalyticsCompany.employee_name}
                    </h1>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Membership Cost
                      </p>
                      <p
                        className="text-4xl font-bold text-slate-900"
                        style={HEADING_FONT}
                      >
                        $
                        {parseFloat(
                          selectedAnalyticsCompany.membership_cost || 0,
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                        Total Savings
                      </p>
                      <p
                        className="text-4xl font-bold text-indigo-600"
                        style={HEADING_FONT}
                      >
                        $
                        {parseFloat(
                          selectedAnalyticsCompany.total_savings || 0,
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100">
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-600/70 mb-2">
                        Return Multiple
                      </p>
                      <p
                        className={`text-4xl font-bold ${getReturnMultipleColor(selectedAnalyticsCompany.return_multiple)}`}
                        style={HEADING_FONT}
                      >
                        {selectedAnalyticsCompany.return_multiple > 0
                          ? `${selectedAnalyticsCompany.return_multiple.toFixed(1)}× Return`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placeholder for detailed breakdown - retaining original logic condition */}
                {savingsBreakdown && (
                  <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                    <h2
                      className="text-2xl font-bold text-slate-900 tracking-tight mb-6"
                      style={HEADING_FONT}
                    >
                      Savings Breakdown by Channel
                    </h2>
                    {/* ... Existing savingsBreakdown mapping but with updated classes if data exists ... */}
                  </div>
                )}
              </div>
            )}

          {/* ── Renewals Tab ── */}
          {activeTab === "renewals" && (
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                  style={HEADING_FONT}
                >
                  Renewal Tracking
                </h2>
                <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                  {[
                    { k: "30", l: "30 Days" },
                    { k: "60", l: "60 Days" },
                    { k: "expired", l: "Expired" },
                  ].map((f) => (
                    <button
                      key={f.k}
                      onClick={() => setRenewalFilter(f.k)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${renewalFilter === f.k ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      {[
                        "Member Name",
                        "Email",
                        "Phone",
                        "Status",
                        "Renewal Date",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs"
                        >
                          Loading data...
                        </td>
                      </tr>
                    ) : renewalCompanies.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-slate-500 font-bold"
                        >
                          No members found
                        </td>
                      </tr>
                    ) : (
                      renewalCompanies.map((company) => (
                        <tr
                          key={company.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {company.employee_name}
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500">
                            {company.email}
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500">
                            {company.phone}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(getRenewalStatus(company.expiry_date))}`}
                            >
                              {getStatusLabel(
                                getRenewalStatus(company.expiry_date),
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                            {company.expiry_date
                              ? new Date(
                                  company.expiry_date,
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleSendReminder(company)}
                              className="px-4 py-2 bg-[#1C4D8D] text-white rounded-lg hover:bg-blue-800 transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
                            >
                              Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm text-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Icon
                  name="UserCircleIcon"
                  size={32}
                  className="text-slate-400"
                />
              </div>
              <h2
                className="text-2xl font-bold text-slate-900 tracking-tight mb-2"
                style={HEADING_FONT}
              >
                Company Profile
              </h2>
              <p className="text-slate-500 font-medium">
                Profile management tools are coming soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Details Modal */}
      {showEmployeeModal && selectedCompany && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2
                className="text-2xl font-bold text-slate-900"
                style={HEADING_FONT}
              >
                {selectedCompany.firstName} {selectedCompany.lastName}
              </h2>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-8">
              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      {[
                        "Employee Name",
                        "Email",
                        "Phone",
                        "Status",
                        "Expiry Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {companyEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-12 text-slate-500 font-medium"
                        >
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      companyEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {employee.employee_name}
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500">
                            {employee.email}
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500">
                            {employee.phone}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(employee.membership_status)}`}
                            >
                              {getStatusLabel(employee.membership_status)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                            {employee.expiry_date
                              ? new Date(
                                  employee.expiry_date,
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociationDashboardContent;
