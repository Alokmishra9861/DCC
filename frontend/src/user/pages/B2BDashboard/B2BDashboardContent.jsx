// Frontend/src/user/pages/B2BDashboard/B2BDashboardContent.jsx
// Redesigned B2B Partner Dashboard with professional premium UI
// Tabs: Dashboard | Leads | Services | Analytics | Profile | Preview

import React, { useState, useEffect, useCallback } from "react";
import { getUser, b2bAPI, uploadAPI } from "../../../services/api";
import AppImage from "../../components/ui/AppImage";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-[#1C4D8D]/20 rounded-full" />
      <div className="absolute inset-0 w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
);

const GlassCard = ({ children, className = "", hover = true }) => (
  <div
    className={`bg-white/85 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ${hover ? "hover:shadow-[0_20px_48px_rgba(28,77,141,0.12)] hover:-translate-y-1.5" : ""} transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({ icon, label, value, sub, gradient }) => (
  <GlassCard className="p-6 relative overflow-hidden group">
    <div
      className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 ${gradient}`}
    />
    <div className="relative">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br ${gradient} shadow-lg`}
      >
        <span className="drop-shadow-sm">{icon}</span>
      </div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
  </GlassCard>
);

const Badge = ({ status }) => {
  const map = {
    APPROVED: {
      l: "Approved",
      c: "bg-white text-slate-900 border-slate-200 ring-slate-100/50",
      icon: "✓",
      iconColor: "text-emerald-500",
    },
    PENDING: {
      l: "Pending Review",
      c: "bg-amber-400/10 text-amber-600 border-amber-200 ring-amber-400/20",
      icon: null,
      iconColor: "",
    },
    REJECTED: {
      l: "Rejected",
      c: "bg-red-400/10 text-red-600 border-red-200 ring-red-400/20",
      icon: null,
      iconColor: "",
    },
  };
  const { l, c, icon, iconColor } = map[status] || map.PENDING;
  return (
    <span
      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ring-1 flex items-center gap-1.5 w-fit ${c}`}
    >
      {icon && (
        <span className={`text-sm font-black ${iconColor}`}>{icon}</span>
      )}
      <span className="tracking-wide">{l}</span>
    </span>
  );
};

const StatusPill = ({ status }) => {
  const s =
    status === "read"
      ? {
          l: "Responded",
          c: "bg-emerald-50 text-emerald-700 border-emerald-200",
        }
      : { l: "New Lead", c: "bg-blue-50 text-[#1C4D8D] border-blue-200" };
  return (
    <span
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.c} uppercase tracking-wide`}
    >
      {s.l}
    </span>
  );
};

const EmptyState = ({ icon, title, desc }) => (
  <GlassCard hover={false} className="py-16 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
      {icon}
    </div>
    <p className="font-bold text-slate-700 text-lg mb-1">{title}</p>
    <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
      {desc}
    </p>
  </GlassCard>
);

// ─── TAB: Dashboard ───────────────────────────────────────────────────────────
const DashboardTab = ({ profile, stats, enquiries, onTabChange }) => {
  const isApproved = profile?.isApproved;
  return (
    <div className="space-y-8">
      {!isApproved && (
        <div className="relative bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 backdrop-blur-sm border border-amber-200/70 rounded-2xl p-6 lg:p-8 flex items-start gap-5 overflow-hidden shadow-lg">
          {/* Ambient accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-2xl" />

          <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md relative z-10">
            ⏳
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-black text-amber-900 text-lg mb-1.5">
              Profile Under Review
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Our team is carefully reviewing your B2B partner application.
              You'll appear in the directory once approved — typically within
              1–2 business days.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                In Progress
              </span>
            </div>
          </div>
        </div>
      )}
      {isApproved && (
        <div className="relative bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80 backdrop-blur-sm border border-emerald-200/70 rounded-2xl p-6 lg:p-8 flex items-start gap-5 overflow-hidden shadow-lg">
          {/* Success gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-2xl" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl" />

          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md relative z-10">
            ✨
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-black text-emerald-900 text-lg mb-1.5">
              Profile Live & Visible
            </p>
            <p className="text-sm text-emerald-800 leading-relaxed">
              Your B2B profile is now live in the DCC directory. Members,
              employers, and associations can discover and contact you directly
              through the platform.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                ✓ Active
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="👁️"
          label="Profile Views"
          value={stats?.profileViews ?? 0}
          gradient="from-blue-400 to-blue-600"
          sub="All time"
        />
        <StatCard
          icon="📩"
          label="Leads Received"
          value={stats?.enquiries ?? 0}
          gradient="from-emerald-400 to-emerald-600"
          sub={`${stats?.newEnquiries ?? 0} new`}
        />
        <StatCard
          icon="⚡"
          label="Response Rate"
          value={
            stats?.enquiries > 0
              ? `${Math.round(((stats?.enquiries - (stats?.newEnquiries || 0)) / stats?.enquiries) * 100)}%`
              : "—"
          }
          gradient="from-violet-400 to-violet-600"
          sub="Enquiry responses"
        />
        <StatCard
          icon="⭐"
          label="Profile Score"
          value={`${Math.round(([profile?.companyName, profile?.servicesOffered, profile?.phone, profile?.email, profile?.website, profile?.logoUrl].filter(Boolean).length / 6) * 100)}%`}
          gradient="from-amber-400 to-orange-500"
          sub="Completeness"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <div className="mb-6">
          <h3 className="font-black text-slate-900 text-2xl mb-1.5">
            Quick Actions
          </h3>
          <p className="text-sm text-slate-500">
            Navigate to key areas of your B2B profile
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              id: "leads",
              icon: "📩",
              title: "View Leads",
              desc: "See who's contacted you",
              color: "from-emerald-500 to-emerald-600",
              bgColor: "bg-emerald-50",
            },
            {
              id: "services",
              icon: "🛠️",
              title: "Manage Services",
              desc: "Add pricing & descriptions",
              color: "from-violet-500 to-violet-600",
              bgColor: "bg-violet-50",
            },
            {
              id: "analytics",
              icon: "📊",
              title: "View Analytics",
              desc: "Track your performance",
              color: "from-[#1C4D8D] to-blue-600",
              bgColor: "bg-blue-50",
            },
          ].map((a) => (
            <button
              key={a.id}
              onClick={() => onTabChange(a.id)}
              className={`group relative flex items-center gap-4 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-6 text-left transition-all hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Gradient accent bar */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.color} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div
                className={`w-14 h-14 ${a.bgColor} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-300 shadow-sm`}
              >
                {a.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base group-hover:text-slate-950">
                  {a.title}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-slate-600">
                  {a.desc}
                </p>
              </div>
              <div className="ml-auto text-slate-300 group-hover:text-slate-400 transition-colors">
                →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How B2B Works — Premium Section */}
      <div className="bg-gradient-to-br from-[#1C4D8D] via-[#2563a3] to-[#0F2854] rounded-3xl p-10 lg:p-12 text-white relative overflow-hidden shadow-2xl">
        {/* Ambient background orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl" />

        {/* Header */}
        <div className="relative mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100">
              Ecosystem
            </p>
          </div>
          <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
            Your Services Reach the Entire DCC Network
          </h3>
          <p className="text-base text-blue-100 max-w-2xl leading-relaxed">
            Connect with members, employers, and associations across the
            Discount Club Cayman ecosystem
          </p>
        </div>

        {/* Global reach cards */}
        <div className="grid sm:grid-cols-3 gap-5 relative">
          {[
            {
              icon: "🏢",
              title: "Members",
              desc: "Individual members browse the B2B directory for professional services",
            },
            {
              icon: "👔",
              title: "Employers",
              desc: "Companies find B2B partners for their corporate and operational needs",
            },
            {
              icon: "🤝",
              title: "Associations",
              desc: "Organizations connect with trusted service providers in the network",
            },
          ].map(({ icon, title, desc, count, label }) => (
            <div
              key={title}
              className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              {/* Hover gradient accent */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-blue-400/5 transition-all duration-300" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-300">
                      {count}
                    </p>
                    <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wider">
                      {label}
                    </p>
                  </div>
                </div>

                <h4 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-200 transition-colors">
                  {title}
                </h4>
                <p className="text-sm text-blue-100 leading-relaxed group-hover:text-blue-50 transition-colors">
                  {desc}
                </p>
              </div>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400/50 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
            </div>
          ))}
        </div>

        {/* Bottom CTA Info */}
        <div className="relative mt-10 pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-100 mb-1">
                Ready to expand your reach?
              </p>
              <p className="text-xs text-white/60">
                Join thousands of service providers in the DCC ecosystem
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Growing Network
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: Leads ───────────────────────────────────────────────────────────────
const LeadsTab = ({ enquiries, loading }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  if (loading) return <Spinner />;

  const filtered = (enquiries || []).filter((e) => {
    if (filter === "new" && e.status === "read") return false;
    if (filter === "read" && e.status !== "read") return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (e.name || "").toLowerCase().includes(s) ||
        (e.email || "").toLowerCase().includes(s) ||
        (e.message || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  if (!enquiries?.length)
    return (
      <EmptyState
        icon="📩"
        title="No leads yet"
        desc="When members or businesses contact you through the directory, their enquiries will appear here as leads."
      />
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            Leads & Enquiries
          </h3>
          <p className="text-sm text-slate-400">
            {enquiries.length} total ·{" "}
            {enquiries.filter((e) => e.status !== "read").length} new
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors w-48"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:border-[#1C4D8D]"
          >
            <option value="all">All Leads</option>
            <option value="new">New</option>
            <option value="read">Responded</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((enq) => {
          const subParts = (enq.subject || "").split(":");
          const subject =
            subParts.length >= 3
              ? subParts.slice(2).join(":")
              : enq.subject || "General Enquiry";
          return (
            <GlassCard key={enq.id} className="p-5 group">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
                    {(enq.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {enq.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-slate-400">{enq.email}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusPill status={enq.status} />
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                    {new Date(enq.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {subject}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {enq.message}
                </p>
              </div>
              {enq.phone && (
                <div className="mt-3 flex items-center gap-3">
                  <a
                    href={`tel:${enq.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#1C4D8D] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    📞 {enq.phone}
                  </a>
                  <a
                    href={`mailto:${enq.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    ✉️ Reply
                  </a>
                </div>
              )}
            </GlassCard>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">
            No leads match your search.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── TAB: Services ────────────────────────────────────────────────────────────
const ServicesTab = ({ profile, onSaveProfile }) => {
  const parseServices = (text) => {
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return text
      .split(/[,;\n]+/)
      .filter((s) => s.trim())
      .map((s, i) => ({
        id: `svc-${i}`,
        name: s.trim(),
        description: "",
        pricing: "",
      }));
  };

  const [services, setServices] = useState(() =>
    parseServices(profile?.servicesOffered),
  );
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({ name: "", description: "", pricing: "" });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditIdx(-1);
    setForm({ name: "", description: "", pricing: "" });
    setShowModal(true);
  };
  const openEdit = (idx) => {
    setEditIdx(idx);
    setForm({ ...services[idx] });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const updated = [...services];
    if (editIdx >= 0) updated[editIdx] = { ...updated[editIdx], ...form };
    else updated.push({ id: `svc-${Date.now()}`, ...form });
    setServices(updated);
    setShowModal(false);
    persistServices(updated);
  };

  const handleDelete = (idx) => {
    const updated = services.filter((_, i) => i !== idx);
    setServices(updated);
    persistServices(updated);
  };

  const persistServices = async (list) => {
    setSaving(true);
    try {
      await onSaveProfile({ servicesOffered: JSON.stringify(list) });
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">
            Service Portfolio
          </h3>
          <p className="text-sm text-slate-400">
            {services.length} service{services.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Service
        </button>
      </div>

      {saving && (
        <div className="text-center text-sm text-[#1C4D8D] font-medium py-2 bg-blue-50 rounded-xl">
          Saving changes...
        </div>
      )}

      {services.length === 0 ? (
        <EmptyState
          icon="🛠️"
          title="No services added"
          desc="Add your services with descriptions and pricing to show potential clients what you offer."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {services.map((svc, i) => (
            <GlassCard key={svc.id || i} className="p-6 relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => openEdit(i)}
                  className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center text-[#1C4D8D] transition-colors text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-500 transition-colors text-sm"
                >
                  🗑️
                </button>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-violet-50 rounded-xl flex items-center justify-center text-xl mb-4">
                🛠️
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">
                {svc.name}
              </h4>
              {svc.description && (
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  {svc.description}
                </p>
              )}
              {svc.pricing && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-xs font-bold text-emerald-700">
                    💰 {svc.pricing}
                  </span>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">
                {editIdx >= 0 ? "Edit Service" : "Add Service"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Service Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Digital Marketing"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe what this service includes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Pricing
                </label>
                <input
                  value={form.pricing}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pricing: e.target.value }))
                  }
                  placeholder="e.g. From $500/month or Contact for quote"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!form.name.trim()}
                className="w-full py-3 bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editIdx >= 0 ? "Save Changes" : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TAB: Analytics ───────────────────────────────────────────────────────────
const AnalyticsTab = ({ profile, stats, enquiries }) => {
  const views = stats?.profileViews ?? 0;
  const totalEnq = stats?.enquiries ?? 0;
  const responded = totalEnq - (stats?.newEnquiries ?? 0);
  const conversionRate = views > 0 ? ((totalEnq / views) * 100).toFixed(1) : 0;
  const responseRate =
    totalEnq > 0 ? ((responded / totalEnq) * 100).toFixed(0) : 0;

  const completeness = Math.round(
    ([
      profile?.companyName,
      profile?.servicesOffered,
      profile?.phone,
      profile?.email,
      profile?.website,
      profile?.logoUrl,
    ].filter(Boolean).length /
      6) *
      100,
  );

  // Monthly breakdown from enquiries
  const monthMap = {};
  (enquiries || []).forEach((e) => {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    if (!monthMap[key]) monthMap[key] = { label, count: 0 };
    monthMap[key].count++;
  });
  const monthData = Object.values(monthMap).slice(-6);
  const maxCount = Math.max(...monthData.map((m) => m.count), 1);

  return (
    <div className="space-y-8">
      {/* Conversion Funnel */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-5">
          Conversion Funnel
        </h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            {
              label: "Profile Views",
              value: views,
              icon: "👁️",
              gradient: "from-blue-400 to-blue-600",
            },
            {
              label: "Enquiries",
              value: totalEnq,
              icon: "📩",
              gradient: "from-emerald-400 to-emerald-600",
            },
            {
              label: "Responded",
              value: responded,
              icon: "💬",
              gradient: "from-violet-400 to-violet-600",
            },
            {
              label: "Conversion",
              value: `${conversionRate}%`,
              icon: "🎯",
              gradient: "from-amber-400 to-orange-500",
            },
          ].map((item, i) => (
            <div key={item.label} className="relative">
              <StatCard {...item} />
              {i < 3 && (
                <div className="hidden sm:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-300 text-lg z-10">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid sm:grid-cols-2 gap-5">
        <GlassCard hover={false} className="p-6">
          <h4 className="font-bold text-slate-900 mb-4">Response Rate</h4>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#1C4D8D"
                  strokeWidth="8"
                  strokeDasharray={`${responseRate * 2.64} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-slate-900">
                  {responseRate}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">
                {responded} of {totalEnq} enquiries responded
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Keep your response rate high to build trust
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-6">
          <h4 className="font-bold text-slate-900 mb-4">
            Profile Completeness
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Score</span>
              <span className="font-bold text-slate-900">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1C4D8D] to-[#4988C4] rounded-full transition-all duration-700"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { l: "Name", d: !!profile?.companyName },
                { l: "Services", d: !!profile?.servicesOffered },
                { l: "Phone", d: !!profile?.phone },
                { l: "Email", d: !!profile?.email },
                { l: "Website", d: !!profile?.website },
                { l: "Logo", d: !!profile?.logoUrl },
              ].map(({ l, d }) => (
                <div key={l} className="flex items-center gap-2 text-xs">
                  <span className={d ? "text-emerald-500" : "text-slate-300"}>
                    {d ? "✓" : "○"}
                  </span>
                  <span className={d ? "text-slate-600" : "text-slate-400"}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Enquiry Trend */}
      {monthData.length > 0 && (
        <GlassCard hover={false} className="p-6">
          <h4 className="font-bold text-slate-900 mb-5">Enquiry Trend</h4>
          <div className="h-48 flex items-end justify-between gap-3">
            {monthData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-[#1C4D8D]">
                  {m.count}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-[#1C4D8D] to-[#4988C4] rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${(m.count / maxCount) * 140}px`,
                    minHeight: "12px",
                  }}
                />
                <span className="text-xs font-semibold text-slate-500">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// ─── TAB: Profile ─────────────────────────────────────────────────────────────
const ProfileTab = ({ profile, onSave }) => {
  const parseServices = (text) => {
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return text
      .split(/[,;\n]+/)
      .filter((s) => s.trim())
      .map((s, i) => ({
        id: `svc-${i}`,
        name: s.trim(),
        description: "",
        pricing: "",
      }));
  };

  const [form, setForm] = useState({
    companyName: profile?.companyName || "",
    servicesOffered: profile?.servicesOffered || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    logoUrl: profile?.logoUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handle = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    )
      return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const { url } = await uploadAPI.image(file);
      setForm((f) => ({ ...f, logoUrl: url }));
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.companyName.trim() || !form.servicesOffered.trim()) {
      setError("Company name and services are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, field, placeholder, type = "text" }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={handle(field)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
      />
    </div>
  );

  const [services, setServices] = useState(() =>
    parseServices(form.servicesOffered),
  );
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editServiceIdx, setEditServiceIdx] = useState(-1);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    pricing: "",
  });

  const openAddService = () => {
    setEditServiceIdx(-1);
    setServiceForm({ name: "", description: "", pricing: "" });
    setShowServiceModal(true);
  };

  const openEditService = (idx) => {
    setEditServiceIdx(idx);
    setServiceForm(services[idx]);
    setShowServiceModal(true);
  };

  const saveService = () => {
    if (!serviceForm.name.trim()) return;
    const updatedServices = [...services];
    if (editServiceIdx >= 0) {
      updatedServices[editServiceIdx] = serviceForm;
    } else {
      updatedServices.push({
        id: `svc-${Date.now()}`,
        ...serviceForm,
      });
    }
    setServices(updatedServices);
    setForm((p) => ({
      ...p,
      servicesOffered: JSON.stringify(updatedServices),
    }));
    setShowServiceModal(false);
  };

  const deleteService = (idx) => {
    const updatedServices = services.filter((_, i) => i !== idx);
    setServices(updatedServices);
    setForm((p) => ({
      ...p,
      servicesOffered: JSON.stringify(updatedServices),
    }));
  };

  return (
    <GlassCard hover={false} className="p-6 space-y-5">
      <div>
        <h3 className="font-black text-slate-900 text-lg">Business Profile</h3>
        <p className="text-sm text-slate-400 mt-0.5">
          This is how you appear in the B2B Partner Directory
        </p>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          ✅ Profile saved successfully
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-5">
        <Field
          label="Company Name *"
          field="companyName"
          placeholder="Your Business Name"
        />
        <Field
          label="Phone"
          field="phone"
          placeholder="+1 (345) 555-0000"
          type="tel"
        />
        <Field
          label="Business Email"
          field="email"
          placeholder="hello@yourbusiness.com"
          type="email"
        />
        <Field
          label="Website"
          field="website"
          placeholder="https://yourbusiness.com"
          type="url"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Services Offered *
            </label>
            <p className="text-xs text-slate-400">
              {services.length} service{services.length !== 1 ? "s" : ""} added
            </p>
          </div>
          <button
            onClick={openAddService}
            className="px-4 py-2 bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white rounded-lg font-bold text-xs hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <span className="text-sm">+</span> Add Service
          </button>
        </div>

        {services.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-slate-500 text-sm">No services added yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your first service to get started
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map((svc, idx) => (
              <div
                key={svc.id || idx}
                className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                  🛠️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {svc.name}
                  </h4>
                  {svc.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {svc.description}
                    </p>
                  )}
                  {svc.pricing && (
                    <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 mt-2">
                      💰 {svc.pricing}
                    </span>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditService(idx)}
                    className="w-7 h-7 bg-blue-50 hover:bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteService(idx)}
                    className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded flex items-center justify-center text-red-500 text-xs transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showServiceModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowServiceModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editServiceIdx >= 0 ? "Edit Service" : "Add Service"}
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Service Name *
                </label>
                <input
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Web Development"
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What does this service include?"
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Pricing
                </label>
                <input
                  value={serviceForm.pricing}
                  onChange={(e) =>
                    setServiceForm((p) => ({ ...p, pricing: e.target.value }))
                  }
                  placeholder="e.g. From $500/month"
                  className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
                />
              </div>
              <button
                onClick={saveService}
                disabled={!serviceForm.name.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editServiceIdx >= 0 ? "Save Changes" : "Add Service"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
          Business Logo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={uploading}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1C4D8D] hover:file:bg-blue-100"
        />
        {uploading && (
          <p className="text-xs text-slate-400 mt-1">Uploading...</p>
        )}
        {form.logoUrl && (
          <div className="mt-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <AppImage
                src={form.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, logoUrl: "" }))}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <button
        onClick={submit}
        disabled={saving}
        className="px-8 py-3 bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
            Saving…
          </>
        ) : (
          "Save Profile"
        )}
      </button>
    </GlassCard>
  );
};

// ─── TAB: Directory Preview ───────────────────────────────────────────────────
const PreviewTab = ({ profile }) => {
  if (!profile) return <Spinner />;
  const completeness = Math.round(
    ([
      profile.companyName,
      profile.servicesOffered,
      profile.phone,
      profile.email,
      profile.website,
      profile.logoUrl,
    ].filter(Boolean).length /
      6) *
      100,
  );
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-4 text-sm text-emerald-800 flex items-center gap-2 font-medium">
        👁️ <strong>Directory Preview</strong> — this is exactly how DCC members
        see your listing
      </div>
      <div className="max-w-sm mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 hover:shadow-3xl transition-all duration-300">
          {/* Premium Header with Gradient */}
          <div className="relative h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 overflow-hidden">
            {/* Ambient orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl" />

            {/* B2B Partner Badge */}
            <div className="absolute top-3 right-3 z-10 text-[10px] font-black px-3 py-1.5 bg-white/25 backdrop-blur-md text-white rounded-full uppercase tracking-wide border border-white/40 shadow-lg">
              B2B Partner
            </div>
          </div>

          {/* Company Logo - Overlapping */}
          <div className="flex justify-center -mt-14 mb-4 relative z-20">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-xl border-4 border-slate-50 overflow-hidden">
              {profile.logoUrl ? (
                <AppImage
                  src={profile.logoUrl}
                  alt={profile.companyName}
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                  <span className="text-emerald-600 font-black text-4xl">
                    {(profile.companyName || "B")[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="px-6 pb-7 text-center">
            <h3 className="font-black text-slate-900 text-xl leading-tight mb-1">
              {profile.companyName || "Your Company"}
            </h3>

            {/* Services/Description */}
            {profile.servicesOffered && (
              <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-3 font-medium">
                {typeof profile.servicesOffered === "string" &&
                profile.servicesOffered.startsWith("[")
                  ? JSON.parse(profile.servicesOffered)
                      .map((s) => s.name)
                      .join(", ")
                  : profile.servicesOffered}
              </p>
            )}

            {/* Contact Details */}
            <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  📞 <span className="font-semibold">{profile.phone}</span>
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  ✉️{" "}
                  <span className="font-semibold truncate">
                    {profile.email}
                  </span>
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  🌐{" "}
                  <span className="font-semibold">
                    {profile.website.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}
            </div>

            {/* Premium Contact Button */}
            <div className="mt-6 flex gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:-translate-y-0.5">
                Contact This Business
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Strength - Enhanced */}
      <GlassCard hover={false} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900">Profile Strength</h4>
          <span className="text-lg font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            {completeness}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Complete your profile to appear higher in search results
        </p>
      </GlassCard>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const B2BDashboardContent = () => {
  const user = getUser();
  const [tab, setTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enqLoading, setEnqLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [prof, st] = await Promise.allSettled([
          b2bAPI.getProfile(),
          b2bAPI.getStats(),
        ]);
        if (prof.status === "fulfilled") setProfile(prof.value);
        if (st.status === "fulfilled") setStats(st.value);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load enquiries when leads/analytics tab or on mount
  const loadEnquiries = useCallback(async () => {
    setEnqLoading(true);
    try {
      const res = await b2bAPI.getEnquiries();
      setEnquiries(Array.isArray(res) ? res : (res?.enquiries ?? []));
    } catch {
      setEnquiries([]);
    } finally {
      setEnqLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "leads" || tab === "analytics" || tab === "dashboard")
      loadEnquiries();
  }, [tab, loadEnquiries]);

  const handleSaveProfile = async (data) => {
    const updated = await b2bAPI.updateProfile({ ...profile, ...data });
    setProfile(updated);
  };

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "leads", label: "Leads", icon: "📩" },
    { id: "services", label: "Services", icon: "🛠️" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "profile", label: "Profile", icon: "✏️" },
    { id: "preview", label: "Preview", icon: "👁️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-indigo-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-violet-100/30 to-purple-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-100/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Premium Header - Emerald & Teal */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 md:p-10 shadow-[0_30px_80px_rgba(16,185,129,0.2)]">
            {/* Ambient teal/cyan orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-cyan-100 font-semibold text-[11px] uppercase tracking-[0.25em] mb-3 opacity-90">
                  B2B Partner Portal
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-2">
                  {loading
                    ? "Loading…"
                    : profile?.companyName || "Your B2B Dashboard"}
                </h1>
                <p className="text-cyan-50/90 text-base max-w-xl leading-relaxed font-light">
                  Manage your partner profile, track leads, and grow your
                  business
                </p>
              </div>
              {profile && (
                <Badge status={profile.isApproved ? "APPROVED" : "PENDING"} />
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-1.5 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-gradient-to-r from-[#1C4D8D] to-[#2a5fa8] text-white shadow-md shadow-[#1C4D8D]/20" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <span className="text-base">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <Spinner />
        ) : (
          <>
            {tab === "dashboard" && (
              <DashboardTab
                profile={profile}
                stats={stats}
                enquiries={enquiries}
                onTabChange={setTab}
              />
            )}
            {tab === "leads" && (
              <LeadsTab enquiries={enquiries} loading={enqLoading} />
            )}
            {tab === "services" && (
              <ServicesTab
                profile={profile}
                onSaveProfile={handleSaveProfile}
              />
            )}
            {tab === "analytics" && (
              <AnalyticsTab
                profile={profile}
                stats={stats}
                enquiries={enquiries}
              />
            )}
            {tab === "profile" && (
              <ProfileTab profile={profile} onSave={handleSaveProfile} />
            )}
            {tab === "preview" && <PreviewTab profile={profile} />}
          </>
        )}
      </div>
    </div>
  );
};

export default B2BDashboardContent;
