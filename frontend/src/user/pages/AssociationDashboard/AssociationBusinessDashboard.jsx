// Frontend/src/user/pages/AssociationDashboard/AssociationBusinessDashboard.jsx
// Business Association dashboard.
// Flow: register → admin approval → add businesses (link existing or invite new)
// What association CAN see: their business list, overview stats
// What association CANNOT see: businesses' discounts/certs (members only)
// B2B offers are accessed via the header "B2B Discounts" link → B2BDiscountsContent

import React, { useEffect, useState, useCallback } from "react";
import { associationAPI } from "../../../services/api";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

const StatusBadge = ({ status }) => {
  const map = {
    LINKED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    REMOVED: "bg-red-50 text-red-400 border-red-100",
  };
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${map[status] || "bg-slate-100 text-slate-500 border-slate-200"}`}
    >
      {status}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color = "bg-blue-50" }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div
      className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl mb-3`}
    >
      {icon}
    </div>
    <p className="text-2xl font-black text-slate-900 leading-none mb-1">
      {value}
    </p>
    <p className="text-sm font-semibold text-slate-700">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
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
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-slate-900 mb-1">
          Link Existing Business
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Enter the DCC Business ID of an already approved business on the
          platform.
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Business ID
            </label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="e.g. 64f3a2b1c5d7e8f9a0b1c2d3"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1C4D8D] transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 flex items-center justify-center gap-2"
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
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
              ✓
            </div>
            <p className="font-bold text-slate-900">Invite Sent!</p>
            <p className="text-sm text-slate-400 mt-1">
              They'll receive an email with a link to register under your
              association.
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-slate-900 mb-1">
              Invite New Business
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              They'll receive an email with a link to register as a new DCC
              business under your association.
            </p>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                {
                  label: "Business Name",
                  key: "businessName",
                  type: "text",
                  ph: "Island Grill Restaurant",
                },
                {
                  label: "Contact Email",
                  key: "email",
                  type: "email",
                  ph: "owner@example.com",
                },
              ].map(({ label, key, type, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder={ph}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-slate-50/60">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}
        >
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
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

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">
              Business Association
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Association Dashboard
            </h1>
            {dashboard && (
              <p className="text-slate-400 text-sm mt-1">
                {dashboard.businessCounts?.linked ?? 0} linked businesses
              </p>
            )}
          </div>
          {tab === "businesses" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowLink(true)}
                disabled={dashboard?.isPending}
                className="px-4 py-2.5 border-2 border-emerald-600 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔗 Link Existing
              </button>
              <button
                onClick={() => setShowInvite(true)}
                disabled={dashboard?.isPending}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Invite New
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Pending approval banner */}
        {!loading && !dashboard?.businessCounts && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <p className="font-bold text-amber-700 mb-1">Pending Approval</p>
            <p className="text-sm text-amber-600">
              Your association is awaiting admin approval. You'll be notified by
              email once approved.
            </p>
          </div>
        )}

        {/* Tabs — Overview + Businesses only */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
          {[
            { key: "overview", label: "Overview" },
            {
              key: "businesses",
              label: `Businesses${total > 0 ? ` (${total})` : ""}`,
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon="🏪"
                  label="Total Businesses"
                  value={dashboard?.businessCounts?.total ?? 0}
                  color="bg-teal-50"
                />
                <StatCard
                  icon="🔗"
                  label="Linked"
                  value={dashboard?.businessCounts?.linked ?? 0}
                  sub="Active partners"
                  color="bg-emerald-50"
                />
                <StatCard
                  icon="📧"
                  label="Pending"
                  value={dashboard?.businessCounts?.pending ?? 0}
                  sub="Invite sent"
                  color="bg-amber-50"
                />
                <StatCard
                  icon="🎯"
                  label="Active Offers"
                  value={dashboard?.totalActiveOffers ?? 0}
                  sub="Live B2B offers"
                  color="bg-violet-50"
                />
              </div>
            )}

            {/* Info cards */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3">Getting started</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: "🔗",
                    title: "Link businesses",
                    desc: "Add approved DCC businesses to your network by their ID",
                  },
                  {
                    icon: "📧",
                    title: "Invite new ones",
                    desc: "Invite businesses to register on DCC under your association",
                  },
                  {
                    icon: "🤝",
                    title: "View B2B offers",
                    desc: "Browse exclusive B2B deals via B2B Discounts in the navigation",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                  >
                    <span className="text-2xl">{icon}</span>
                    <p className="font-bold text-slate-900 text-sm mt-2 mb-1">
                      {title}
                    </p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Access scope notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
              <span className="text-blue-500 text-lg flex-shrink-0 mt-0.5">
                ℹ
              </span>
              <div>
                <p className="text-sm font-bold text-[#1C4D8D] mb-1">
                  What you can access
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold flex-shrink-0">
                      ✓
                    </span>{" "}
                    Manage your linked and invited businesses
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold flex-shrink-0">
                      ✓
                    </span>{" "}
                    View B2B exclusive offers via <strong>B2B Discounts</strong>{" "}
                    in the header
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold flex-shrink-0">
                      ✓
                    </span>{" "}
                    Contact us and About Us pages
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-300 font-bold flex-shrink-0">
                      ✗
                    </span>{" "}
                    Individual member discounts and certificates (available to
                    members only)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── BUSINESSES TAB ── */}
        {tab === "businesses" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["", "LINKED", "PENDING", "REMOVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${statusFilter === s ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >
                  {s || "All"}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
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
                          className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bizLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr
                          key={i}
                          className="animate-pulse border-b border-slate-50"
                        >
                          {[1, 2, 3, 4, 5].map((j) => (
                            <td key={j} className="px-5 py-4">
                              <div className="h-3.5 bg-slate-100 rounded w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : businesses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-slate-300 text-sm"
                        >
                          No businesses linked yet
                        </td>
                      </tr>
                    ) : (
                      businesses.map((b) => {
                        const biz = b.business;
                        const name = biz?.name || b.businessName || "—";
                        return (
                          <tr
                            key={b.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-xs overflow-hidden flex-shrink-0">
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
                                <span className="font-semibold text-slate-900">
                                  {name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                              {biz?.category?.name || "—"}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                              {biz?.district || "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={b.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              {b.status !== "REMOVED" && (
                                <button
                                  onClick={() => handleRemove(b.id)}
                                  className="px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  Remove
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
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-50 bg-slate-50/50">
                  <p className="text-xs text-slate-400">
                    Page {page} of {totalPages} · {total} total
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationBusinessDashboard;
