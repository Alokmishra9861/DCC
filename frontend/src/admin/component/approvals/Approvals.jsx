import React, { useEffect, useState } from "react";
import { adminAPI } from "../../../services/api";

const Approvals = () => {
  const [pending, setPending] = useState({
    employers: [],
    associations: [],
    businesses: [],
  });
  const [pendingMemberships, setPendingMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingRes, membershipRes] = await Promise.all([
        adminAPI.getPendingApprovals(),
        adminAPI.getPendingMemberships(),
      ]);
      setPending({
        employers: pendingRes?.employers || [],
        associations: pendingRes?.associations || [],
        businesses: pendingRes?.businesses || [],
      });
      setPendingMemberships(Array.isArray(membershipRes) ? membershipRes : []);
    } catch (err) {
      setError(err.message || "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (type, id) => {
    try {
      if (type === "employer") await adminAPI.approveEmployer(id);
      if (type === "association") await adminAPI.approveAssociation(id);
      if (type === "business") await adminAPI.approveBusiness(id);
      await load();
    } catch (err) {
      setError(err.message || "Approval failed.");
    }
  };

  const handleApproveMembership = async (id) => {
    try {
      await adminAPI.approveMembership(id);
      await load();
    } catch (err) {
      setError(err.message || "Membership approval failed.");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
        <p className="text-sm text-slate-500">
          Review pending memberships and partner approvals.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Pending Memberships</h3>
            </div>
            {pendingMemberships.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                No pending memberships.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Member</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingMemberships.map((m) => (
                      <tr key={m.id} className="text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {m.member?.firstName} {m.member?.lastName}
                        </td>
                        <td className="px-6 py-4">
                          {m.member?.user?.email || "-"}
                        </td>
                        <td className="px-6 py-4">{m.type}</td>
                        <td className="px-6 py-4">{m.status}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleApproveMembership(m.id)}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { key: "employers", label: "Employers", type: "employer" },
              {
                key: "associations",
                label: "Associations",
                type: "association",
              },
              { key: "businesses", label: "Businesses", type: "business" },
            ].map((group) => (
              <div
                key={group.key}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">
                    Pending {group.label}
                  </h3>
                </div>
                {pending[group.key].length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-500">
                    None pending.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {pending[group.key].map((item) => (
                      <li
                        key={item.id}
                        className="px-6 py-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.companyName || item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.user?.email || "-"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApprove(group.type, item.id)}
                          className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Approvals;
