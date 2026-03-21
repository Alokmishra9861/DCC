import React, { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");

  // Auto-redirect for membership payments
  useEffect(() => {
    if (type === "membership") {
      const timer = setTimeout(() => {
        navigate("/member-dashboard?membership=activated", { replace: true });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [type, navigate]);

  // Membership success page
  if (type === "membership") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg
              className="w-12 h-12 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-black text-slate-900 mb-3">
            Success! 🎉
          </h1>

          {/* Subheading */}
          <p className="text-xl text-slate-700 font-bold mb-2">
            Membership Activated
          </p>

          {/* Description */}
          <p className="text-slate-600 mb-8">
            Welcome to Discount Club Cayman! Your membership is now active and
            you have access to all exclusive discounts and offers.
          </p>

          {/* Benefits List */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-slate-100">
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">
                  Access to exclusive discounts
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">
                  Browse partner businesses
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">
                  Save on every purchase
                </span>
              </div>
            </div>
          </div>

          {/* Loading Message */}
          <div className="mb-8">
            <p className="text-slate-500 text-sm mb-4">
              Redirecting to your dashboard...
            </p>
            <div className="flex justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Manual Button */}
          <Link
            to="/member-dashboard?membership=activated"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            <span>→</span>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Default loading for other payment types
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-slate-600 font-semibold text-lg">
          Processing your payment...
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Please don't close this page
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
