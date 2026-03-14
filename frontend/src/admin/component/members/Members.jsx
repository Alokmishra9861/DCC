import React, { useEffect, useState } from "react";
import { adminAPI } from "../../../services/api";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    district: "",
  });

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminAPI.getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const openEdit = (member) => {
    setEditingMember(member);
    setEditForm({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.user?.email || "",
      phone: member.phone || "",
      district: member.district || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember?.id) return;
    setSaving(true);
    try {
      await adminAPI.updateMember(editingMember.id, editForm);
      setShowEditModal(false);
      setEditingMember(null);
      await loadMembers();
    } catch (err) {
      setError(err.message || "Failed to update member.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    if (!userId) return;
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      await loadMembers();
    } catch (err) {
      setError(err.message || "Failed to update user status.");
    }
  };

  const handleApproveMembership = async (membershipId) => {
    try {
      await adminAPI.approveMembership(membershipId);
      await loadMembers();
    } catch (err) {
      setError(err.message || "Failed to approve membership.");
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await adminAPI.deleteMember(memberId);
      await loadMembers();
    } catch (err) {
      setError(err.message || "Failed to delete member.");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Members</h1>
        <p className="text-sm text-slate-500">
          Manage members, memberships, and access.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">District</th>
                  <th className="px-6 py-3">Membership</th>
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="text-sm text-slate-700">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-6 py-4">{member.user?.email || "-"}</td>
                    <td className="px-6 py-4">{member.district || "-"}</td>
                    <td className="px-6 py-4">
                      {member.membership ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.membership.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {member.membership.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.user?.isActive === false
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {member.user?.isActive === false
                          ? "Disabled"
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {member.membership?.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleApproveMembership(member.membership.id)
                            }
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(member)}
                          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleUser(
                              member.user?.id,
                              member.user?.isActive !== false,
                            )
                          }
                          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
                        >
                          {member.user?.isActive === false
                            ? "Enable"
                            : "Disable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id)}
                          className="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-semibold hover:bg-red-100"
                        >
                          Delete
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
              <h3 className="text-xl font-bold text-slate-900">Edit Member</h3>
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
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
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
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
