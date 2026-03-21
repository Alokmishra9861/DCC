// Frontend/src/user/pages/Association/AcceptAssociationBusinessInvite.jsx
// Public page — invited business registers under an association.
// Route: /association/business-invite/:token

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

const AcceptAssociationBusinessInvite = () => {
  const { token } = useParams();

  // Get the base API URL
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_LOCALHOST_URL ||
    "http://localhost:5000/api";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/association/businesses/accept-invite/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: form.password, phone: form.phone }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
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
            🏪
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Business Registered!
          </h1>
          <p className="text-slate-500 text-sm mb-2">
            Your business has been registered under the association.
          </p>
          <p className="text-amber-600 text-xs font-medium mb-8">
            Your listing is pending admin approval — you'll receive an email
            once approved.
          </p>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] transition-colors text-center"
          >
            Sign In to Dashboard
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
          Register your business
        </h1>
        <p className="text-slate-400 text-sm mb-7">
          Complete your registration to join the association's business network.
        </p>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => f("phone", e.target.value)}
              placeholder="+1 (345) 123-4567"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] focus:bg-white transition-all"
            />
          </div>

          {/* Password fields */}
          {[
            { label: "Password", key: "password", ph: "Min 6 characters" },
            {
              label: "Confirm Password",
              key: "confirmPassword",
              ph: "Re-enter password",
            },
          ].map(({ label, key, ph }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form[key]}
                  onChange={(e) => f(key, e.target.value)}
                  placeholder={ph}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] focus:bg-white transition-all pr-11"
                />
                {key === "password" && (
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

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-[#1C4D8D] font-semibold mb-1">
              What happens next
            </p>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>Your business will be submitted for admin review</li>
              <li>Once approved, you'll appear in the DCC directory</li>
              <li>You can create offers from your business dashboard</li>
            </ul>
          </div>

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
                Registering...
              </>
            ) : (
              "Complete Registration →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptAssociationBusinessInvite;
