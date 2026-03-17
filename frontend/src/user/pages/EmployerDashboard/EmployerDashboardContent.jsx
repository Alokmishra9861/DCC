import React, { useEffect, useState } from "react";
import Icon from "../../components/ui/AppIcon";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AppImage from "../../components/ui/AppImage";
import { employerAPI, businessAPI, getUser } from "../../../services/api";
import AnalyticsStatsPanel from "../../components/ui/AnalyticsStatsPanel";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const EmployerDashboardContent = () => {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("directory");

  const [directory, setDirectory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [companyMemberships, setCompanyMemberships] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    if (user) {
      if (activeTab === "directory") fetchDirectory();
      else if (activeTab === "employees") fetchEmployees();
      else if (activeTab === "seats") fetchSeats();
      else if (activeTab === "analytics") fetchAnalytics();
    }
  }, [user, activeTab]);

  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const data = await businessAPI.getAll({ limit: 100 });
      const list = Array.isArray(data)
        ? data
        : data?.businesses || data?.items || [];
      setDirectory(list);
    } catch (error) {
      console.error("Error fetching directory:", error);
    } finally {
      setLoadingDirectory(false);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await employerAPI.getEmployees();
      const list = Array.isArray(data)
        ? data
        : data?.employees || data?.items || [];
      setEmployees(list);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchSeats = async () => {
    setLoadingSeats(true);
    try {
      const data = await employerAPI.getDashboard();
      setCompanyMemberships(data?.seats || data?.memberships || []);
    } catch (error) {
      console.error("Error fetching seats:", error);
    } finally {
      setLoadingSeats(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await employerAPI.getDashboard();
      setAnalyticsData(data?.analytics || null);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleToggleTravelLock = async (employeeId, currentStatus) => {
    try {
      await employerAPI.uploadEmployees({
        employeeId,
        travelLocked: !currentStatus,
      });
      setEmployees((prev) =>
        prev.map((e) =>
          (e._id || e.id) === employeeId
            ? { ...e, travelLocked: !currentStatus }
            : e,
        ),
      );
    } catch (error) {
      console.error("Error toggling travel lock:", error);
    }
  };

  const handleDeactivateEmployee = async (employeeId) => {
    if (!confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      await employerAPI.uploadEmployees({ employeeId, active: false });
      setEmployees((prev) =>
        prev.filter((e) => (e._id || e.id) !== employeeId),
      );
    } catch (error) {
      console.error("Error deactivating employee:", error);
    }
  };

  const filteredDirectory = directory.filter((item) => {
    const matchesSearch =
      item.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...Array.from(
      new Set(directory.map((item) => item.category).filter(Boolean)),
    ),
  ];
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Employer Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Manage your company memberships and employee benefits
          </p>
        </div>

        {/* Analytics Period Stats */}
        <AnalyticsStatsPanel title="Employee Benefits Analytics" />

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-10 overflow-hidden">
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {["directory", "employees", "seats", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "border-[#1C4D8D] text-[#1C4D8D]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab === "directory"
                    ? "B2B Directory"
                    : tab === "employees"
                      ? "Employees"
                      : tab === "seats"
                        ? "Seat Management"
                        : "Analytics"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "directory" && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <Icon
                          name="MagnifyingGlassIcon"
                          size={20}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search companies..."
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === "all" ? "All Categories" : cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {loadingDirectory ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredDirectory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredDirectory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-24 h-24 mb-4 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform duration-300">
                            {item.logo_url ? (
                              <AppImage
                                src={item.logo_url}
                                alt={item.company_name}
                                className="object-contain w-full h-full rounded-full"
                              />
                            ) : (
                              <Icon
                                name="BuildingOfficeIcon"
                                size={40}
                                className="text-slate-400"
                              />
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 mb-2 text-lg">
                            {item.company_name}
                          </h3>
                          {item.category && (
                            <span className="px-3 py-1 bg-blue-50 text-[#1C4D8D] text-xs font-bold rounded-full mb-2">
                              {item.category}
                            </span>
                          )}
                          {item.partner_type && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full mb-2">
                              {item.partner_type}
                            </span>
                          )}
                          {item.description && (
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-12 border border-dashed border-slate-200 text-center">
                    <Icon
                      name="BuildingOfficeIcon"
                      size={48}
                      className="mx-auto text-slate-300 mb-4"
                    />
                    <p className="text-slate-500">No companies found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "employees" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Employee Roster
                  </h2>
                  <button className="px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    <Icon name="PlusIcon" size={20} />
                    Upload Employees
                  </button>
                </div>

                {loadingEmployees ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : employees.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                            Name
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                            Email
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                            Status
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                            Travel Lock
                          </th>
                          <th className="text-right py-4 px-6 text-sm font-bold text-slate-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employees.map((employee) => (
                          <tr
                            key={employee.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-4 px-6 text-slate-900 font-medium">
                              {employee.full_name}
                            </td>
                            <td className="py-4 px-6 text-slate-500">
                              {employee.email}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${employee.status === "active" ? "bg-emerald-50 text-emerald-600" : employee.status === "pending" ? "bg-orange-50 text-orange-600" : employee.status === "travel_locked" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}
                              >
                                {employee.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {employee.is_travel_locked ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                                  <Icon name="LockClosedIcon" size={14} />
                                  Locked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                                  <Icon name="LockOpenIcon" size={14} />
                                  Unlocked
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleToggleTravelLock(
                                      employee.id,
                                      employee.is_travel_locked,
                                    )
                                  }
                                  className="px-3 py-1.5 text-sm bg-blue-50 text-[#1C4D8D] rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                >
                                  {employee.is_travel_locked
                                    ? "Unlock"
                                    : "Lock"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeactivateEmployee(employee.id)
                                  }
                                  className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                >
                                  Deactivate
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Icon
                      name="UsersIcon"
                      size={48}
                      className="mx-auto text-slate-300 mb-4"
                    />
                    <p className="text-slate-500">No employees found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "seats" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Seat Management
                  </h2>
                  <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                      <Icon name="ShoppingCartIcon" size={18} />
                      Buy Memberships
                    </button>
                    <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                      <Icon name="ArrowUpTrayIcon" size={18} />
                      Upload Employees
                    </button>
                  </div>
                </div>

                {loadingSeats ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : companyMemberships.length > 0 ? (
                  <div className="space-y-4">
                    {companyMemberships.map((membership) => (
                      <div
                        key={membership.id}
                        className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              Membership Year {membership.membership_year}
                            </h3>
                            <p className="text-sm text-slate-500">
                              Expires:{" "}
                              {new Date(
                                membership.expiry_date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${membership.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}
                          >
                            {membership.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">
                              Seats Purchased
                            </p>
                            <p className="text-3xl font-bold text-slate-900">
                              {membership.seats_purchased}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">
                              Seats Assigned
                            </p>
                            <p className="text-3xl font-bold text-[#1C4D8D]">
                              {membership.seats_assigned}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-500 mb-1 font-medium">
                              Available Seats
                            </p>
                            <p className="text-3xl font-bold text-emerald-600">
                              {membership.seats_purchased -
                                membership.seats_assigned}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Icon
                      name="TicketIcon"
                      size={48}
                      className="mx-auto text-slate-300 mb-4"
                    />
                    <p className="text-slate-500 mb-6">No memberships found</p>
                    <button className="px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-lg">
                      Purchase Your First Membership
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Employee Savings Analytics
                </h2>

                {loadingAnalytics ? (
                  <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : analyticsData ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] rounded-2xl p-8 text-white shadow-lg">
                      <p className="text-sm opacity-90 mb-2 font-medium">
                        Total Employee Savings
                      </p>
                      <p className="text-5xl font-bold">
                        ${analyticsData.totalSavings.toFixed(2)}
                      </p>
                      <p className="text-sm opacity-75 mt-2">
                        Across all employees and categories
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">
                          Savings by Category
                        </h3>
                        {analyticsData.savingsByCategory.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.savingsByCategory}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e2e8f0"
                              />
                              <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fill: "#64748b" }}
                              />
                              <YAxis tick={{ fill: "#64748b" }} />
                              <Tooltip
                                formatter={(value) =>
                                  `$${Number(value).toFixed(2)}`
                                }
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                              />
                              <Bar
                                dataKey="value"
                                fill="#3b82f6"
                                name="Savings"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-center py-12 text-slate-400">
                            No category data available
                          </p>
                        )}
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">
                          Usage Type Distribution
                        </h3>
                        {analyticsData.usageByType.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={analyticsData.usageByType}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                              >
                                {analyticsData.usageByType.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ),
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-center py-12 text-slate-400">
                            No usage data available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">
                        Monthly Savings Trend
                      </h3>
                      {analyticsData.monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analyticsData.monthlyTrend}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e2e8f0"
                            />
                            <XAxis dataKey="month" tick={{ fill: "#64748b" }} />
                            <YAxis tick={{ fill: "#64748b" }} />
                            <Tooltip
                              formatter={(value) =>
                                `$${Number(value).toFixed(2)}`
                              }
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="savings"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Savings"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center py-12 text-slate-400">
                          No trend data available
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Icon
                      name="ChartBarIcon"
                      size={48}
                      className="mx-auto text-slate-300 mb-4"
                    />
                    <p className="text-slate-500">
                      No analytics data available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardContent;
