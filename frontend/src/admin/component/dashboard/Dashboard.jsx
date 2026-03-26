import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getStats();
        console.log("Admin stats response:", response);
        setStats(response);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          response: err.response,
        });
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold text-slate-900"
          style={{
            fontFamily: "'Playfair Display', serif",
            letterSpacing: "-0.02em",
          }}
        >
          Admin Console
        </h1>
        <p
          className="text-xs md:text-sm text-slate-500 mt-1"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Platform Overview —{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6 h-24 md:h-32"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 md:p-6 mb-8 text-red-600 text-sm md:text-base">
          <p>Failed to load statistics: {error}</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8\">
          {/* Total Members */}
          <div className=\"bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6\">
            <div className=\"flex items-start justify-between gap-3\">
              <div className=\"min-w-0 flex-1\">
                <p className=\"text-xs font-bold uppercase tracking-widest text-slate-400 mb-2\">
                  Total Members
                </p>
                <p className=\"text-2xl md:text-3xl font-black text-slate-900\">
                  {stats.totalMembers || 0}
                </p>
                <p className=\"text-xs text-slate-500 mt-3\">
                  {stats.activeMembers || 0} active
                </p>
              </div>
              <div className=\"w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0\">
                <svg
                  className=\"w-5 h-5 md:w-6 md:h-6\"
                  fill=\"currentColor\"
                  viewBox=\"0 0 20 20\"
                >
                  <path d=\"M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z\" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Businesses */}
          <div className=\"bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6\">
            <div className=\"flex items-start justify-between gap-3\">
              <div className=\"min-w-0 flex-1\">
                <p className=\"text-xs font-bold uppercase tracking-widest text-slate-400 mb-2\">
                  Active Businesses
                </p>
                <p className=\"text-2xl md:text-3xl font-black text-slate-900\">
                  {stats.totalBusinesses || 0}
                </p>
                <p className=\"text-xs text-slate-500 mt-3\">Approved listings</p>
              </div>
              <div className=\"w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0\">
                <svg
                  className=\"w-5 h-5 md:w-6 md:h-6\"
                  fill=\"currentColor\"
                  viewBox=\"0 0 20 20\"
                >
                  <path d=\"M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z\" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className=\"bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6\">
            <div className=\"flex items-start justify-between gap-3\">
              <div className=\"min-w-0 flex-1\">
                <p className=\"text-xs font-bold uppercase tracking-widest text-slate-400 mb-2\">
                  Total Savings
                </p>
                <p className=\"text-2xl md:text-3xl font-black text-emerald-600\">
                  ${Number(stats.totalSavings || 0).toLocaleString()}
                </p>
                <p className=\"text-xs text-slate-500 mt-3\">Member benefits</p>
              </div>
              <div className=\"w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0\">
                <svg
                  className=\"w-5 h-5 md:w-6 md:h-6\"
                  fill=\"currentColor\"
                  viewBox=\"0 0 20 20\"
                >
                  <path d=\"M8.16 2.75a.75.75 0 00-1.32 0l-1.422 3.75H1.75a.75.75 0 00-.728.546l-.818 3.269a.75.75 0 00.364.925l3.067 1.616-1.209 3.205a.75.75 0 00.965.928l3.067-1.616 3.067 1.616a.75.75 0 00.965-.928l-1.21-3.205 3.068-1.616a.75.75 0 00.364-.925l-.818-3.27a.75.75 0 00-.728-.545H10.904l-1.422-3.75z\" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Transactions
                </p>
                <p className="text-2xl md:text-3xl font-black text-slate-900">
                  {stats.totalTransactions || 0}
                </p>
                <p className="text-xs text-slate-500 mt-3">This month</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 flex-shrink-0\">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Platform Impact Section */}
      {stats && (
        <div className="bg-linear-to-r from-[#1C4D8D] to-[#2d6ba3] rounded-2xl p-4 md:p-6 lg:p-8 text-white mb-8">
          <h2
            className="text-lg md:text-xl font-bold mb-4 md:mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.01em",
            }}
          >
            Platform Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-2">
                ${Number(stats.totalSavings || 0).toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-blue-100">
                Total savings delivered to members
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-2">
                {stats.totalMembers || 0}
              </p>
              <p className="text-xs md:text-sm text-blue-100">Active members</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-2">
                {stats.totalBusinesses || 0}
              </p>
              <p className="text-xs md:text-sm text-blue-100">Businesses</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-2">
                {stats.totalTransactions || 0}
              </p>
              <p className="text-xs md:text-sm text-blue-100">Transactions</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-6">
        <p className="text-xs md:text-sm text-slate-600 mb-4 md:mb-6 font-semibold">
          Quick Access
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Link
            to="/admin/members"
            className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-blue-50 text-[#1C4D8D] font-semibold hover:bg-blue-100 transition-colors border border-blue-200 text-sm md:text-base"
          >
            View Members
          </Link>
          <Link
            to="/admin/businesses"
            className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 transition-colors border border-amber-200 text-sm md:text-base"
          >
            View Businesses
          </Link>
          <Link
            to="/admin/approvals"
            className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 rounded-lg bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition-colors border border-purple-200 text-sm md:text-base"
          >
            View Pending
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
