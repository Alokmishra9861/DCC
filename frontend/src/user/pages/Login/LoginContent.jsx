// Frontend/src/user/pages/Login/LoginContent.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import {
  authAPI,
  saveAuthData,
  ROLE_ROUTES,
  getAssociationRoute,
} from "../../../services/api";
import { auth, googleProvider } from "../../../config/firebase";
import { signInWithPopup } from "firebase/auth";

// ── 6 tabs — B2B Partner added ────────────────────────────────────────────────
const ROLE_TABS = [
  { key: "member", label: "Individual" },
  { key: "employer", label: "Employer" },
  { key: "business", label: "Business" },
  { key: "association", label: "Association" },
  { key: "b2b", label: "B2B Partner" },
  { key: "admin", label: "Admin" },
];

const ROLE_HINTS = {
  member: "Access your discounts, certificates & travel savings.",
  employer: "Manage your team's membership benefits & ROI.",
  business: "Manage your offers, certificates & transactions.",
  association: "Manage your members or business network.",
  b2b: "Access your B2B partner dashboard & directory profile.",
  admin: "Platform administration & approvals.",
};

const LoginContent = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Forgot Password state variables
  const [view, setView] = useState("login"); // 'login' or 'forgot'
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: input email, 2: success confirmation

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      setForgotStep(2);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("dcc_saved_logins")) || [];
    setSuggestions(saved);
  }, []);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    const saved = JSON.parse(localStorage.getItem("dcc_saved_logins")) || [];
    if (val.trim()) {
      const filtered = saved.filter((l) =>
        l.email.toLowerCase().includes(val.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions(saved);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (login) => {
    setEmail(login.email);
    setPassword(login.password);
    setRememberMe(true);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.login(email, password, selectedRole);
      saveAuthData(data);

      if (rememberMe) {
        const saved =
          JSON.parse(localStorage.getItem("dcc_saved_logins")) || [];
        const filtered = saved.filter((l) => l.email !== email);
        filtered.unshift({ email, password });
        localStorage.setItem(
          "dcc_saved_logins",
          JSON.stringify(filtered.slice(0, 5)),
        );
      }

      const role = data.user?.role;
      const destination =
        data.redirectTo ||
        (role === "ASSOCIATION"
          ? getAssociationRoute(data.user)
          : ROLE_ROUTES[role] || "/member-dashboard");

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked && email) {
      const saved = JSON.parse(localStorage.getItem("dcc_saved_logins")) || [];
      const filtered = saved.filter((l) => l.email !== email);
      localStorage.setItem("dcc_saved_logins", JSON.stringify(filtered));
      setSuggestions(filtered);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const data = await authAPI.googleLogin(idToken, selectedRole);
      saveAuthData(data);

      const role = data.user?.role;
      const destination =
        data.redirectTo ||
        (role === "ASSOCIATION"
          ? getAssociationRoute(data.user)
          : ROLE_ROUTES[role] || "/member-dashboard");

      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.message || "Google Login failed. Please try again.");
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
            {view === "login" ? "Welcome Back" : "Password Recovery"}
          </h1>
          <p className="text-[#B8C0D4] font-medium text-sm">
            {view === "login" ? "Log in to access your account" : "Reset your password with your email address"}
          </p>
        </div>

        {view === "login" && (
          <>
            {/* Role toggle — 3+3 grid in modern navy container */}
            <div className="bg-[#111936] rounded-2xl p-1.5 mb-1.5 border border-white/8 shadow-2xl animate-fade-up">
              <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
                {ROLE_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedRole(key);
                      setError("");
                    }}
                    className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedRole === key
                        ? "bg-[#D4A62A] text-[#0D1328] shadow-md shadow-[#D4A62A]/10 font-extrabold"
                        : "text-[#8D95A8] hover:text-white hover:bg-[#161F3D]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Role hint line */}
            <p className="text-center text-xs text-[#8D95A8] font-bold mb-4 min-h-[1.25rem]">
              {ROLE_HINTS[selectedRole]}
            </p>

            {/* B2B callout — only shown when B2B tab is selected */}
            {selectedRole === "b2b" && (
              <div className="mb-4 p-4 bg-[#161F3D]/80 border border-white/8 rounded-2xl flex items-start gap-3 shadow-inner">
                <span className="text-xl flex-shrink-0 mt-0.5">🤝</span>
                <div>
                  <p className="font-bold text-[#D4A62A] text-sm">
                    B2B Partner Portal
                  </p>
                  <p className="text-xs text-[#B8C0D4] mt-0.5 leading-relaxed font-semibold">
                    Manage your directory listing, services profile, and member
                    enquiries. Not registered yet?{" "}
                    <Link
                      to="/sign-up"
                      className="text-[#D4A62A] font-bold hover:underline"
                    >
                      Sign up as a B2B Partner →
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Main card */}
        <div className="glass-panel bg-[#111936]/80 rounded-3xl p-8 md:p-10 border border-white/8 shadow-2xl animate-fade-up animation-delay-100">
          {view === "login" ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-[#B8C0D4] font-bold">
                  Signing in as{" "}
                  <span className="text-[#D4A62A] font-black">
                    {ROLE_TABS.find((r) => r.key === selectedRole)?.label}
                  </span>
                </p>

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

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#B8C0D4] ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => {
                        const saved =
                          JSON.parse(localStorage.getItem("dcc_saved_logins")) ||
                          [];
                        setSuggestions(saved);
                        setShowSuggestions(saved.length > 0);
                      }}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      className="input-premium w-full"
                      placeholder="your@email.com"
                      autoComplete="off"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#111936] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {suggestions.map((login, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectSuggestion(login);
                            }}
                            className="w-full px-5 py-3 text-left hover:bg-[#161F3D] border-b border-white/4 last:border-b-0 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div>
                              <p className="text-sm font-bold text-white">
                                {login.email}
                              </p>
                              <p className="text-xs text-[#8D95A8] font-bold">
                                Click to auto-fill
                              </p>
                            </div>
                            <Icon
                              name="ChevronRightIcon"
                              size={16}
                              className="text-[#8D95A8] group-hover:text-[#D4A62A] transition-colors"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#B8C0D4] ml-1">
                    Password
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

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      className="w-4 h-4 accent-[#D4A62A] bg-[#0D1328] border-white/10 rounded focus:ring-0"
                    />
                    <span className="text-sm text-[#B8C0D4] group-hover:text-white transition-colors font-bold">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setForgotStep(1);
                      setForgotEmail("");
                      setError("");
                    }}
                    className="text-sm text-[#D4A62A] hover:text-[#E0B53A] font-bold transition-colors cursor-pointer bg-transparent border-none outline-none"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium-gold w-full py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
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
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log In <Icon name="ArrowRightIcon" size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Google SSO */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/8" />
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-[#B8C0D4] font-bold">
                Don't have an account?{" "}
                <Link
                  to="/sign-up"
                  className="text-[#D4A62A] hover:underline font-black"
                >
                  Join now
                </Link>
              </p>
            </>
          ) : (
            <div className="space-y-6">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSubmit} className="space-y-6 animate-fade-up">
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-white mb-2">Forgot Password</h2>
                    <p className="text-sm text-[#B8C0D4]">
                      Enter your email address and we will send you a secure link to reset your password.
                    </p>
                  </div>

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

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#B8C0D4] ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="input-premium w-full"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium-gold w-full py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending link..." : "Send Reset Link"}
                  </button>

                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setView("login");
                        setError("");
                      }}
                      className="text-sm text-[#D4A62A] hover:underline font-bold bg-transparent border-0 cursor-pointer outline-none"
                    >
                      Back to Log In
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 text-center animate-fade-up">
                  <div className="mx-auto w-16 h-16 bg-[#D4A62A]/10 text-[#D4A62A] rounded-full flex items-center justify-center text-3xl">
                    ✉️
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
                    <p className="text-sm text-[#B8C0D4] leading-relaxed">
                      We have sent a password reset link to <strong className="text-white">{forgotEmail}</strong> if it is registered in our platform. Please check your inbox and follow the steps.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setForgotEmail("");
                      setForgotStep(1);
                      setError("");
                    }}
                    className="btn-premium-gold w-full py-3.5 px-6 rounded-xl text-lg font-bold"
                  >
                    Back to Log In
                  </button>

                  <p className="text-xs text-[#8D95A8]">
                    Didn't receive the email?{" "}
                    <button
                      type="button"
                      onClick={handleForgotSubmit}
                      disabled={loading}
                      className="text-[#D4A62A] hover:underline font-bold bg-transparent border-0 cursor-pointer disabled:opacity-50"
                    >
                      Click to resend
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
