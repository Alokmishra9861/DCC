// Frontend/src/pages/AcceptInvite.jsx
// Route: /accept-invite/:token
// Employee lands here from welcome email. Sets a password and activates account.

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "../components/ui/AppIcon";
import { employerAPI } from "../../services/api";

const validatePassword = (p) => p.length >= 6; // backend requires min 6; you can tighten this

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await employerAPI.acceptInvite(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. The invite link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              name="CheckCircleIcon"
              size={32}
              className="text-emerald-600"
              variant="solid"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            You're all set!
          </h2>
          <p className="text-slate-500 mb-6">
            Your account is active. Log in now to start exploring discounts.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors"
          >
            Log In to My Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[#1C4D8D] font-semibold text-xs uppercase tracking-widest mb-5 shadow-sm">
            <Icon name="SparklesIcon" size={14} /> Discount Club Cayman
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Activate Your Account
          </h1>
          <p className="text-slate-500 text-sm">
            Your employer has purchased a membership for you.
            <br />
            Set a password to get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xl space-y-5"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <Icon
                name="ExclamationCircleIcon"
                size={18}
                className="text-red-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Choose a Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors pr-11"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <Icon
                  name={showPassword ? "EyeSlashIcon" : "EyeIcon"}
                  size={18}
                />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
              placeholder="Re-enter your password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1.5">
                Passwords do not match
              </p>
            )}
          </div>

          {/* What you get */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-xs font-bold text-blue-700 mb-2">
              What you get with your membership:
            </p>
            <ul className="space-y-1">
              {[
                "Exclusive discounts at 100+ local businesses",
                "Digital membership card on your phone",
                "Food, health, retail, travel & more",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-xs text-blue-600"
                >
                  <Icon
                    name="CheckIcon"
                    size={13}
                    className="mt-0.5 flex-shrink-0"
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
              <>
                Activate My Account <Icon name="ArrowRightIcon" size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#1C4D8D] hover:underline font-semibold"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvite;
