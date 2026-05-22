// Frontend/src/admin/component/membershipplans/MembershipPlans.jsx
import React, { useEffect, useState, useCallback } from "react";
import { membershipAPI } from "../../../../src/services/api";

const BLUE = "#1C4D8D";
const BORDER = "#E8ECF2";
const SURFACE = "#F7F8FA";

const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-4 bg-red-100 text-red-600">
        ⚠
      </div>
      <p className="text-center text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          Delete
        </button>
      </div>
    </div>
  </div>
);

const PlanModal = ({ plan, onSave, onClose, saving }) => {
  const [name, setName] = useState(plan ? plan.name : "");
  const [price, setPrice] = useState(plan ? plan.price : "");
  const [currency, setCurrency] = useState(plan ? plan.currency : "KYD");
  const [billingCycle, setBillingCycle] = useState(plan ? plan.billingCycle : "year");
  const [description, setDescription] = useState(plan ? plan.description || "" : "");
  const [badge, setBadge] = useState(plan ? plan.badge || "" : "");
  const [isActive, setIsActive] = useState(plan ? plan.isActive : true);

  // Features structured as array of { key, type: "boolean" | "text", value }
  const [featureRows, setFeatureRows] = useState(() => {
    if (!plan || !plan.features) {
      return [
        { key: "Access to all discounts", type: "text", value: "Standard" },
        { key: "Digital membership card", type: "boolean", value: true },
        { key: "Mobile app access", type: "boolean", value: true },
        { key: "Unlimited savings", type: "boolean", value: true },
        { key: "Certificate purchases", type: "text", value: "Unlimited" },
        { key: "Support", type: "text", value: "Email support" },
      ];
    }
    return Object.entries(plan.features).map(([k, v]) => {
      const isBool = typeof v === "boolean";
      return { key: k, type: isBool ? "boolean" : "text", value: v };
    });
  });

  const handleAddFeatureRow = () => {
    setFeatureRows((prev) => [...prev, { key: "", type: "boolean", value: true }]);
  };

  const handleRemoveFeatureRow = (index) => {
    setFeatureRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, val) => {
    setFeatureRows((prev) => {
      const next = [...prev];
      next[index][field] = val;
      if (field === "type") {
        next[index].value = val === "boolean" ? true : "";
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || price === "") return;

    // Convert back to JSON object
    const featuresObj = {};
    featureRows.forEach((row) => {
      if (row.key.trim()) {
        featuresObj[row.key.trim()] = row.type === "boolean" ? !!row.value : String(row.value);
      }
    });

    onSave({
      name,
      price: parseFloat(price),
      currency,
      billingCycle,
      description,
      badge,
      isActive,
      features: featuresObj,
    });
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors";
  const labelCls =
    "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h3
              className="font-bold text-slate-900 text-lg md:text-xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {plan ? "Edit Membership Plan" : "Create Membership Plan"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set price tiers and customize feature comparison dynamically
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Plan Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Basic, Premium, VIP"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Badge Label (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Most Popular, Elite"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 89.00"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g. KYD, USD"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className={inputCls + " cursor-pointer"}
              >
                <option value="year">Yearly</option>
                <option value="month">Monthly</option>
                <option value="one-time">One Time</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of the plan value proposition"
              rows={2}
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded-lg border-slate-300 text-[#1C4D8D] focus:ring-[#1C4D8D]"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
              Plan is Active (Visible to users on Pricing page)
            </label>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                Dynamic Plan Features Matrix
              </h4>
              <button
                type="button"
                onClick={handleAddFeatureRow}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1C4D8D]/10 text-[#1C4D8D] hover:bg-[#1C4D8D]/20 transition-colors"
              >
                + Add Feature Row
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {featureRows.map((row, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Feature Name (e.g. Support)"
                      value={row.key}
                      onChange={(e) => handleRowChange(idx, "key", e.target.value)}
                      className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1C4D8D]"
                    />
                  </div>

                  <div className="w-28 shrink-0">
                    <select
                      value={row.type}
                      onChange={(e) => handleRowChange(idx, "type", e.target.value)}
                      className="w-full bg-white px-2 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#1C4D8D]"
                    >
                      <option value="boolean">Checkmark</option>
                      <option value="text">Custom Text</option>
                    </select>
                  </div>

                  <div className="w-36 shrink-0 flex items-center justify-center">
                    {row.type === "boolean" ? (
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!row.value}
                          onChange={(e) => handleRowChange(idx, "value", e.target.checked)}
                          className="w-4 h-4 rounded text-[#1C4D8D] focus:ring-[#1C4D8D]"
                        />
                        Enabled
                      </label>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="e.g. Unlimited, Email"
                        value={row.value}
                        onChange={(e) => handleRowChange(idx, "value", e.target.value)}
                        className="w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFeatureRow(idx)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shrink-0 text-xs"
                  >
                    🗑
                  </button>
                </div>
              ))}
              {featureRows.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  No features defined. Click "+ Add Feature Row" to populate your plans.
                </div>
              )}
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="pt-4 flex gap-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Saving Plan..." : plan ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Modals
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await membershipAPI.getAdminPlans();
      setPlans(Array.isArray(res) ? res : (res?.data ?? []));
      console.log(res);
    } catch (err) {
      setError(err.message || "Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedPlan(null);
    setShowModal(true);
  };

  const handleSavePlan = async (formData) => {
    setSaving(true);
    try {
      if (selectedPlan) {
        await membershipAPI.updatePlan(selectedPlan.id, formData);
        showToast("success", "Plan updated successfully");
      } else {
        await membershipAPI.createPlan(formData);
        showToast("success", "New plan created successfully");
      }
      setShowModal(false);
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to save membership plan");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      await membershipAPI.updatePlan(plan.id, { isActive: !plan.isActive });
      showToast("success", `Plan ${!plan.isActive ? "activated" : "deactivated"}`);
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to toggle status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await membershipAPI.deletePlan(deleteTarget.id);
      showToast("success", res?.message || "Plan deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast("error", err.message || "Failed to delete plan");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-3 md:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Are you sure you want to delete the plan "${deleteTarget.name}"? If active users exist on this plan, it will be automatically set to Inactive instead of hard-deleted to preserve transaction logs.`}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showModal && (
        <PlanModal
          plan={selectedPlan}
          saving={saving}
          onSave={handleSavePlan}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-xl md:text-2xl font-bold text-slate-900"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.02em",
            }}
          >
            Membership Plans
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Configure dynamic plans and customization features shown on the user's pricing matrix
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-5 py-2.5 rounded-xl bg-[#1C4D8D] text-white text-xs md:text-sm font-bold hover:bg-[#163d71] transition-all transform hover:-translate-y-0.5 shadow-sm shadow-[#1C4D8D]/15 self-start sm:self-center"
        >
          + Add New Plan
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* List of Plans */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-10 bg-slate-100 rounded w-1/2 mt-4" />
              </div>
              <div className="h-10 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-2xl text-slate-400">
            💳
          </div>
          <h3 className="font-bold text-slate-700 text-base mb-1">No Membership Plans</h3>
          <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto">
            You don't have any membership plans configured. Click the button below to seed the default Basic, Premium, and VIP plans.
          </p>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                // Fetch user-side getPlans, which auto-seeds default plans if 0 plans exist!
                await membershipAPI.getPlans();
                showToast("success", "Successfully seeded default plans");
                load();
              } catch (err) {
                showToast("error", err.message || "Failed to seed default plans");
              } finally {
                setLoading(false);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Seed Default Plans
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const hasFeatures = p.features && Object.keys(p.features).length > 0;
            return (
              <div
                key={p.id}
                className={`bg-white rounded-[2rem] border shadow-sm transition-all flex flex-col justify-between overflow-hidden ${
                  p.isActive ? "border-slate-100 hover:border-[#1C4D8D]/20 hover:shadow-md" : "border-red-100 opacity-75 hover:opacity-100"
                }`}
              >
                {/* Plan Card Content */}
                <div className="p-6 md:p-7 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      {p.badge && (
                        <span className="inline-block text-[9px] font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                          {p.badge}
                        </span>
                      )}
                      <h3
                        className="font-bold text-slate-900 text-xl"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {p.name}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-red-50 text-red-500 border-red-100"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                    {p.description || "No description provided."}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">
                      ${p.price.toFixed(2)}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">
                      {p.currency} / {p.billingCycle}
                    </span>
                  </div>

                  {/* Feature preview */}
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Feature Privileges
                  </h4>
                  {hasFeatures ? (
                    <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                      {Object.entries(p.features).map(([fKey, fVal]) => {
                        const isTrue = fVal === true;
                        const isFalse = fVal === false;
                        return (
                          <li key={fKey} className="flex items-start gap-2.5 text-xs text-slate-600">
                            {isTrue ? (
                              <span className="text-emerald-500 font-semibold shrink-0 text-sm leading-none">✓</span>
                            ) : isFalse ? (
                              <span className="text-slate-300 font-semibold shrink-0 text-sm leading-none">-</span>
                            ) : (
                              <span className="text-[#1C4D8D] font-semibold shrink-0 text-sm leading-none">✓</span>
                            )}
                            <span className="leading-relaxed font-medium">
                              <strong>{fKey}:</strong>{" "}
                              {typeof fVal === "boolean" ? (fVal ? "Included" : "Excluded") : String(fVal)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-xs italic mb-4">No features defined.</p>
                  )}
                </div>

                {/* Plan Card Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEditClick(p)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-all"
                    >
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(p)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      p.isActive
                        ? "bg-slate-200/50 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-[#1C4D8D]/10 hover:bg-[#1C4D8D]/20 border-transparent text-[#1C4D8D]"
                    }`}
                  >
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
