import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  getUser,
  ROLE_ROUTES,
  membershipAPI,
  paymentAPI,
  saveAuthData,
} from "../../../services/api";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");
  const user = getUser();
  const dashboardRoute = user
    ? ROLE_ROUTES[user.role] || "/member-dashboard"
    : "/member-dashboard";

  const checkMembership = useCallback(
    async (isAuto = false) => {
      setError("");
      setStatus("checking");

      try {
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        // Step 1: Try to verify the Stripe session — this also activates
        // the membership on the backend if it hasn't been activated yet
        if (sessionId) {
          try {
            await paymentAPI.verifyStripeSession(sessionId);
          } catch (_) {
            // Don't fail here — fall through to membership check below
          }
        }

        // Step 2: Check membership status
        // membershipAPI.getMy() returns the raw data after ApiResponse unwrap.
        // The backend returns { success, data: membership, isActive, membershipStatus }
        // but our request() wrapper returns json.data — which is the membership object.
        // The backend also sets isActive at the top level, so we re-fetch the full
        // response by calling /membership/my and checking the response directly.
        const membershipResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL ||
            "https://dcc-backend-ej8n.onrender.com/api"
          }/membership/my`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("dcc_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
        const membershipJson = await membershipResponse.json();

        // isActive lives at the top level of the response, not inside data
        const isActive =
          membershipJson?.isActive === true ||
          String(
            membershipJson?.data?.status ||
              membershipJson?.membershipStatus ||
              "",
          ).toUpperCase() === "ACTIVE";

        if (isActive) {
          setStatus("active");
          setError("");
          return;
        }

        setStatus("pending");
        if (!isAuto) {
          setError("Membership activation is still processing. Please wait.");
        }
      } catch (err) {
        setStatus("error");
        setError(err.message || "Unable to verify payment. Please retry.");
      }
    },
    [navigate, sessionId, user],
  );

  // Countdown and redirect once active
  useEffect(() => {
    if (status !== "active") return;
    if (countdown <= 0) {
      navigate(dashboardRoute, { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate, dashboardRoute, status]);

  // Initial check on mount
  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  // Auto-retry up to 8 times every 3 seconds while still pending
  useEffect(() => {
    if (status === "active") return;
    if (attempt >= 8) return;
    const timer = setTimeout(() => {
      setAttempt((c) => c + 1);
      checkMembership(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [attempt, checkMembership, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
          {status === "active" ? (
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : status === "error" ? (
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Spinner while checking / pending
            <svg
              className="w-10 h-10 text-blue-600 animate-spin"
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
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === "active" ? "Membership Activated!" : "Payment Received"}
        </h1>

        <p className="text-gray-600 mb-4">
          {status === "active"
            ? "Welcome to Discount Club Cayman! Your membership is now active."
            : status === "checking"
              ? "Confirming your membership activation…"
              : status === "pending"
                ? `Activating your membership… (${attempt}/8)`
                : "We couldn't verify activation. Please retry."}
        </p>

        {sessionId && (
          <p className="text-xs text-gray-400 mb-4 break-all">
            Ref: {sessionId}
          </p>
        )}

        {status === "active" && (
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to your dashboard in{" "}
            <span className="font-semibold text-green-600">{countdown}</span>{" "}
            {countdown === 1 ? "second" : "seconds"}…
          </p>
        )}

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        {/* Progress bar while pending */}
        {(status === "checking" || status === "pending") && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((attempt / 8) * 100, 95)}%` }}
            />
          </div>
        )}

        {/* Manual retry */}
        {status === "error" && (
          <button
            type="button"
            onClick={() => {
              setAttempt(0);
              checkMembership(false);
            }}
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors mb-4"
          >
            Retry Activation
          </button>
        )}

        {/* Go to dashboard immediately */}
        {status === "active" && (
          <Link
            to={dashboardRoute}
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Go to Dashboard Now
          </Link>
        )}

        {/* Fallback after max retries */}
        {attempt >= 8 && status !== "active" && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Taking longer than expected?</p>
            <Link
              to={dashboardRoute}
              className="text-blue-600 hover:underline font-semibold"
            >
              Go to dashboard anyway →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
