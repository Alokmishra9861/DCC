import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500">
          Memberships activate automatically after payment. No manual approval
          is required.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="text-sm text-slate-600 mb-4">
          Use the members list to view member details and activity.
        </p>
        <Link
          to="/admin/members"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#1C4D8D] text-white font-semibold hover:bg-[#163c6b] transition-colors"
        >
          Go to Members
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
