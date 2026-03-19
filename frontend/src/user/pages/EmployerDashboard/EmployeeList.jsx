// Frontend/src/employer/pages/EmployeeList.jsx
// Shows all employees with status badges, savings, actions (resend invite, remove).

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { employerAPI } from "../../../services/api";

const STATUS_CONFIG = {
  INVITED: {
    label: "Invited",
    color: "bg-amber-100 text-amber-700",
    icon: "EnvelopeIcon",
  },
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-100 text-emerald-700",
    icon: "CheckCircleIcon",
  },
  REMOVED: {
    label: "Removed",
    color: "bg-red-100 text-red-600",
    icon: "XCircleIcon",
  },
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = all
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({}); // { [id]: "resend"|"remove" }
  const [confirmRemove, setConfirmRemove] = useState(null); // employee id to confirm
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await employerAPI.getEmployees({
        page,
        limit: 20,
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setEmployees(res.employees || []);
      setPagination(res.pagination || {});
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleResend = async (employee) => {
    setActionLoading((p) => ({ ...p, [employee.id]: "resend" }));
    try {
      await employerAPI.resendInvite(employee.id);
      showToast("success", `Invite resent to ${employee.email}`);
    } catch (err) {
      showToast("error", err.message || "Failed to resend invite");
    } finally {
      setActionLoading((p) => ({ ...p, [employee.id]: null }));
    }
  };

  const handleRemove = async (id) => {
    setConfirmRemove(null);
    setActionLoading((p) => ({ ...p, [id]: "remove" }));
    try {
      await employerAPI.removeEmployee(id);
      showToast("success", "Employee removed successfully");
      fetchEmployees();
    } catch (err) {
      showToast("error", err.message || "Failed to remove employee");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-semibold transition-all ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <Icon
              name={
                toast.type === "success"
                  ? "CheckCircleIcon"
                  : "ExclamationCircleIcon"
              }
              size={18}
            />
            {toast.msg}
          </div>
        )}

        {/* Remove confirm modal */}
        {confirmRemove && (
          <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  name="ExclamationTriangleIcon"
                  size={24}
                  className="text-red-500"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                Remove Employee?
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Their membership will be cancelled and account deactivated. This
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRemove(null)}
                  className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(confirmRemove)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
            <p className="text-slate-500 mt-1">
              {pagination.total
                ? `${pagination.total} total`
                : "Manage your team's memberships"}
            </p>
          </div>
          <button
            onClick={() => navigate("/employer-dashboard/employees/upload")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-semibold text-sm hover:bg-[#163d71] transition-colors shadow-sm"
          >
            <Icon name="PlusIcon" size={16} /> Add Employees
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: "", label: "All" },
            { key: "ACTIVE", label: "Active" },
            { key: "INVITED", label: "Invited" },
            { key: "REMOVED", label: "Removed" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                statusFilter === key
                  ? "bg-[#1C4D8D] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <Icon
              name="ExclamationCircleIcon"
              size={18}
              className="text-red-500"
            />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-4 animate-pulse"
                >
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded w-36" />
                    <div className="h-3 bg-slate-100 rounded w-48" />
                  </div>
                  <div className="h-6 bg-slate-100 rounded-full w-16" />
                  <div className="h-3 bg-slate-100 rounded w-20" />
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="py-16 text-center">
              <Icon
                name="UserGroupIcon"
                size={40}
                className="text-slate-200 mx-auto mb-3"
              />
              <p className="font-semibold text-slate-400">No employees found</p>
              <p className="text-sm text-slate-300 mt-1">
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} employees`
                  : "Add your first employee to get started"}
              </p>
              {!statusFilter && (
                <button
                  onClick={() =>
                    navigate("/employer-dashboard/employees/upload")
                  }
                  className="mt-4 px-5 py-2 bg-[#1C4D8D] text-white rounded-xl text-sm font-semibold hover:bg-[#163d71] transition-colors"
                >
                  Add Employees
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-4">Employee</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Savings</div>
                <div className="col-span-2 text-right">Redemptions</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const statusCfg =
                    STATUS_CONFIG[emp.status] || STATUS_CONFIG.INVITED;
                  const isActioning = actionLoading[emp.id];

                  return (
                    <div
                      key={emp.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Employee info */}
                      <div className="col-span-7 sm:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1C4D8D]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#1C4D8D] text-sm font-bold">
                            {emp.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {emp.email}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-5 sm:col-span-2 flex sm:block justify-end">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}
                        >
                          <Icon name={statusCfg.icon} size={11} />
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Savings */}
                      <div className="hidden sm:block col-span-2 text-right">
                        <p className="text-sm font-semibold text-emerald-600">
                          ${(emp.totalSavings || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* Redemptions */}
                      <div className="hidden sm:block col-span-2 text-right">
                        <p className="text-sm text-slate-600">
                          {emp.totalRedemptions || 0}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="hidden sm:flex col-span-2 justify-end gap-2">
                        {emp.status === "INVITED" && (
                          <button
                            onClick={() => handleResend(emp)}
                            disabled={!!isActioning}
                            title="Resend invite"
                            className="p-2 rounded-lg text-slate-400 hover:text-[#1C4D8D] hover:bg-blue-50 transition-colors disabled:opacity-40"
                          >
                            {isActioning === "resend" ? (
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
                            ) : (
                              <Icon name="PaperAirplaneIcon" size={16} />
                            )}
                          </button>
                        )}
                        {emp.status !== "REMOVED" && (
                          <button
                            onClick={() => setConfirmRemove(emp.id)}
                            disabled={!!isActioning}
                            title="Remove employee"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Icon name="TrashIcon" size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
                  <p className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
