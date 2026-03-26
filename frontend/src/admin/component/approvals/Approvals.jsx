// Frontend/src/admin/component/approvals/Approvals.jsx
import React, { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../../services/api";

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
  employer: "bg-blue-50/80 text-blue-700 ring-1 ring-blue-600/10",
  business: "bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-600/10",
  association: "bg-violet-50/80 text-violet-700 ring-1 ring-violet-600/10",
  b2bPartner: "bg-pink-50/80 text-pink-700 ring-1 ring-pink-600/10",
};

const TYPE_LABELS = {
  employer: "Employer",
  business: "Business",
  association: "Association",
  b2bPartner: "B2B Partner",
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
    <div className="flex gap-4 mb-5 animate-pulse">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-4 bg-slate-100 rounded-md w-1/3" />
        <div className="h-3 bg-slate-50 rounded-md w-1/2" />
      </div>
    </div>
    <div className="flex gap-3 pt-5 border-t border-slate-50 animate-pulse">
      <div className="flex-1 h-10 bg-slate-50 rounded-xl" />
      <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ item, type, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-white/20 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-xl mx-auto mb-5 ring-4 ring-red-50/50">
          ✕
        </div>
        <h3
          className="text-xl font-bold text-slate-900 text-center mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "-0.01em",
          }}
        >
          Reject {TYPE_LABELS[type]}?
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6 px-4">
          A notification will be sent to{" "}
          <strong className="text-slate-800 font-semibold">
            {item?.user?.email || "the applicant"}
          </strong>
          .
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional reason for rejection..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white resize-none mb-6 transition-all placeholder:text-slate-400"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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

  const tags = [
    item.industry,
    item.type,
    item.district && `📍 ${item.district}`,
    item.phone && `📞 ${item.phone}`,
    item.servicesOffered &&
      `🛠 ${item.servicesOffered.slice(0, 40)}${item.servicesOffered.length > 40 ? "…" : ""}`,
    item.website &&
      `🌐 ${item.website.replace(/^https?:\/\//, "").slice(0, 30)}`,
  ].filter(Boolean);

  return (
    <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm ${COLORS[type] || "bg-slate-50 text-slate-600 ring-1 ring-slate-200"}`}
        >
          {name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-bold text-slate-900 truncate text-base tracking-tight">
              {name}
            </h4>
            {item.createdAt && (
              <span className="text-[11px] font-medium text-slate-400 flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded-full">
                {timeAgo(item.createdAt)}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{email}</p>

          <span
            className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full mt-2.5 ${COLORS[type] || "bg-slate-100 text-slate-500"}`}
          >
            {TYPE_LABELS[type]}
          </span>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium bg-slate-50 border border-slate-200/60 text-slate-600 px-2.5 py-1 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex gap-3 mt-6 pt-5 border-t border-slate-100">
        <button
          onClick={() => onReject(item)}
          disabled={isLoading}
          className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 disabled:opacity-40"
        >
          Reject
        </button>
        <button
          onClick={() => onApprove(item.id)}
          disabled={isLoading}
          className="flex-1 py-2.5 bg-gradient-to-b from-[#1C4D8D] to-[#153a6b] text-white rounded-xl text-xs font-semibold hover:from-[#163d71] hover:to-[#0f2a4e] shadow-md shadow-blue-900/20 transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
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
    b2bPartners: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
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
        b2bPartners: res.b2bPartners || [],
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
      if (type === "b2bPartner") await adminAPI.approveB2BPartner(id);

      const label = TYPE_LABELS[type] || type;
      showToast("success", `${label} approved — now visible in the directory`);

      const listKey = type === "b2bPartner" ? "b2bPartners" : `${type}s`;
      setData((prev) => ({
        ...prev,
        [listKey]: prev[listKey].filter((i) => i.id !== id),
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
      if (type === "b2bPartner")
        await adminAPI.rejectB2BPartner(item.id, reason);

      const label = TYPE_LABELS[type] || type;
      showToast("success", `${label} rejected`);

      const listKey = type === "b2bPartner" ? "b2bPartners" : `${type}s`;
      setData((prev) => ({
        ...prev,
        [listKey]: prev[listKey].filter((i) => i.id !== item.id),
      }));
      setRejectModal(null);
    } catch (err) {
      showToast("error", err.message || "Rejection failed");
    } finally {
      setRejectLoading(false);
    }
  };

  const TABS = [
    {
      key: "employers",
      type: "employer",
      label: "Employers",
      icon: "🏢",
      count: data.employers.length,
    },
    {
      key: "businesses",
      type: "business",
      label: "Businesses",
      icon: "🏪",
      count: data.businesses.length,
    },
    {
      key: "associations",
      type: "association",
      label: "Associations",
      icon: "👥",
      count: data.associations.length,
    },
    {
      key: "b2bPartners",
      type: "b2bPartner",
      label: "B2B Partners",
      icon: "🤝",
      count: data.b2bPartners.length,
    },
  ];

  const currentTab = TABS.find((t) => t.key === tab);
  const currentType = currentTab?.type || "employer";
  const currentList = data[tab] || [];
  const totalPending = TABS.reduce((s, t) => s + t.count, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl border text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-white/90 backdrop-blur-md border-emerald-200 text-emerald-800"
              : "bg-white/90 backdrop-blur-md border-red-200 text-red-800"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
          >
            {toast.type === "success" ? "✓" : "!"}
          </div>
          {toast.msg}
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <h1
            className="text-3xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Review Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            {totalPending > 0
              ? `You have ${totalPending} item${totalPending !== 1 ? "s" : ""} requiring your attention.`
              : "All caught up! No items pending review."}
          </p>
        </div>
        <button
          onClick={load}
          className="text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 transition-all flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Refresh Data
        </button>
      </div>

      {/* B2B Info Callout */}
      {tab === "b2bPartners" && (
        <div className="mb-6 p-5 bg-gradient-to-r from-pink-50 to-pink-50/30 border border-pink-100/80 rounded-3xl flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
            🤝
          </div>
          <div className="pt-0.5">
            <p className="font-bold text-pink-900 text-sm tracking-tight">
              B2B Partner Approvals
            </p>
            <p className="text-sm text-pink-700/80 mt-1 leading-relaxed max-w-3xl">
              Approving a partner updates their record with{" "}
              <code className="bg-pink-100/80 px-1.5 py-0.5 rounded text-pink-800 text-xs font-mono font-bold">
                isApproved: true
              </code>
              . This immediately publishes their profile to the public{" "}
              <strong>/b2b-directory</strong> for all members to see.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50/80 border border-red-200/80 rounded-2xl text-sm font-medium text-red-700 flex items-center gap-3">
          <span className="text-red-500 bg-red-100 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
            !
          </span>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100/70 p-1.5 rounded-2xl mb-8 overflow-x-auto border border-slate-200/50 shadow-inner">
        {TABS.map(({ key, label, icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              tab === key
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <span className="text-base opacity-80">{icon}</span>
            {label}
            {count > 0 && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  tab === key
                    ? "bg-[#1C4D8D]/10 text-[#1C4D8D]"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-24 bg-white/50 border border-slate-200/60 border-dashed rounded-[2.5rem]">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5 text-2xl ring-1 ring-emerald-100 shadow-sm">
            ✓
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No pending {currentTab?.label.toLowerCase()}
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            You're completely caught up. Great job!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
