// Frontend/src/user/pages/AssociationDashboard/AssociationMemberDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { associationAPI } from "../../../services/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000),
    h = Math.floor(diff / 3600000),
    days = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${days}d ago`;
};

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
    INVITED: "bg-amber-50 text-amber-700 border-amber-100",
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

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

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

// ── Add Member Modal ──────────────────────────────────────────────────────────
const AddMemberModal = ({ onClose, onAdded }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    setLoading(true);
    try {
      await associationAPI.addMember(name, email);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add member");
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
        <h3 className="font-bold text-slate-900 mb-5">Add Member</h3>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              label: "Full Name",
              val: name,
              set: setName,
              type: "text",
              ph: "John Smith",
            },
            {
              label: "Email",
              val: email,
              set: setEmail,
              type: "email",
              ph: "john@example.com",
            },
          ].map(({ label, val, set, type, ph }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={val}
                onChange={(e) => set(e.target.value)}
                placeholder={ph}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300"
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
      </div>
    </div>
  );
};

// ── CSV Upload Modal ──────────────────────────────────────────────────────────
const CSVModal = ({ onClose, onAdded }) => {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").slice(1);
    return lines
      .map((l) => {
        const [name, email] = l
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""));
        return { name, email };
      })
      .filter((r) => r.name && r.email);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setParsed(parseCSV(ev.target.result));
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!parsed.length) {
      setError("No valid rows found in CSV");
      return;
    }
    setLoading(true);
    try {
      const res = await associationAPI.bulkAddMembers(parsed);
      setResult(res);
      onAdded();
    } catch (err) {
      setError(err.message || "Upload failed");
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
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-slate-900 mb-2">Bulk Upload via CSV</h3>
        <p className="text-xs text-slate-400 mb-5">
          CSV format:{" "}
          <code className="bg-slate-100 px-1 rounded">name,email</code> (with
          header row)
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        {result ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
              ✓
            </div>
            <p className="font-bold text-slate-900">
              {result.created} member{result.created !== 1 ? "s" : ""} invited
            </p>
            {result.skipped > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {result.skipped} already existed — skipped
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <label className="block cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#1C4D8D] transition-colors mb-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="sr-only"
              />
              <p className="text-slate-500 text-sm">
                {file ? file.name : "Click to select a CSV file"}
              </p>
              {parsed.length > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  {parsed.length} valid rows found
                </p>
              )}
            </label>
            {parsed.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl mb-4">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-slate-400 font-bold">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {parsed.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-700">{r.name}</td>
                        <td className="px-3 py-2 text-slate-500">{r.email}</td>
                      </tr>
                    ))}
                    {parsed.length > 10 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 py-2 text-slate-400 text-center"
                        >
                          +{parsed.length - 10} more
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !parsed.length}
                className="flex-1 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Upload {parsed.length > 0 ? `(${parsed.length})` : ""}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Join Code Panel ───────────────────────────────────────────────────────────
const JoinCodePanel = ({
  joinCode,
  onGenerate,
  onToggle,
  enabled,
  loading,
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-slate-900">Join Code</h3>
      {joinCode && (
        <button
          onClick={onToggle}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${enabled ? "border-red-200 text-red-500 hover:bg-red-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}
        >
          {enabled ? "Disable" : "Enable"}
        </button>
      )}
    </div>

    {joinCode ? (
      <div
        className={`rounded-xl border-2 p-4 mb-4 ${enabled ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
      >
        <p className="text-xs font-bold text-slate-400 mb-1">
          Current Code {!enabled && "(disabled)"}
        </p>
        <div className="flex items-center gap-3">
          <p
            className={`text-2xl font-black tracking-widest font-mono flex-1 ${enabled ? "text-emerald-700" : "text-slate-400"}`}
          >
            {joinCode}
          </p>
          {/* Copy button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(joinCode);
            }}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              enabled
                ? "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            disabled={!enabled}
            title="Copy to clipboard"
          >
            Copy
          </button>
        </div>
      </div>
    ) : (
      <p className="text-sm text-slate-400 mb-4">
        No join code generated yet. Generate one so members can self-join.
      </p>
    )}

    <button
      onClick={onGenerate}
      disabled={loading}
      className="w-full py-2.5 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-xl text-sm font-bold hover:bg-[#1C4D8D] hover:text-white transition-all disabled:opacity-50"
    >
      {loading
        ? "Generating..."
        : joinCode
          ? "Regenerate Code"
          : "Generate Join Code"}
    </button>

    {joinCode && enabled && (
      <p className="text-xs text-slate-400 text-center mt-3">
        Members enter this code in their dashboard to instantly link their
        account.
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const AssociationMemberDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setML] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
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

  const loadMembers = useCallback(async () => {
    setML(true);
    try {
      const res = await associationAPI.getMembers({
        page,
        limit: 15,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setMembers(res.members || []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Members load error:", err.message);
    } finally {
      setML(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleGenerateCode = async () => {
    setCodeLoading(true);
    try {
      await associationAPI.generateJoinCode();
      showToast("success", "Join code generated");
      loadDashboard();
    } catch (err) {
      showToast("error", err.message || "Failed");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleToggleCode = async () => {
    const enabled = dashboard?.joinCode !== null;
    setCodeLoading(true);
    try {
      await associationAPI.toggleJoinCode(!enabled);
      showToast("success", `Join code ${!enabled ? "enabled" : "disabled"}`);
      loadDashboard();
    } catch (err) {
      showToast("error", err.message || "Failed");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleResend = async (id) => {
    try {
      await associationAPI.resendMemberInvite(id);
      showToast("success", "Invite resent");
    } catch (err) {
      showToast("error", err.message || "Failed to resend");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this member from the association?")) return;
    try {
      await associationAPI.removeMember(id);
      showToast("success", "Member removed");
      loadMembers();
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
      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            loadMembers();
            loadDashboard();
          }}
        />
      )}
      {showCSV && (
        <CSVModal
          onClose={() => setShowCSV(false)}
          onAdded={() => {
            loadMembers();
            loadDashboard();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1C4D8D] mb-1">
              Member Association
            </p>
            <h1 className="text-3xl font-black text-slate-900">
              Association Dashboard
            </h1>
            {dashboard && (
              <p className="text-slate-400 text-sm mt-1">
                {dashboard.memberCounts?.active ?? 0} active members
              </p>
            )}
          </div>
          {tab === "members" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCSV(true)}
                className="px-4 py-2.5 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-xl text-sm font-bold hover:bg-[#1C4D8D] hover:text-white transition-all"
              >
                ↑ CSV Upload
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71]"
              >
                + Add Member
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && dashboard === null && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
            <p className="font-bold text-amber-700 mb-1">Pending Approval</p>
            <p className="text-sm text-amber-600">
              Your association is awaiting admin approval. You'll be notified by
              email once approved.
            </p>
          </div>
        )}

        {/* Tabs — only 3: Overview, Members, Join Code */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6">
          {[
            { key: "overview", label: "Overview" },
            {
              key: "members",
              label: `Members${total > 0 ? ` (${total})` : ""}`,
            },
            { key: "joincode", label: "Join Code" },
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
                  icon="👥"
                  label="Total Members"
                  value={dashboard?.memberCounts?.total ?? 0}
                  color="bg-blue-50"
                />
                <StatCard
                  icon="✓"
                  label="Active"
                  value={dashboard?.memberCounts?.active ?? 0}
                  sub="Accepted invite"
                  color="bg-emerald-50"
                />
                <StatCard
                  icon="📧"
                  label="Invited"
                  value={dashboard?.memberCounts?.invited ?? 0}
                  sub="Pending acceptance"
                  color="bg-amber-50"
                />
                <StatCard
                  icon="💰"
                  label="Total Savings"
                  value={`$${(dashboard?.totalSavings ?? 0).toFixed(2)}`}
                  sub="Across all members"
                  color="bg-violet-50"
                />
              </div>
            )}
            {!loading && dashboard?.topMembers?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50">
                  <h3 className="font-bold text-slate-900">
                    Top Members by Savings
                  </h3>
                </div>
                <ul className="divide-y divide-slate-50">
                  {dashboard.topMembers.map((m, i) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 px-6 py-3"
                    >
                      <span className="text-xs font-black text-slate-300 w-5">
                        #{i + 1}
                      </span>
                      <div className="w-8 h-8 bg-[#1C4D8D]/10 rounded-xl flex items-center justify-center text-[#1C4D8D] font-bold text-xs flex-shrink-0">
                        {m.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {m.email}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">
                        ${m.totalSavings.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === "members" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["", "ACTIVE", "INVITED", "REMOVED"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${statusFilter === s ? "bg-[#1C4D8D] text-white border-[#1C4D8D]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
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
                      {["Member", "Email", "Status", "Joined", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {membersLoading ? (
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
                    ) : members.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-slate-300 text-sm"
                        >
                          No members yet
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-[#1C4D8D]/10 rounded-lg flex items-center justify-center text-[#1C4D8D] font-bold text-xs">
                                {m.name[0]?.toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-900">
                                {m.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 max-w-[180px] truncate">
                            {m.email}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={m.status} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs">
                            {m.inviteAcceptedAt
                              ? timeAgo(m.inviteAcceptedAt)
                              : timeAgo(m.inviteSentAt)}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1.5">
                              {m.status === "INVITED" && (
                                <button
                                  onClick={() => handleResend(m.id)}
                                  className="px-2.5 py-1.5 text-xs font-bold bg-blue-50 text-[#1C4D8D] rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  Resend
                                </button>
                              )}
                              {m.status !== "REMOVED" && (
                                <button
                                  onClick={() => handleRemove(m.id)}
                                  className="px-2.5 py-1.5 text-xs font-bold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
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

        {/* ── JOIN CODE TAB ── */}
        {tab === "joincode" && (
          <div className="max-w-md">
            <JoinCodePanel
              joinCode={dashboard?.joinCode}
              onGenerate={handleGenerateCode}
              onToggle={handleToggleCode}
              enabled={dashboard?.joinCode !== null}
              loading={codeLoading}
            />
            <div className="mt-4 bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <p className="text-xs font-bold text-[#1C4D8D] mb-2">
                How join codes work
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Share this code with your members</li>
                <li>
                  Members paste it in the "Join Association" section of their
                  dashboard
                </li>
                <li>Their account is instantly linked — no approval needed</li>
                <li>
                  Regenerating the code invalidates the old one immediately
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationMemberDashboard;
