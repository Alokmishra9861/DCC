// Frontend/src/user/pages/Payment/PaymentSuccessPage.jsx
// Stripe redirects here: /payment/success?session_id=cs_test_...&type=membership
//
// Flow:
//  1. Read session_id from URL
//  2. GET /api/payments/stripe/verify?session_id=... → activates membership
//     Backend returns: { type: "membership", activated: true }
//  3. Show success screen → auto-redirect to /member-dashboard in 5s

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { memberAPI } from "../../../services/api";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("verifying"); // verifying | success | error | already_active
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState("");

  // ── 1. Verify payment ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      setError(
        "No session ID found. If you just paid, your membership may already be active.",
      );
      setStatus("error");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        // memberAPI.verifyPayment → GET /api/payments/stripe/verify?session_id=...
        // Backend verifies the Stripe session and activates membership if needed.
        // Returns: { type: "membership", activated: true }
        await memberAPI.verifyPayment(sessionId);
        if (cancelled) return;
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        const msg = (err.message || "").toLowerCase();
        if (
          msg.includes("already") ||
          msg.includes("conflict") ||
          msg.includes("active")
        ) {
          setStatus("already_active");
        } else {
          setError(
            err.message ||
              "Payment verification failed. Please contact support.",
          );
          setStatus("error");
        }
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // ── 2. Auto-redirect countdown ────────────────────────────────────────────
  useEffect(() => {
    if (status !== "success" && status !== "already_active") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/member-dashboard", { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, navigate]);

  // ── Verifying ─────────────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Confirming your payment…
          </h2>
          <p className="text-slate-400 text-sm">
            Please wait while we activate your membership.
          </p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
            ⚠
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500 text-sm mb-2">{error}</p>
          <p className="text-slate-400 text-xs mb-8">
            If you were charged, contact support with your session ID:
            <br />
            <code className="bg-slate-100 px-2 py-0.5 rounded text-xs mt-1 inline-block break-all">
              {sessionId}
            </code>
          </p>
          <div className="flex gap-3">
            <Link
              to="/member-dashboard"
              className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:border-slate-300 text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/contact"
              className="flex-1 py-3 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success / Already active ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-xl border border-slate-100 text-center">
        {/* Animated checkmark */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-50" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2">
          {status === "already_active"
            ? "Already Active!"
            : "Welcome to DCC! 🎉"}
        </h1>
        <p className="text-slate-500 mb-7">
          {status === "already_active"
            ? "Your membership is already active. Redirecting you to your dashboard…"
            : "Your membership is now active. Start saving with 200+ local businesses!"}
        </p>

        {/* Membership card */}
        <div className="bg-gradient-to-br from-[#1C4D8D] to-[#163d71] rounded-2xl p-5 mb-7 text-left text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">D</span>
              </div>
              <span className="text-sm font-bold text-white/90">
                Discount Club Cayman
              </span>
            </div>
            <span className="text-[11px] font-black bg-emerald-400 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              ACTIVE
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Plan", value: "Individual Membership" },
              { label: "Status", value: "Active" },
              { label: "Expires", value: "1 Year from today" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-white/60 text-xs uppercase tracking-wider">
                  {label}
                </span>
                <span className="font-semibold text-white text-xs">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Unlocked features */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { icon: "🏪", label: "200+ Businesses" },
            { icon: "💰", label: "Exclusive Discounts" },
            { icon: "🎟️", label: "Certificates" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="bg-slate-50 rounded-xl p-3 border border-slate-100"
            >
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-[11px] font-semibold text-slate-600">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Countdown bar */}
        <div className="mb-5">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-3">
            <svg
              className="animate-spin w-4 h-4 text-[#1C4D8D]"
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
            Redirecting in {countdown}s…
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[#1C4D8D] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => navigate("/member-dashboard", { replace: true })}
          className="w-full py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#163d71] transition-colors"
        >
          Go to Dashboard Now →
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
