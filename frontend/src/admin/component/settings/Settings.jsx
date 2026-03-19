// Frontend/src/admin/component/settings/Settings.jsx
// Admin settings: Advertisement management, Audit log, Platform config

import React, { useEffect, useState, useCallback } from "react";
import { adminAPI, advertisementAPI } from "../../../../src/services/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, sub, action, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ── Advertisement card ────────────────────────────────────────────────────────
const AdCard = ({ ad, onToggle, toggling }) => (
  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
    {ad.imageUrl && (
      <img
        src={ad.imageUrl}
        alt={ad.title}
        className="w-20 h-12 object-cover rounded-lg flex-shrink-0 border border-slate-200"
      />
    )}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-900 text-sm truncate">
        {ad.title}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">
        Placement:{" "}
        <span className="font-medium text-slate-600">{ad.placement}</span>
        {" · "}
        {ad.impressions ?? 0} impressions · {ad.clicks ?? 0} clicks
      </p>
      {ad.startDate && (
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date(ad.startDate).toLocaleDateString()} —{" "}
          {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : "Ongoing"}
        </p>
      )}
    </div>
    <button
      onClick={() => onToggle(ad)}
      disabled={toggling === ad.id}
      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
        ad.status === "ACTIVE"
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      } disabled:opacity-40`}
    >
      {toggling === ad.id ? (
        <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
      ) : ad.status === "ACTIVE" ? (
        "Deactivate"
      ) : (
        "Activate"
      )}
    </button>
  </div>
);

// ── Audit log row ─────────────────────────────────────────────────────────────
const AuditRow = ({ log }) => {
  const actionColor = {
    CREATE: "bg-emerald-50 text-emerald-700",
    UPDATE: "bg-blue-50 text-blue-700",
    DELETE: "bg-red-50 text-red-500",
    APPROVE: "bg-violet-50 text-violet-700",
    REJECT: "bg-amber-50 text-amber-700",
  };
  const action = log.action?.toUpperCase();
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span
        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${actionColor[action] || "bg-slate-100 text-slate-500"}`}
      >
        {action || "LOG"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800">
          <span className="font-medium">{log.entity}</span>
          {log.entityId && (
            <span className="text-slate-400 text-xs ml-1">
              #{log.entityId.slice(-6)}
            </span>
          )}
        </p>
        {log.details && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {typeof log.details === "string"
              ? log.details
              : JSON.stringify(log.details)}
          </p>
        )}
      </div>
      <span className="text-[11px] text-slate-300 flex-shrink-0 whitespace-nowrap">
        {timeAgo(log.createdAt)}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Settings = () => {
  const [activeTab, setActiveTab] = useState("ads");
  const [toast, setToast] = useState(null);

  // Ads state
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState("");
  const [toggling, setToggling] = useState(null);

  // Audit log state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(false);
  const [inqError, setInqError] = useState("");
  const [inqStatus, setInqStatus] = useState("");
  const [responding, setResponding] = useState(null); // inquiry being responded to
  const [responseText, setResponseText] = useState("");

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Load ads
  const loadAds = useCallback(async () => {
    setAdsLoading(true);
    setAdsError("");
    try {
      const res = await advertisementAPI.getActive();
      setAds(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setAdsError(err.message || "Failed to load advertisements");
    } finally {
      setAdsLoading(false);
    }
  }, []);

  // Load audit log
  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError("");
    try {
      const res = await adminAPI.getAuditLog({ page: logsPage, limit: 20 });
      setLogs(Array.isArray(res) ? res : (res?.data ?? []));
      setLogsTotal(res?.pagination?.total ?? 0);
    } catch (err) {
      setLogsError(err.message || "Failed to load audit log");
    } finally {
      setLogsLoading(false);
    }
  }, [logsPage]);

  // Load inquiries
  const loadInquiries = useCallback(async () => {
    setInqLoading(true);
    setInqError("");
    try {
      const params = inqStatus ? { status: inqStatus } : {};
      const res = await adminAPI.getInquiries(params);
      setInquiries(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setInqError(err.message || "Failed to load inquiries");
    } finally {
      setInqLoading(false);
    }
  }, [inqStatus]);

  useEffect(() => {
    if (activeTab === "ads") loadAds();
  }, [activeTab, loadAds]);
  useEffect(() => {
    if (activeTab === "audit") loadLogs();
  }, [activeTab, loadLogs]);
  useEffect(() => {
    if (activeTab === "inquiries") loadInquiries();
  }, [activeTab, loadInquiries]);

  const handleToggleAd = async (ad) => {
    setToggling(ad.id);
    try {
      const newStatus = ad.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await advertisementAPI.setStatus(ad.id, newStatus);
      setAds((prev) =>
        prev.map((a) => (a.id === ad.id ? { ...a, status: newStatus } : a)),
      );
      showToast(
        "success",
        `Ad ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`,
      );
    } catch (err) {
      showToast("error", err.message || "Failed to update ad status");
    } finally {
      setToggling(null);
    }
  };

  const handleRespond = async (inquiry) => {
    if (!responseText.trim()) return;
    try {
      await adminAPI.updateInquiryStatus(inquiry.id, "responded", responseText);
      showToast("success", "Response sent");
      setResponding(null);
      setResponseText("");
      loadInquiries();
    } catch (err) {
      showToast("error", err.message || "Failed to send response");
    }
  };

  const TABS = [
    { key: "ads", label: "Advertisements", icon: "📢" },
    { key: "inquiries", label: "Inquiries", icon: "📩" },
    { key: "audit", label: "Audit Log", icon: "📋" },
  ];

  const INQ_STATUS_COLOR = {
    pending: "bg-amber-50 text-amber-700",
    responded: "bg-emerald-50 text-emerald-700",
    resolved: "bg-blue-50 text-[#1C4D8D]",
    closed: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
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

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Platform configuration, advertisements, and logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* ── ADS TAB ── */}
      {activeTab === "ads" && (
        <Section
          title="Advertisement Management"
          sub="Control which ads are active on the platform"
        >
          {adsError && <p className="text-sm text-red-500 mb-4">{adsError}</p>}
          {adsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 text-slate-300">
              <p className="text-2xl mb-2">📢</p>
              <p className="text-sm">No advertisements found</p>
              <p className="text-xs mt-1">
                Businesses create ads through the business dashboard
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  {
                    label: "Total",
                    value: ads.length,
                    color: "text-slate-900",
                  },
                  {
                    label: "Active",
                    value: ads.filter((a) => a.status === "ACTIVE").length,
                    color: "text-emerald-600",
                  },
                  {
                    label: "Inactive",
                    value: ads.filter((a) => a.status !== "ACTIVE").length,
                    color: "text-slate-400",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-slate-50 rounded-xl p-3 text-center"
                  >
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onToggle={handleToggleAd}
                  toggling={toggling}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── INQUIRIES TAB ── */}
      {activeTab === "inquiries" && (
        <Section
          title="Contact Inquiries"
          sub="Messages from the contact form"
          action={
            <div className="relative">
              <select
                value={inqStatus}
                onChange={(e) => {
                  setInqStatus(e.target.value);
                }}
                className="appearance-none pl-3 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 cursor-pointer"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▾
              </span>
            </div>
          }
        >
          {inqError && <p className="text-sm text-red-500 mb-4">{inqError}</p>}
          {inqLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-300">
              <p className="text-2xl mb-2">📩</p>
              <p className="text-sm">No inquiries found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-slate-50 rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 text-sm">
                          {inq.name}
                        </p>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${INQ_STATUS_COLOR[inq.status] || "bg-slate-100 text-slate-500"}`}
                        >
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {inq.email} · {timeAgo(inq.createdAt)}
                      </p>
                    </div>
                    {inq.status === "pending" && (
                      <button
                        onClick={() => {
                          setResponding(inq);
                          setResponseText("");
                        }}
                        className="flex-shrink-0 px-3 py-1.5 bg-[#1C4D8D] text-white rounded-xl text-xs font-bold hover:bg-[#163d71] transition-colors"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    {inq.subject}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {inq.message}
                  </p>
                  {inq.response && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-400 mb-1">
                        Admin response:
                      </p>
                      <p className="text-xs text-slate-600">{inq.response}</p>
                    </div>
                  )}

                  {/* Inline respond form */}
                  {responding?.id === inq.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#1C4D8D] resize-none transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setResponding(null)}
                          className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:border-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(inq)}
                          disabled={!responseText.trim()}
                          className="flex-1 py-2 bg-[#1C4D8D] text-white rounded-xl text-xs font-bold hover:bg-[#163d71] disabled:opacity-50"
                        >
                          Send Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── AUDIT LOG TAB ── */}
      {activeTab === "audit" && (
        <Section title="Audit Log" sub="All admin actions across the platform">
          {logsError && (
            <p className="text-sm text-red-500 mb-4">{logsError}</p>
          )}
          {logsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-300">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm">No audit logs yet</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <AuditRow key={log.id} log={log} />
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                <p className="text-xs text-slate-400">Page {logsPage}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                    disabled={logsPage === 1}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40 hover:border-slate-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setLogsPage((p) => p + 1)}
                    disabled={logs.length < 20}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40 hover:border-slate-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </Section>
      )}
    </div>
  );
};

export default Settings;
