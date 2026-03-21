// Frontend/src/user/pages/Association/AcceptAssociationMemberInvite.jsx
// Public page — member clicks invite link from email, sets password, activates account.
// Route: /association/accept-invite/:token

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_LOCALHOST_URL ||
  "http://localhost:5000/api";

const AcceptAssociationMemberInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Direct fetch — no auth token needed for this public endpoint
      const res = await fetch(
        `${BASE_URL}/association/members/accept-invite/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Activation failed");
      setSuccess(true);
    } catch (err) {
      setError(
        err.message || "Something went wrong. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-20">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            🎉
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Account Activated!
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Your membership is active. Sign in to start saving.
          </p>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-20">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-100">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#1C4D8D] rounded-xl flex items-center justify-center">
            <span className="text-white font-black">D</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">
            Discount Club Cayman
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-1">
          Activate your membership
        </h1>
        <p className="text-slate-400 text-sm mb-7">
          Set a password to complete your account setup.
        </p>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            {
              label: "Password",
              val: password,
              set: setPassword,
              ph: "Min 6 characters",
            },
            {
              label: "Confirm Password",
              val: confirm,
              set: setConfirm,
              ph: "Re-enter password",
            },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={ph}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] focus:bg-white transition-all pr-11"
                />
                {label === "Password" && (
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs px-1"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
                Activating...
              </>
            ) : (
              "Activate Account →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptAssociationMemberInvite;
