// Frontend/src/user/pages/Association/ApproveBusinessLink.jsx
// Public page — existing business accepts or declines link from association.
// Route: /business/approve-link/:token

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

const ApproveBusinessLink = () => {
  const { token } = useParams();

  // Get the base API URL
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_LOCALHOST_URL ||
    "http://localhost:5000/api";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState(""); // "approved" or "declined"

  const handleApprove = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/association/businesses/approve-link/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Approval failed");
      setSuccess(true);
      setSuccessType("approved");
    } catch (err) {
      setError(
        err.message || "Something went wrong. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/association/businesses/decline-link/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Decline failed");
      setSuccess(true);
      setSuccessType("declined");
    } catch (err) {
      setError(
        err.message || "Something went wrong. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success && successType === "approved") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-20">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Link Approved!
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Your business has been successfully linked with the association. You
            can now access partnership features and collaborate within the
            network.
          </p>
          <Link
            to="/login"
            className="block w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] transition-colors text-center"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (success && successType === "declined") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 -mt-20">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            ℹ
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Link Declined
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            You have declined the link request. If you change your mind, the
            association can send another request.
          </p>
          <a
            href="https://discountclubcayman.com"
            className="block w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] transition-colors text-center"
          >
            Back to Discount Club Cayman
          </a>
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
          Link Your Business
        </h1>
        <p className="text-slate-400 text-sm mb-7">
          An association would like to link your business to their network.
          Review their request and choose to approve or decline.
        </p>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700">
            <strong>Linking your business means:</strong>
            <ul className="mt-2 ml-4 space-y-1 text-sm text-blue-600">
              <li>
                ✓ Your business will be featured in the association's directory
              </li>
              <li>✓ Collaboration opportunities within the association</li>
              <li>✓ Access to B2B partnership programs</li>
              <li>✓ You maintain full control of your business profile</li>
            </ul>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDecline}
            disabled={loading}
            className="flex-1 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Processing..." : "Decline"}
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              "Approve Link"
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          This link expires in 14 days. After that, ask the association to send
          a new request.
        </p>
      </div>
    </div>
  );
};

export default ApproveBusinessLink;
