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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-100" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo + title */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img
              src="/logo-rmbg.png"
              alt="DCC Logo"
              className="h-28 w-auto object-contain rounded-xl"
            />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500">Log in to access your account</p>
        </div>

        {/* Role toggle — 3+3 grid so B2B fits without squishing */}
        <div className="bg-white rounded-2xl p-1.5 mb-1 border border-slate-100 shadow-sm animate-fade-up">
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
            {ROLE_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedRole(key);
                  setError("");
                }}
                className={`py-2.5 px-1 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  selectedRole === key
                    ? "bg-[#1C4D8D] text-white shadow-md"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Role hint line */}
        <p className="text-center text-xs text-slate-400 mb-4 min-h-[1.25rem]">
          {ROLE_HINTS[selectedRole]}
        </p>

        {/* B2B callout — only shown when B2B tab is selected */}
        {selectedRole === "b2b" && (
          <div className="mb-4 p-4 bg-gradient-to-r from-[#1C4D8D]/8 to-[#4988C4]/8 border border-[#1C4D8D]/20 rounded-2xl flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">🤝</span>
            <div>
              <p className="font-bold text-[#1C4D8D] text-sm">
                B2B Partner Portal
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Manage your directory listing, services profile, and member
                enquiries. Not registered yet?{" "}
                <Link
                  to="/sign-up"
                  className="text-[#1C4D8D] font-semibold hover:underline"
                >
                  Sign up as a B2B Partner →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl animate-fade-up animation-delay-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-slate-500 font-medium">
              Signing in as{" "}
              <span className="text-[#1C4D8D] font-bold">
                {ROLE_TABS.find((r) => r.key === selectedRole)?.label}
              </span>
            </p>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <Icon
                  name="ExclamationCircleIcon"
                  size={20}
                  className="text-red-600 mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
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
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                  placeholder="your@email.com"
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    {suggestions.map((login, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectSuggestion(login);
                        }}
                        className="w-full px-5 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {login.email}
                          </p>
                          <p className="text-xs text-slate-400">
                            Click to auto-fill
                          </p>
                        </div>
                        <Icon
                          name="ChevronRightIcon"
                          size={16}
                          className="text-slate-300 group-hover:text-[#1C4D8D] transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
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
                  className="w-4 h-4 text-[#1C4D8D] border-slate-300 rounded focus:ring-[#1C4D8D]"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="#"
                className="text-sm text-[#1C4D8D] hover:text-blue-700 hover:underline font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>
            <button className="mt-6 w-full px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-[#1C4D8D] hover:text-[#1C4D8D] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-[#1C4D8D] hover:underline font-bold"
            >
              Join now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
