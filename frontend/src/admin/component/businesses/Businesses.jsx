// Frontend/src/admin/component/businesses/Businesses.jsx
import React, { useEffect, useState } from "react";
import { adminAPI } from "../../../services/api";

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryName: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    website: "",
    status: "PENDING",
  });

  const loadBusinesses = async (nextFilter = filter) => {
    setLoading(true);
    setError("");
    try {
      let params = {};
      if (nextFilter === "pending") params = { status: "PENDING" };
      else if (nextFilter === "approved") params = { status: "APPROVED" };
      else if (nextFilter === "rejected") params = { status: "REJECTED" };
      const data = await adminAPI.getBusinesses(params);
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses(filter);
  }, [filter]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await adminAPI.approveBusiness(id);
      await loadBusinesses(filter);
    } catch (err) {
      setError(err.message || "Failed to approve business.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    setApprovingId(id);
    try {
      await adminAPI.rejectBusiness(id);
      await loadBusinesses(filter);
    } catch (err) {
      setError(err.message || "Failed to reject business.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    setApprovingId(userId);
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      await loadBusinesses(filter);
    } catch (err) {
      setError(err.message || "Failed to update user status.");
    } finally {
      setApprovingId(null);
    }
  };

  const openEdit = (business) => {
    setEditingBusiness(business);
    setEditForm({
      name: business.name || "",
      categoryName: business.category?.name || "",
      description: business.description || "",
      phone: business.phone || "",
      email: business.email || "",
      address: business.address || "",
      district: business.district || "",
      website: business.website || "",
      status: business.status || "PENDING",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBusiness?.id) return;
    try {
      const payload = {
        ...editForm,
        categoryName: editForm.categoryName?.trim() || undefined,
      };
      await adminAPI.updateBusiness(editingBusiness.id, payload);
      setShowEditModal(false);
      setEditingBusiness(null);
      await loadBusinesses(filter);
    } catch (err) {
      setError(err.message || "Failed to update business.");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1
            className="text-3xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Business Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Manage, approve, and edit business registrations.
          </p>
        </div>

        {/* Filters - Segmented Control Style */}
        <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner overflow-x-auto">
          {[
            { key: "pending", label: "Pending", icon: "⏳" },
            { key: "approved", label: "Approved", icon: "✓" },
            { key: "rejected", label: "Rejected", icon: "✕" },
            { key: "all", label: "All", icon: "📋" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                filter === item.key
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <span
                className={`text-[11px] ${filter === item.key ? "opacity-100" : "opacity-70"}`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl text-sm font-medium text-red-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-red-500 bg-red-100 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
            !
          </span>
          {error}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <span className="w-10 h-10 border-4 border-slate-100 border-t-[#1C4D8D] rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500 animate-pulse">
              Loading businesses...
            </p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5 text-2xl ring-1 ring-slate-100 shadow-sm">
              🏢
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No businesses found
            </h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Try adjusting your filters or checking back later.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Business
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Account
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Created
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {businesses.map((business) => (
                  <tr
                    key={business.id}
                    className="hover:bg-slate-50/50 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {business.name || "—"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate font-medium">
                        {business.description || "No description provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {business.user?.email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-xs font-semibold border border-slate-200/60 whitespace-nowrap">
                        {business.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1.5 ${
                          business.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                            : business.status === "REJECTED"
                              ? "bg-red-50 text-red-700 ring-1 ring-red-600/10"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            business.status === "APPROVED"
                              ? "bg-emerald-500"
                              : business.status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        />
                        {business.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center ${
                          business.user?.isActive === false
                            ? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                            : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10"
                        }`}
                      >
                        {business.user?.isActive === false
                          ? "Disabled"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {business.createdAt
                        ? new Date(business.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                        {business.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(business.id)}
                            disabled={approvingId === business.id}
                            title="Approve"
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            {approvingId === business.id ? (
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              "✓"
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(business)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center justify-center hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleUser(
                              business.user?.id,
                              business.user?.isActive !== false,
                            )
                          }
                          disabled={
                            !business.user?.id ||
                            approvingId === business.user?.id
                          }
                          title={
                            business.user?.isActive === false
                              ? "Enable User"
                              : "Disable User"
                          }
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 ${
                            business.user?.isActive === false
                              ? "bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white"
                              : "bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"
                          }`}
                        >
                          {business.user?.isActive === false ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          )}
                        </button>
                        {business.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleReject(business.id)}
                            disabled={approvingId === business.id}
                            title="Reject"
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-all">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3
                className="text-2xl font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Edit Business Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-8">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editForm.categoryName}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          categoryName: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Physical Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      District / Region
                    </label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, district: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Website URL
                    </label>
                    <input
                      type="text"
                      value={editForm.website}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, website: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Approval Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, status: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white outline-none transition-all text-sm font-bold text-slate-700"
                    >
                      <option value="PENDING">⏳ Pending</option>
                      <option value="APPROVED">✓ Approved</option>
                      <option value="REJECTED">✕ Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gradient-to-b from-[#1C4D8D] to-[#153a6b] text-white rounded-xl text-sm font-bold hover:from-[#163d71] hover:to-[#0f2a4e] shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
