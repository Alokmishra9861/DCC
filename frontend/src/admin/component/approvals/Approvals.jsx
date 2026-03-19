// Frontend/src/admin/component/approvals/Approvals.jsx
import React, { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../../../src/services/api";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const COLORS = {
  employer: "bg-blue-100 text-blue-700",
  business: "bg-emerald-100 text-emerald-700",
  association: "bg-violet-100 text-violet-700",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-slate-100 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-44" />
      </div>
    </div>
    <div className="flex gap-2 pt-4 border-t border-slate-50">
      <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
      <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ item, type, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 text-xl mx-auto mb-4">
          ✕
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
          Reject {type}?
        </h3>
        <p className="text-sm text-slate-500 text-center mb-5">
          A notification will be sent to{" "}
          <strong className="text-slate-700">
            {item?.user?.email || "the applicant"}
          </strong>
          .
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional reason for rejection..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-300 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Approval Card ─────────────────────────────────────────────────────────────
const ApprovalCard = ({ item, type, onApprove, onReject, actionId }) => {
  const name = item.companyName || item.name || "Unknown";
  const email = item.user?.email || "—";
  const isLoading = actionId === item.id;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${COLORS[type]}`}
        >
          {name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-slate-900 truncate">{name}</p>
            {item.createdAt && (
              <span className="text-[11px] text-slate-300 shrink-0">
                {timeAgo(item.createdAt)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{email}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {[
              item.industry,
              item.type,
              item.district && `📍 ${item.district}`,
              item.phone && `📞 ${item.phone}`,
            ]
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
        <button
          onClick={() => onReject(item)}
          disabled={isLoading}
          className="flex-1 py-2 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
        >
          Reject
        </button>
        <button
          onClick={() => onApprove(item.id)}
          disabled={isLoading}
          className="flex-1 py-2 bg-[#1C4D8D] text-white rounded-xl text-xs font-bold hover:bg-[#163d71] transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
              Processing
            </>
          ) : (
            "Approve ✓"
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Approvals = () => {
  const [tab, setTab] = useState("employers");
  const [data, setData] = useState({
    employers: [],
    associations: [],
    businesses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAPI.getPendingApprovals();
      setData({
        employers: res.employers || [],
        associations: res.associations || [],
        businesses: res.businesses || [],
      });
    } catch (err) {
      setError(err.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (type, id) => {
    setActionId(id);
    try {
      if (type === "employer") await adminAPI.approveEmployer(id);
      if (type === "business") await adminAPI.approveBusiness(id);
      if (type === "association") await adminAPI.approveAssociation(id);
      showToast(
        "success",
        `${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully`,
      );
      setData((prev) => ({
        ...prev,
        [`${type}s`]: prev[`${type}s`].filter((i) => i.id !== id),
      }));
    } catch (err) {
      showToast("error", err.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    const { item, type } = rejectModal;
    setRejectLoading(true);
    try {
      if (type === "employer") await adminAPI.rejectEmployer(item.id, reason);
      if (type === "business") await adminAPI.rejectBusiness(item.id);
      if (type === "association") {
        /* no reject endpoint yet — just remove */
      }
      showToast(
        "success",
        `${type.charAt(0).toUpperCase() + type.slice(1)} rejected`,
      );
      setData((prev) => ({
        ...prev,
        [`${type}s`]: prev[`${type}s`].filter((i) => i.id !== item.id),
      }));
      setRejectModal(null);
    } catch (err) {
      showToast("error", err.message || "Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const TABS = [
    { key: "employers", label: "Employers", count: data.employers.length },
    { key: "businesses", label: "Businesses", count: data.businesses.length },
    {
      key: "associations",
      label: "Associations",
      count: data.associations.length,
    },
  ];

  const currentType = tab.slice(0, -1);
  const currentList = data[tab] || [];
  const totalPending = TABS.reduce((s, t) => s + t.count, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}

      {rejectModal && (
        <RejectModal
          item={rejectModal.item}
          type={rejectModal.type}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectModal(null)}
          loading={rejectLoading}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalPending > 0
              ? `${totalPending} item${totalPending !== 1 ? "s" : ""} pending review`
              : "All items reviewed — nothing pending"}
          </p>
        </div>
        <button
          onClick={load}
          className="text-xs font-semibold text-slate-400 hover:text-[#1C4D8D] transition-colors flex items-center gap-1.5 border border-slate-200 px-3 py-2 rounded-xl hover:border-[#1C4D8D]/30"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
            {count > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  tab === key
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl border border-emerald-100">
            ✓
          </div>
          <p className="font-bold text-slate-600">No pending {tab}</p>
          <p className="text-sm text-slate-400 mt-1">
            You're all caught up here.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {currentList.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              type={currentType}
              actionId={actionId}
              onApprove={(id) => handleApprove(currentType, id)}
              onReject={(item) => setRejectModal({ item, type: currentType })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;
