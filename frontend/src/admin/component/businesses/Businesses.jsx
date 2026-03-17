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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Business Directory
            </h1>
            <p className="text-slate-600 text-sm md:text-base mt-2">
              Manage and approve business registrations
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "pending", label: "🔄 Pending", icon: "⏳" },
            { key: "approved", label: "✅ Approved", icon: "✓" },
            { key: "rejected", label: "❌ Rejected", icon: "✗" },
            { key: "all", label: "📋 All", icon: "◆" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                filter === item.key
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 scale-105"
                  : "bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg text-sm text-red-700 font-medium shadow-sm">
          🚨 {error}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🏢</div>
            <p className="text-slate-600 font-medium">No businesses found.</p>
            <p className="text-slate-500 text-sm mt-2">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Business
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Account
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Created
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((business) => (
                  <tr
                    key={business.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {business.name || "-"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {business.description?.substring(0, 50) ||
                          "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {business.user?.email || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium">
                        {business.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block ${
                          business.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : business.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {business.status === "APPROVED"
                          ? "✅ Approved"
                          : business.status === "REJECTED"
                            ? "❌ Rejected"
                            : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block ${
                          business.user?.isActive === false
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {business.user?.isActive === false
                          ? "🔒 Disabled"
                          : "✓ Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {business.createdAt
                        ? new Date(business.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {business.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(business.id)}
                            disabled={approvingId === business.id}
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {approvingId === business.id
                              ? "⏳..."
                              : "✅ Approve"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(business)}
                          className="px-3 py-2 rounded-lg bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleUser(
                              business.user?.id,
                              business.user?.isActive !== false,
                            )
                          }
                          disabled={!business.user?.id}
                          className="px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {business.user?.isActive === false
                            ? "🔓 Enable"
                            : "🔒 Disable"}
                        </button>
                        {business.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleReject(business.id)}
                            disabled={approvingId === business.id}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            ❌ Reject
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

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-2xl font-bold text-slate-900">
                📝 Edit Business
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-red-100 rounded-full transition-colors text-slate-500 hover:text-red-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🏢 Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📂 Category
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
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📄 Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📞 Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📍 Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🗺️ District
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, district: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🌐 Website
                  </label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, website: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    📋 Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium"
                  >
                    <option value="PENDING">⏳ Pending</option>
                    <option value="APPROVED">✅ Approved</option>
                    <option value="REJECTED">❌ Rejected</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                💾 Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
