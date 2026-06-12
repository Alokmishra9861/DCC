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
import { associationAPI, getUser, uploadAPI } from "../../../services/api";
import AnalyticsStatsPanel from "../../components/ui/AnalyticsStatsPanel";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };
const CHART_COLORS = ["#1C4D8D", "#4988C4", "#10b981", "#f59e0b", "#8b5cf6"];

const AssociationDashboardContent = () => {
  const user = getUser();
  const associationId = user?.association?.id || user?.association?._id || user?.profile?.id || user?.profile?._id;
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

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfileData = async () => {
    setLoadingProfile(true);
    try {
      const res = await associationAPI.getProfile();
      setProfile(res?.data || res);
    } catch (error) {
      console.error("Error fetching association profile:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (activeTab === "home") fetchHomeData();
    else if (activeTab === "companies") fetchCompanies();
    else if (activeTab === "revenue") fetchRevenueSummary();
    else if (activeTab === "analytics") fetchAnalyticsData();
    else if (activeTab === "renewals") fetchRenewalData();
    else if (activeTab === "profile") fetchProfileData();
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#1C4D8D]/20">
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
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
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
              {associationId && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.open(`/business-profile/${associationId}`, "_blank")}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 shadow-lg"
                  >
                    <Icon name="EyeIcon" size={18} /> View Live Profile
                  </button>
                </div>
              )}
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
            loadingProfile || !profile ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#1C4D8D]/20 rounded-full animate-spin border-t-[#1C4D8D]" />
              </div>
            ) : (
              <AssociationProfileForm
                profile={profile}
                onSave={async (data) => {
                  try {
                    const updated = await associationAPI.updateProfile(data);
                    setProfile(updated?.data || updated);
                    toast.success("Profile updated successfully!");
                  } catch (err) {
                    toast.error(err.message || "Failed to update profile");
                    throw err;
                  }
                }}
              />
            )
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

const AssociationProfileForm = ({ profile, onSave }) => {
  const [form, setForm] = useState({
    name: profile?.name || "",
    orgType: profile?.orgType || "",
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
    if (!form.name.trim()) {
      setError("Association name is required");
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
        <h3 className="font-black text-slate-900 text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Association Profile</h3>
        <p className="text-sm text-slate-400 mt-1 font-semibold">
          Update all elements of your public Association profile page.
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
            label="Association Name *"
            field="name"
            placeholder="Cayman Medical Association"
          />
          <Field
            label="Organization Type / Sub-label"
            field="orgType"
            placeholder="e.g. Non-profit, Trade Union"
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
            placeholder="contact@caymanmeds.ky"
            type="email"
          />
          <Field
            label="Website"
            field="website"
            placeholder="https://caymanmeds.ky"
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
            placeholder="Describe your organization's mission and background..."
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
            placeholder="e.g. 100 Hospital Road"
          />
          <Field
            label="Address Line 2 (Optional)"
            field="addressLine2"
            placeholder="e.g. 2nd Floor, Room 5"
          />
          <Field
            label="Landmark"
            field="landmark"
            placeholder="e.g. Next to GT Hospital"
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

export default AssociationDashboardContent;
