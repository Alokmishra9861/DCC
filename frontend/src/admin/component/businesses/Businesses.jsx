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
    category: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    website: "",
    isApproved: false,
  });

  const loadBusinesses = async (nextFilter = filter) => {
    setLoading(true);
    setError("");
    try {
      const params =
        nextFilter === "all" ? {} : { isApproved: nextFilter === "approved" };
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
      category: business.category || "",
      description: business.description || "",
      phone: business.phone || "",
      email: business.email || "",
      address: business.address || "",
      district: business.district || "",
      website: business.website || "",
      isApproved: business.isApproved || false,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBusiness?.id) return;
    try {
      await adminAPI.updateBusiness(editingBusiness.id, editForm);
      setShowEditModal(false);
      setEditingBusiness(null);
      await loadBusinesses(filter);
    } catch (err) {
      setError(err.message || "Failed to update business.");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Businesses</h1>
          <p className="text-sm text-slate-500">
            Approve businesses and review registered partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: "pending", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "all", label: "All" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === item.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : businesses.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No businesses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Business</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businesses.map((business) => (
                  <tr key={business.id} className="text-sm text-slate-700">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {business.name || "-"}
                    </td>
                    <td className="px-6 py-4">{business.user?.email || "-"}</td>
                    <td className="px-6 py-4">{business.category || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          business.isApproved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {business.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          business.user?.isActive === false
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {business.user?.isActive === false
                          ? "Disabled"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {business.createdAt
                        ? new Date(business.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {!business.isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApprove(business.id)}
                            disabled={approvingId === business.id}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {approvingId === business.id
                              ? "Approving..."
                              : "Approve"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(business)}
                          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                        >
                          Edit
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
                          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {business.user?.isActive === false
                            ? "Enable"
                            : "Disable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(business.id)}
                          disabled={approvingId === business.id}
                          className="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Edit Business
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, address: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, district: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, website: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    checked={editForm.isApproved}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        isApproved: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">Approved</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Businesses;
