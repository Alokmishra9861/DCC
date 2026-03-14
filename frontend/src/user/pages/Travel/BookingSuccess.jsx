import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { travelAPI } from "../../../services/api";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [category, setCategory] = useState("");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) { setStatus("failed"); return; }
    travelAPI.verifyBooking(sessionId)
      .then((res) => {
        if (res?.paid) {
          setStatus("success");
          setCategory(res.category || "travel");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirming your booking…</h2>
            <p className="text-slate-400 text-sm">Just a moment while we verify your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-2">
              Your {category} booking has been confirmed.
            </p>
            {sessionId && (
              <p className="text-xs text-slate-300 mb-6 break-all">Ref: {sessionId}</p>
            )}
            <div className="space-y-3">
              <Link to="/travel" className="block w-full py-3 bg-[#1C4D8D] text-white font-bold rounded-xl hover:bg-[#0F2854] transition-colors">
                Browse More Deals
              </Link>
              <Link to="/member-dashboard" className="block w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Not Confirmed</h2>
            <p className="text-slate-500 mb-6">We couldn't verify your payment. If you were charged, please contact support.</p>
            <Link to="/travel" className="block w-full py-3 bg-[#1C4D8D] text-white font-bold rounded-xl hover:bg-[#0F2854] transition-colors">
              Try Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingSuccess;