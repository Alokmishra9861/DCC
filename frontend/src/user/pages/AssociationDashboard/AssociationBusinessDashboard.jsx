// Frontend/src/user/pages/AssociationDashboard/AssociationBusinessDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { associationAPI } from "../../../services/api";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100/80 rounded-2xl ${className}`} />
);

const StatusBadge = ({ status }) => {
  const map = {
    LINKED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    REMOVED: "bg-rose-50 text-rose-600 ring-1 ring-rose-600/20",
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${map[status] || "bg-slate-50 text-slate-500 ring-1 ring-slate-200"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "LINKED" ? "bg-emerald-500" : status === "PENDING" ? "bg-amber-500" : status === "REMOVED" ? "bg-rose-500" : "bg-slate-400"}`}
      />
      {status}
    </span>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  sub,
  color = "bg-blue-50 text-blue-600",
}) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
        {label}
      </p>
      <div
        className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl shadow-sm`}
      >
        {icon}
      </div>
    </div>
    <p
      className="text-4xl font-bold text-slate-900 tracking-tight"
      style={HEADING_FONT}
    >
      {value}
    </p>
    {sub && <p className="text-xs font-medium text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── Link existing business modal ──────────────────────────────────────────────
const LinkModal = ({ onClose, onLinked }) => {
  const [businessId, setBusinessId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessId.trim()) {
      setError("Business ID is required");
      return;
    }
    setLoading(true);
    try {
      await associationAPI.linkBusiness(businessId.trim());
      onLinked();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to link business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300">
      <div
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

        <div className="flex items-center justify-between mb-2">
          <h3
            className="text-2xl font-bold text-slate-900"
            style={HEADING_FONT}
          >
            Link Business
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
        <p className="text-sm font-medium text-slate-500 mb-6">
          Enter the DCC Business ID of an already approved business on the
          platform.
        </p>

        {error && (
          <div className="p-3 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
            <Icon name="ExclamationTriangleIcon" size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Business ID
            </label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="e.g. 64f3a2b1c5d7..."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold hover:shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Link Business
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Invite new business modal ─────────────────────────────────────────────────
const InviteModal = ({ onClose, onInvited }) => {
  const [form, setForm] = useState({ businessName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.email.trim()) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await associationAPI.inviteBusiness(form.businessName, form.email);
      setSent(true);
      onInvited();
    } catch (err) {
      setError(err.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1C4D8D] to-indigo-500" />

        {sent ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm border border-emerald-200">
              <Icon name="CheckIcon" size={32} />
            </div>
            <h3
              className="text-2xl font-bold text-slate-900 mb-2"
              style={HEADING_FONT}
            >
              Invite Sent!
            </h3>
            <p className="text-sm font-medium text-slate-500 mb-8 px-4">
              They'll receive an email with a link to register under your
              association.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h3
                className="text-2xl font-bold text-slate-900"
                style={HEADING_FONT}
              >
                Invite Business
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Invite a new business to register on DCC under your association.
            </p>

            {error && (
              <div className="p-3 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <Icon name="ExclamationTriangleIcon" size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                {
                  label: "Business Name",
                  key: "businessName",
                  type: "text",
                  ph: "e.g., Island Grill",
                },
                {
                  label: "Contact Email",
                  key: "email",
                  type: "email",
                  ph: "owner@example.com",
                },
              ].map(({ label, key, type, ph }) => (
                <div key={key}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder={ph}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-300"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#1C4D8D] to-[#153a6b] text-white rounded-xl text-sm font-bold hover:shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Send Invite
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const AssociationBusinessDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bizLoading, setBizLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("overview");
  const [showLink, setShowLink] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await associationAPI.getDashboard();
      setDashboard(res);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBusinesses = useCallback(async () => {
    setBizLoading(true);
    try {
      const res = await associationAPI.getLinkedBusinesses({
        page,
        limit: 15,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setBusinesses(res.businesses || []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Businesses load error:", err.message);
    } finally {
      setBizLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this business from the association?")) return;
    try {
      await associationAPI.removeBusiness(id);
      showToast("success", "Business removed");
      loadBusinesses();
      loadDashboard();
    } catch (err) {
      showToast("error", err.message || "Failed");
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#1C4D8D]/20">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-60">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50/40 to-teal-50/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      </div>

      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border text-sm font-bold animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === "success"
              ? "bg-white/95 backdrop-blur-md border-emerald-200 text-emerald-800"
              : "bg-white/95 backdrop-blur-md border-rose-200 text-rose-800"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
          >
            <Icon
              name={toast.type === "success" ? "CheckIcon" : "XMarkIcon"}
              size={14}
            />
          </div>
          {toast.msg}
        </div>
      )}

      {showLink && (
        <LinkModal
          onClose={() => setShowLink(false)}
          onLinked={() => {
            loadBusinesses();
            loadDashboard();
          }}
        />
      )}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={() => {
            loadBusinesses();
            loadDashboard();
          }}
        />
      )}

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
                  Business Association
                </p>
                <h1
                  className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md"
                  style={HEADING_FONT}
                >
                  Association Dashboard
                </h1>
                {dashboard && (
                  <p className="text-blue-100/90 text-lg font-medium">
                    Managing{" "}
                    <span className="text-white font-black">
                      {dashboard.businessCounts?.linked ?? 0}
                    </span>{" "}
                    linked businesses.
                  </p>
                )}
              </div>
              {tab === "businesses" && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowLink(true)}
                    disabled={dashboard?.isPending}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="LinkIcon" size={18} /> Link Existing
                  </button>
                  <button
                    onClick={() => setShowInvite(true)}
                    disabled={dashboard?.isPending}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="EnvelopeIcon" size={18} /> Invite New
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-gradient-to-r from-rose-50 to-red-50/50 border border-rose-200/60 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 text-rose-600 shadow-sm">
              <Icon name="ExclamationTriangleIcon" size={20} />
            </div>
            <div className="pt-2">
              <p className="font-bold text-rose-900">{error}</p>
            </div>
          </div>
        )}

        {/* Pending approval banner */}
        {!loading && !dashboard?.businessCounts && (
          <div className="mb-8 p-5 bg-gradient-to-r from-amber-50 to-yellow-50/30 border border-amber-200/60 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in duration-500">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 shadow-sm">
              <Icon name="ClockIcon" size={20} />
            </div>
            <div className="pt-0.5">
              <h3 className="font-bold text-amber-900 tracking-tight">
                Pending Approval
              </h3>
              <p className="text-sm font-medium text-amber-700/80 mt-1">
                Your association is awaiting admin approval. You'll be notified
                by email once approved.
              </p>
            </div>
          </div>
        )}

        {/* Segmented Control Tabs */}
        <div className="mb-10">
          <div className="flex gap-1.5 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto w-fit">
            {[
              { key: "overview", label: "Overview", icon: "HomeIcon" },
              {
                key: "businesses",
                label: `Businesses${total > 0 ? ` (${total})` : ""}`,
                icon: "BuildingStorefrontIcon",
              },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  tab === key
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Icon
                  name={icon}
                  size={18}
                  className={tab === key ? "opacity-100" : "opacity-70"}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-36 rounded-[2rem]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  icon="🏪"
                  label="Total Businesses"
                  value={dashboard?.businessCounts?.total ?? 0}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  icon="🔗"
                  label="Linked"
                  value={dashboard?.businessCounts?.linked ?? 0}
                  sub="Active partners"
                  color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  icon="📧"
                  label="Pending"
                  value={dashboard?.businessCounts?.pending ?? 0}
                  sub="Invite sent"
                  color="bg-amber-50 text-amber-600"
                />
                <StatCard
                  icon="🎯"
                  label="Active Offers"
                  value={dashboard?.totalActiveOffers ?? 0}
                  sub="Live B2B offers"
                  color="bg-indigo-50 text-indigo-600"
                />
              </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-8">
              <h3
                className="text-2xl font-bold text-slate-900 mb-8 tracking-tight"
                style={HEADING_FONT}
              >
                Getting Started
              </h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    icon: "🔗",
                    title: "Link businesses",
                    desc: "Add approved DCC businesses to your network using their unique Business ID.",
                    color: "bg-emerald-50 border-emerald-100",
                  },
                  {
                    icon: "📧",
                    title: "Invite new ones",
                    desc: "Send an email invitation for businesses to register on DCC directly under your association.",
                    color: "bg-blue-50 border-blue-100",
                  },
                  {
                    icon: "🤝",
                    title: "View B2B offers",
                    desc: "Browse exclusive B2B deals created by other businesses via B2B Discounts in the navigation.",
                    color: "bg-indigo-50 border-indigo-100",
                  },
                ].map(({ icon, title, desc, color }) => (
                  <div
                    key={title}
                    className={`rounded-[1.5rem] p-6 border ${color} shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <span className="text-3xl mb-4 block">{icon}</span>
                    <p className="font-bold text-slate-900 text-lg tracking-tight mb-2">
                      {title}
                    </p>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Access scope notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-[2rem] p-8 flex items-start gap-5 shadow-sm">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 flex-shrink-0">
                <Icon name="InformationCircleIcon" size={24} />
              </div>
              <div>
                <p
                  className="text-xl font-bold text-slate-900 mb-4 tracking-tight"
                  style={HEADING_FONT}
                >
                  What you can access
                </p>
                <ul className="text-sm font-medium text-slate-600 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="CheckIcon" size={12} />
                    </div>
                    Manage your linked and invited businesses
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Icon name="CheckIcon" size={12} />
                    </div>
                    View B2B exclusive offers via <strong>B2B Discounts</strong>{" "}
                    in the header
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
                      <Icon name="XMarkIcon" size={12} />
                    </div>
                    <span className="opacity-70">
                      Individual member discounts and certificates (available to
                      members only)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── BUSINESSES TAB ── */}
        {tab === "businesses" && (
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm animate-in fade-in duration-500">
            <h2
              className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
              style={HEADING_FONT}
            >
              Network Businesses
            </h2>

            <div className="flex gap-2 flex-wrap bg-slate-50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-100">
              {["", "LINKED", "PENDING", "REMOVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    statusFilter === s
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200/60">
                  <tr>
                    {[
                      "Business",
                      "Category",
                      "District",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {bizLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-10 bg-slate-100/80 rounded-xl w-full" />
                        </td>
                      </tr>
                    ))
                  ) : businesses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                          <Icon
                            name="BuildingStorefrontIcon"
                            size={28}
                            className="text-slate-300"
                          />
                        </div>
                        <p className="text-lg font-bold text-slate-700">
                          No businesses linked yet
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Use the buttons above to invite or link businesses.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    businesses.map((b) => {
                      const biz = b.business;
                      const name = biz?.name || b.businessName || "—";
                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm overflow-hidden flex-shrink-0 shadow-sm border border-slate-300/50">
                                {biz?.logoUrl ? (
                                  <img
                                    src={biz.logoUrl}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  name[0]?.toUpperCase()
                                )}
                              </div>
                              <span className="font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                                {name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                            {biz?.category?.name || "—"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                            {biz?.district || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="px-6 py-4">
                            {b.status !== "REMOVED" && (
                              <button
                                onClick={() => handleRemove(b.id)}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors opacity-100 sm:opacity-40 sm:group-hover:opacity-100 shadow-sm"
                                title="Remove Business"
                              >
                                <Icon name="TrashIcon" size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page {page} of {totalPages}{" "}
                  <span className="mx-2 opacity-50">·</span> {total} total
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationBusinessDashboard;
