// Frontend/src/user/components/ui/JoinAssociationModal.jsx
// Member pastes a join code → calls POST /api/association/join → auto-linked
// Used inside MemberDashboardContent

import React, { useState } from "react";
import { memberAPI } from "../../../services/api";

const JoinAssociationModal = ({ onClose, onJoined }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null); // { associationName }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a join code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // POST /api/association/join  body: { joinCode }
      const res = await memberAPI.joinAssociation(trimmed);
      setSuccess({
        associationName: res?.associationName || "the association",
      });
      if (onJoined) onJoined();
    } catch (err) {
      setError(
        err.message ||
          "Invalid or expired join code. Please check and try again.",
      );
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
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          /* ── Success state ── */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              You're in!
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              You've been successfully linked to{" "}
              <strong className="text-slate-800">
                {success.associationName}
              </strong>
              . Your membership benefits are now active.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Input state ── */
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  Join an Association
                </h3>
                <p className="text-sm text-slate-400">
                  Enter the code your association gave you to link your account.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 text-lg transition-colors ml-3 flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
              <p className="text-xs font-bold text-[#1C4D8D] mb-2">
                How it works
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-[#1C4D8D] font-bold flex-shrink-0">
                    1.
                  </span>
                  Get the join code from your association administrator
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1C4D8D] font-bold flex-shrink-0">
                    2.
                  </span>
                  Paste or type the code below and click Join
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1C4D8D] font-bold flex-shrink-0">
                    3.
                  </span>
                  Your account is instantly linked — no approval needed
                </li>
              </ul>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5">
                <span className="text-red-500 flex-shrink-0">⚠</span>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Join Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (error) setError("");
                  }}
                  placeholder="e.g. NURSES-CAYMAN-A3F2"
                  autoFocus
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-mono tracking-widest placeholder-slate-300 focus:outline-none focus:border-[#1C4D8D] focus:bg-white transition-all uppercase"
                  spellCheck={false}
                  autoComplete="off"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Codes are not case-sensitive
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="flex-1 py-3 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Joining...
                    </>
                  ) : (
                    "Join Association →"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinAssociationModal;
