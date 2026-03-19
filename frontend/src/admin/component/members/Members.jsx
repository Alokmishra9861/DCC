// Frontend/src/admin/component/members/Members.jsx
import React, { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../../../src/services/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const DISTRICTS = [
  "all",
  "george_town",
  "west_bay",
  "bodden_town",
  "north_side",
  "east_end",
  "cayman_brac",
  "little_cayman",
];
const STATUSES = ["all", "ACTIVE", "PENDING", "EXPIRED", "CANCELLED"];

const fmtDistrict = (d) =>
  d === "all"
    ? "All Districts"
    : d?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",
    CANCELLED: "bg-red-50 text-red-500 border-red-100",
  };
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${map[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}
    >
      {status || "NONE"}
    </span>
  );
};

const Skeleton = () => (
  <tr className="animate-pulse border-b border-slate-50">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-slate-100 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({
  message,
  onConfirm,
  onCancel,
  loading,
  danger = true,
}) => (
  <div
    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 ${danger ? "bg-red-100" : "bg-emerald-100"}`}
      >
        {danger ? "⚠" : "✓"}
      </div>
      <p className="text-center text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"}`}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ member, onSave, onClose, saving }) => {
  const [form, setForm] = useState({
    firstName: member.firstName || "",
    lastName: member.lastName || "",
    email: member.user?.email || "",
    phone: member.phone || "",
    district: member.district || "",
  });

  const field = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors";
  const labelCls =
    "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900">Edit Member</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {member.firstName} {member.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => field("firstName", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => field("lastName", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => field("email", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => field("phone", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>District</label>
            <div className="relative">
              <select
                value={form.district}
                onChange={(e) => field("district", e.target.value)}
                className={inputCls + " appearance-none cursor-pointer"}
              >
                <option value="">Select district</option>
                {DISTRICTS.filter((d) => d !== "all").map((d) => (
                  <option key={d} value={d}>
                    {fmtDistrict(d)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▾
              </div>
            </div>
          </div>
        </div>

        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Members = () => {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Filters + pagination
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  // Modals
  const [editMember, setEditMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type, member, loading }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (search.trim()) params.search = search.trim();
      if (district !== "all") params.district = district;
      if (status !== "all") params.membershipStatus = status;

      const res = await adminAPI.getMembers(params);
      // API returns paginated: { data: [...], pagination: {...} } or raw array
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setMembers(list);
      setTotal(res?.pagination?.total ?? list.length);
    } catch (err) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [search, district, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSaveEdit = async (form) => {
    if (!editMember?.id) return;
    setSaving(true);
    try {
      await adminAPI.updateMember(editMember.id, form);
      showToast("success", "Member updated successfully");
      setEditMember(null);
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (member) => {
    const userId = member.user?.id;
    const isActive = member.user?.isActive !== false;
    setConfirm({ type: "toggle", member, loading: false, isActive });
  };

  const handleDelete = (member) =>
    setConfirm({ type: "delete", member, loading: false });

  const handleApprove = async (membershipId) => {
    try {
      await adminAPI.approveMembership(membershipId);
      showToast("success", "Membership approved");
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to approve membership");
    }
  };

  const executeConfirm = async () => {
    if (!confirm) return;
    setConfirm((p) => ({ ...p, loading: true }));
    try {
      if (confirm.type === "delete") {
        await adminAPI.deleteMember(confirm.member.id);
        showToast("success", "Member deleted");
      } else if (confirm.type === "toggle") {
        await adminAPI.updateUserStatus(
          confirm.member.user?.id,
          !confirm.isActive,
        );
        showToast(
          "success",
          `Member ${confirm.isActive ? "disabled" : "enabled"}`,
        );
      }
      setConfirm(null);
      load();
    } catch (err) {
      showToast("error", err.message || "Action failed");
      setConfirm(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          danger={confirm.type === "delete"}
          loading={confirm.loading}
          message={
            confirm.type === "delete"
              ? `Permanently delete ${confirm.member.firstName} ${confirm.member.lastName}? This cannot be undone.`
              : `${confirm.isActive ? "Disable" : "Enable"} ${confirm.member.firstName} ${confirm.member.lastName}'s account?`
          }
          onConfirm={executeConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {editMember && (
        <EditModal
          member={editMember}
          onSave={handleSaveEdit}
          onClose={() => setEditMember(null)}
          saving={saving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {total > 0
              ? `${total} member${total !== 1 ? "s" : ""} total`
              : "Manage memberships and access"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
            />
          </div>

          {/* District filter */}
          <div className="relative">
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors cursor-pointer"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {fmtDistrict(d)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▾
            </div>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : s}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▾
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {[
                  "Member",
                  "Email",
                  "District",
                  "Membership",
                  "Account",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-slate-300 text-sm"
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#1C4D8D]/10 flex items-center justify-center text-[#1C4D8D] font-bold text-xs shrink-0">
                          {(m.firstName || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900 whitespace-nowrap">
                          {m.firstName} {m.lastName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-slate-500 max-w-45 truncate">
                      {m.user?.email || "—"}
                    </td>

                    {/* District */}
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {m.district ? fmtDistrict(m.district) : "—"}
                    </td>

                    {/* Membership */}
                    <td className="px-5 py-3.5">
                      {m.membership ? (
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={m.membership.status} />
                          {m.membership.expiryDate && (
                            <span className="text-[11px] text-slate-400">
                              Exp:{" "}
                              {new Date(
                                m.membership.expiryDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">
                          No membership
                        </span>
                      )}
                    </td>

                    {/* Account status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          m.user?.isActive !== false
                            ? "bg-blue-50 text-[#1C4D8D] border-blue-100"
                            : "bg-red-50 text-red-500 border-red-100"
                        }`}
                      >
                        {m.user?.isActive !== false ? "Active" : "Disabled"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* Approve membership */}
                        {m.membership?.status === "PENDING" && (
                          <button
                            onClick={() => handleApprove(m.membership.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap"
                          >
                            Approve
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => setEditMember(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(m)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            m.user?.isActive !== false
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-blue-50 text-[#1C4D8D] hover:bg-blue-100"
                          }`}
                        >
                          {m.user?.isActive !== false ? "Disable" : "Enable"}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:border-slate-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:border-slate-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
