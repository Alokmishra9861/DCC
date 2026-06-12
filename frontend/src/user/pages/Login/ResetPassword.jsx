import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { authAPI } from "../../../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: input new password, 2: success

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setResetStep(2);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1328] flex items-center justify-center py-12 px-6 relative overflow-hidden grid-background">
      {/* Premium Luxury Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="glow-orb w-[450px] h-[450px] bg-[#D4A62A]/5 top-[10%] left-[10%]" />
        <div className="glow-orb w-[450px] h-[450px] bg-[#E0B53A]/5 bottom-[10%] right-[10%]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo + title */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img
              src="/DCC-rmbg.png"
              alt="DCC Logo"
              className="h-28 w-auto object-contain rounded-xl filter brightness-110"
            />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Create New Password
          </h1>
          <p className="text-[#B8C0D4] font-medium text-sm">
            Set your secure new password to regain access
          </p>
        </div>

        {/* Main card */}
        <div className="glass-panel bg-[#111936]/80 rounded-3xl p-8 md:p-10 border border-white/8 shadow-2xl animate-fade-up animation-delay-100">
          {resetStep === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!token && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                  <Icon
                    name="ExclamationCircleIcon"
                    size={20}
                    className="text-rose-400 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-sm text-rose-400 font-bold leading-tight">
                    Reset token is invalid or missing. Please generate a new password reset link from the login page.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                  <Icon
                    name="ExclamationCircleIcon"
                    size={20}
                    className="text-rose-400 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-sm text-rose-400 font-bold leading-tight">{error}</p>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#B8C0D4] ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium w-full"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#B8C0D4] ml-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium w-full"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="btn-premium-gold w-full py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting password..." : "Reset Password"}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-[#D4A62A] hover:underline font-bold bg-transparent border-0 cursor-pointer outline-none"
                >
                  Back to Log In
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl">
                ✓
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Password Reset Successful!</h2>
                <p className="text-sm text-[#B8C0D4] leading-relaxed">
                  Your password has been successfully updated. You can now use your new password to sign in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn-premium-gold w-full py-3.5 px-6 rounded-xl text-lg font-bold"
              >
                Log In Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
