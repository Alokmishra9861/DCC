// Frontend/src/user/pages/AssociationDashboard/AssociationMemberDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { associationAPI } from "../../../services/api";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

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
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    INVITED: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    REMOVED: "bg-rose-50 text-rose-600 ring-1 ring-rose-600/20",
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${map[status] || "bg-slate-50 text-slate-500 ring-1 ring-slate-200"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : status === "INVITED" ? "bg-amber-500" : status === "REMOVED" ? "bg-rose-500" : "bg-slate-400"}`}
      />
      {status}
    </span>
  );
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100/80 rounded-2xl ${className}`} />
);

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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1C4D8D] to-indigo-500" />

        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-2xl font-bold text-slate-900"
            style={HEADING_FONT}
          >
            Add Member
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
            <Icon name="ExclamationTriangleIcon" size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            {
              label: "Full Name",
              val: name,
              set: setName,
              type: "text",
              ph: "e.g., John Smith",
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                {label}
              </label>
              <input
                type={type}
                value={val}
                onChange={(e) => set(e.target.value)}
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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1C4D8D] to-indigo-500" />

        {result ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm border border-emerald-200">
              <Icon name="CheckIcon" size={32} />
            </div>
            <h3
              className="text-2xl font-bold text-slate-900 mb-2"
              style={HEADING_FONT}
            >
              Upload Complete
            </h3>
            <p className="text-lg font-black text-emerald-600 mb-1">
              {result.created} member{result.created !== 1 ? "s" : ""} invited
            </p>
            {result.skipped > 0 && (
              <p className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg inline-block">
                {result.skipped} already existed (skipped)
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-8 w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
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
                Bulk Upload via CSV
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Upload a list of members. Format:{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold font-mono">
                name,email
              </code>{" "}
              (include header row).
            </p>

            {error && (
              <div className="p-3 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                <Icon name="ExclamationTriangleIcon" size={14} /> {error}
              </div>
            )}

            <label className="block cursor-pointer border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-[#1C4D8D] hover:bg-blue-50/50 transition-colors mb-6 group">
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="sr-only"
              />
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                <Icon
                  name="DocumentArrowUpIcon"
                  size={24}
                  className="text-slate-400 group-hover:text-[#1C4D8D]"
                />
              </div>
              <p className="font-bold text-slate-700 text-sm">
                {file ? file.name : "Click to select a CSV file"}
              </p>
              {parsed.length > 0 && (
                <p className="text-xs font-black uppercase tracking-wider text-emerald-600 mt-2">
                  {parsed.length} valid rows found
                </p>
              )}
            </label>

            {parsed.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200/60 shadow-sm mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Name
                      </th>
                      <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 text-sm">
                    {parsed.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2 font-bold text-slate-900">
                          {r.name}
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-500">
                          {r.email}
                        </td>
                      </tr>
                    ))}
                    {parsed.length > 10 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-3 text-xs font-bold text-slate-400 text-center bg-slate-50/50"
                        >
                          + {parsed.length - 10} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !parsed.length}
                className="flex-1 py-3 bg-gradient-to-r from-[#1C4D8D] to-[#153a6b] text-white rounded-xl text-sm font-bold hover:shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
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
  <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3
          className="text-2xl font-bold text-slate-900 tracking-tight"
          style={HEADING_FONT}
        >
          Join Code
        </h3>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Allow members to self-register using a unique code.
        </p>
      </div>
      {joinCode && (
        <button
          onClick={onToggle}
          className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-all shadow-sm ${enabled ? "border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100" : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"}`}
        >
          {enabled ? "Disable Code" : "Enable Code"}
        </button>
      )}
    </div>

    {joinCode ? (
      <div
        className={`rounded-2xl border p-6 mb-6 transition-colors ${enabled ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/30" : "border-slate-200 bg-slate-50"}`}
      >
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
          Current Code{" "}
          {!enabled && <span className="text-rose-500">(Disabled)</span>}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p
            className={`text-3xl md:text-4xl font-black tracking-[0.25em] font-mono flex-1 ${enabled ? "text-emerald-700 drop-shadow-sm" : "text-slate-400"}`}
          >
            {joinCode}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(joinCode);
            }}
            className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold border transition-all shadow-sm flex items-center gap-2 ${
              enabled
                ? "border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-100"
                : "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed"
            }`}
            disabled={!enabled}
            title="Copy to clipboard"
          >
            <Icon name="DocumentDuplicateIcon" size={18} /> Copy
          </button>
        </div>
      </div>
    ) : (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-6">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
          <Icon name="QrCodeIcon" size={28} className="text-slate-300" />
        </div>
        <p className="text-lg font-bold text-slate-700">No code generated</p>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Generate a code to start accepting self-registrations.
        </p>
      </div>
    )}

    <button
      onClick={onGenerate}
      disabled={loading}
      className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      <Icon name="ArrowPathIcon" size={18} />
      {joinCode ? "Regenerate New Code" : "Generate First Code"}
    </button>

    {joinCode && enabled && (
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
          <Icon name="InformationCircleIcon" size={20} />
        </div>
        <div>
          <p className="font-bold text-slate-900 mb-1 text-sm">How it works</p>
          <ul className="text-xs font-medium text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Share this code with your prospective members.</li>
            <li>
              They enter it in the "Join Association" area of their dashboard.
            </li>
            <li>Their account is instantly linked to your association.</li>
            <li>
              Regenerating the code makes the old one immediately invalid.
            </li>
          </ul>
        </div>
      </div>
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
                  Member Association
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
                      {dashboard.memberCounts?.active ?? 0}
                    </span>{" "}
                    active members.
                  </p>
                )}
              </div>
              {tab === "members" && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCSV(true)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 shadow-lg"
                  >
                    <Icon name="ArrowUpTrayIcon" size={18} /> CSV Upload
                  </button>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Icon name="PlusIcon" size={18} /> Add Member
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

        {!loading && dashboard === null && (
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
                key: "members",
                label: `Members${total > 0 ? ` (${total})` : ""}`,
                icon: "UserGroupIcon",
              },
              { key: "joincode", label: "Join Code", icon: "QrCodeIcon" },
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
                  icon="👥"
                  label="Total Members"
                  value={dashboard?.memberCounts?.total ?? 0}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  icon="✓"
                  label="Active"
                  value={dashboard?.memberCounts?.active ?? 0}
                  sub="Accepted invite"
                  color="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  icon="📧"
                  label="Invited"
                  value={dashboard?.memberCounts?.invited ?? 0}
                  sub="Pending acceptance"
                  color="bg-amber-50 text-amber-600"
                />
                <StatCard
                  icon="💰"
                  label="Total Savings"
                  value={`$${(dashboard?.totalSavings ?? 0).toFixed(2)}`}
                  sub="Across all members"
                  color="bg-indigo-50 text-indigo-600"
                />
              </div>
            )}

            {!loading && dashboard?.topMembers?.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                <h3
                  className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                  style={HEADING_FONT}
                >
                  Top Members by Savings
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200/60">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500">
                          Member
                        </th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 text-right">
                          Total Saved
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {dashboard.topMembers.map((m, i) => (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-slate-400">
                              #{i + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 shadow-sm border border-slate-300/50">
                                <span className="text-[#1C4D8D] text-sm font-black">
                                  {m.name[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate group-hover:text-[#1C4D8D] transition-colors">
                                  {m.name}
                                </p>
                                <p className="text-[11px] font-medium text-slate-500 truncate">
                                  {m.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-lg font-black text-emerald-600">
                              ${m.totalSavings.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === "members" && (
          <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm animate-in fade-in duration-500">
            <h2
              className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
              style={HEADING_FONT}
            >
              Member Roster
            </h2>

            <div className="flex gap-2 flex-wrap bg-slate-50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-100">
              {["", "ACTIVE", "INVITED", "REMOVED"].map((s) => (
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
                    {["Member", "Email", "Status", "Joined", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {membersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-10 bg-slate-100/80 rounded-xl w-full" />
                        </td>
                      </tr>
                    ))
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                          <Icon
                            name="UserGroupIcon"
                            size={28}
                            className="text-slate-300"
                          />
                        </div>
                        <p className="text-lg font-bold text-slate-700">
                          No members yet
                        </p>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Use the buttons above to add members or upload a CSV.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    members.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 shadow-sm border border-slate-300/50">
                              <span className="text-slate-600 text-sm font-black">
                                {m.name[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-[180px] truncate">
                          {m.email}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={m.status} />
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {m.inviteAcceptedAt
                            ? timeAgo(m.inviteAcceptedAt)
                            : timeAgo(m.inviteSentAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                            {m.status === "INVITED" && (
                              <button
                                onClick={() => handleResend(m.id)}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                                title="Resend Invite"
                              >
                                <Icon name="PaperAirplaneIcon" size={16} />
                              </button>
                            )}
                            {m.status !== "REMOVED" && (
                              <button
                                onClick={() => handleRemove(m.id)}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-sm"
                                title="Remove Member"
                              >
                                <Icon name="TrashIcon" size={16} />
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

        {/* ── JOIN CODE TAB ── */}
        {tab === "joincode" && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <JoinCodePanel
              joinCode={dashboard?.joinCode}
              onGenerate={handleGenerateCode}
              onToggle={handleToggleCode}
              enabled={dashboard?.joinCode !== null}
              loading={codeLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationMemberDashboard;
