// Frontend/src/employer/pages/BulkPurchase.jsx
// Employer selects a plan, chooses seat count, pays via Stripe or PayPal.
// After payment verification the employer record is updated with seat allocation.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { employerAPI } from "../../../services/api";

// ── Plan config (must match backend PLAN_CONFIG) ──────────────────────────────
const PLANS = [
  {
    key: "BASIC",
    label: "Basic",
    maxSeats: 10,
    pricePerSeat: 49,
    color: "from-slate-600 to-slate-700",
    accent: "bg-slate-100 text-slate-700",
    description: "Perfect for small teams",
    features: [
      "Up to 10 employees",
      "Full discount access",
      "Email support",
      "Basic dashboard",
    ],
  },
  {
    key: "STANDARD",
    label: "Standard",
    maxSeats: 50,
    pricePerSeat: 39,
    color: "from-[#1C4D8D] to-[#163d71]",
    accent: "bg-blue-100 text-blue-700",
    description: "Most popular for growing companies",
    badge: "Most Popular",
    features: [
      "Up to 50 employees",
      "Full discount access",
      "Priority support",
      "ROI dashboard & analytics",
    ],
  },
  {
    key: "ENTERPRISE",
    label: "Enterprise",
    maxSeats: 999,
    pricePerSeat: 29,
    color: "from-emerald-600 to-teal-700",
    accent: "bg-emerald-100 text-emerald-700",
    description: "For large organisations",
    features: [
      "Unlimited employees",
      "Full discount access",
      "Dedicated account manager",
      "Advanced analytics & exports",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
const BulkPurchase = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("STANDARD");
  const [seatCount, setSeatCount] = useState(10);
  const [paymentProvider, setPaymentProvider] = useState("STRIPE");
  const [step, setStep] = useState(1); // 1=plan, 2=seats, 3=payment, 4=success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchaseResult, setPurchaseResult] = useState(null);

  const plan = PLANS.find((p) => p.key === selectedPlan);
  const totalPrice = seatCount * plan.pricePerSeat;

  const handleSeatChange = (val) => {
    const n = Math.max(
      1,
      Math.min(plan.maxSeats === 999 ? 500 : plan.maxSeats, Number(val)),
    );
    setSeatCount(n);
  };

  // When plan changes, clamp seat count to new plan's max
  useEffect(() => {
    if (plan.maxSeats !== 999 && seatCount > plan.maxSeats) {
      setSeatCount(plan.maxSeats);
    }
  }, [selectedPlan]);

  // ── TEST MODE: calls employerAPI.bulkPurchase() directly, no Stripe/PayPal ──
  // When real payments are ready, replace this with actual Stripe/PayPal flow.
  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      // Generate a test payment reference so the backend accepts it
      const testPaymentId = `TEST-${paymentProvider}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const res = await employerAPI.bulkPurchase({
        planType: selectedPlan,
        seatCount,
        paymentProvider, // "STRIPE" or "PAYPAL"
        paymentId: testPaymentId,
      });

      setPurchaseResult(res);
      setStep(4);
    } catch (err) {
      setError(err.message || "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: success ───────────────────────────────────────────────────────
  if (step === 4 && purchaseResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              name="CheckCircleIcon"
              size={32}
              className="text-emerald-600"
              variant="solid"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Purchase Successful!
          </h2>
          <p className="text-slate-500 mb-6">
            Your seats are ready. Start inviting employees now.
          </p>
          <div className="bg-slate-50 rounded-xl p-5 mb-6 text-left space-y-2">
            {[
              ["Plan", purchaseResult.planType],
              ["Seats purchased", purchaseResult.seatsPurchased],
              ["Total paid", `$${totalPrice.toFixed(2)} USD`],
              [
                "Valid until",
                new Date(purchaseResult.planExpiryDate).toLocaleDateString(),
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/employer-dashboard/employees/upload")}
            className="w-full py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors"
          >
            Add Employees Now
          </button>
          <button
            onClick={() => navigate("/employer-dashboard")}
            className="w-full py-3 mt-2 text-slate-600 text-sm hover:text-slate-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate(-1))}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm"
          >
            <Icon name="ArrowLeftIcon" size={16} /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Purchase Employee Memberships
          </h1>
          <p className="text-slate-500 mt-1">
            Choose a plan and number of seats for your team.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Choose Plan", "Select Seats", "Payment"].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step > i + 1
                      ? "bg-emerald-500 text-white"
                      : step === i + 1
                        ? "bg-[#1C4D8D] text-white"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {step > i + 1 ? <Icon name="CheckIcon" size={14} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${step === i + 1 ? "text-slate-800" : "text-slate-400"}`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`flex-1 h-0.5 rounded ${step > i + 1 ? "bg-emerald-400" : "bg-slate-200"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <Icon
              name="ExclamationCircleIcon"
              size={18}
              className="text-red-500 flex-shrink-0"
            />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* ── Step 1: Choose Plan ── */}
        {step === 1 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {PLANS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPlan(p.key)}
                  className={`relative text-left rounded-2xl border-2 p-6 transition-all ${
                    selectedPlan === p.key
                      ? "border-[#1C4D8D] shadow-lg shadow-blue-100"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1C4D8D] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  {selectedPlan === p.key && (
                    <div className="absolute top-4 right-4">
                      <Icon
                        name="CheckCircleIcon"
                        size={20}
                        className="text-[#1C4D8D]"
                        variant="solid"
                      />
                    </div>
                  )}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}
                  >
                    <Icon
                      name="BuildingOfficeIcon"
                      size={20}
                      className="text-white"
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">
                    {p.label}
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">{p.description}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-black text-slate-900">
                      ${p.pricePerSeat}
                    </span>
                    <span className="text-slate-400 text-sm"> /seat/year</span>
                  </div>
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-slate-600"
                      >
                        <Icon
                          name="CheckIcon"
                          size={14}
                          className="text-emerald-500 mt-0.5 flex-shrink-0"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors flex items-center gap-2"
              >
                Continue <Icon name="ArrowRightIcon" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Select Seats ── */}
        {step === 2 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                >
                  <Icon name="UserGroupIcon" size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {plan.label} Plan
                  </h3>
                  <p className="text-xs text-slate-500">
                    ${plan.pricePerSeat}/seat/year
                  </p>
                </div>
              </div>

              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                Number of Seats
              </label>

              {/* Seat counter */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleSeatChange(seatCount - 1)}
                  disabled={seatCount <= 1}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={plan.maxSeats === 999 ? 500 : plan.maxSeats}
                  value={seatCount}
                  onChange={(e) => handleSeatChange(e.target.value)}
                  className="flex-1 text-center text-2xl font-black text-slate-900 border-2 border-slate-200 rounded-xl py-3 focus:outline-none focus:border-[#1C4D8D]"
                />
                <button
                  onClick={() => handleSeatChange(seatCount + 1)}
                  disabled={plan.maxSeats !== 999 && seatCount >= plan.maxSeats}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>

              {/* Quick seat presets */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[5, 10, 20, 50]
                  .filter((n) => plan.maxSeats === 999 || n <= plan.maxSeats)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setSeatCount(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        seatCount === n
                          ? "border-[#1C4D8D] bg-blue-50 text-[#1C4D8D]"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {n} seats
                    </button>
                  ))}
              </div>

              {/* Price breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>
                    {seatCount} seats × ${plan.pricePerSeat}/year
                  </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Billing period</span>
                  <span>1 year</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total due today</span>
                  <span className="text-lg">${totalPrice.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:border-slate-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-colors flex items-center justify-center gap-2"
              >
                Continue <Icon name="ArrowRightIcon" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Payment (TEST MODE) ── */}
        {step === 3 && (
          <div className="max-w-lg mx-auto">
            {/* Test mode banner */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
              <span className="text-amber-500 text-lg flex-shrink-0">⚠</span>
              <div>
                <p className="text-sm font-bold text-amber-700">
                  Test Mode Active
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  No real payment will be charged. Click "Confirm Purchase" to
                  activate seats instantly using a test payment reference.
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Plan</span>
                  <span className="font-semibold text-slate-800">
                    {plan.label}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Seats</span>
                  <span className="font-semibold text-slate-800">
                    {seatCount}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Price per seat</span>
                  <span>${plan.pricePerSeat}/year</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-lg">${totalPrice.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            {/* Payment method selector — visual only in test mode */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Payment Method</h3>
                <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">
                  Test Mode
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    key: "STRIPE",
                    label: "Credit / Debit Card",
                    icon: "CreditCardIcon",
                  },
                  {
                    key: "PAYPAL",
                    label: "PayPal",
                    icon: "CurrencyDollarIcon",
                  },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentProvider(key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paymentProvider === key
                        ? "border-[#1C4D8D] bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Icon
                      name={icon}
                      size={20}
                      className={
                        paymentProvider === key
                          ? "text-[#1C4D8D]"
                          : "text-slate-400"
                      }
                    />
                    <p
                      className={`text-xs font-semibold mt-2 ${
                        paymentProvider === key
                          ? "text-[#1C4D8D]"
                          : "text-slate-600"
                      }`}
                    >
                      {label}
                    </p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Selected:{" "}
                <strong>
                  {paymentProvider === "STRIPE"
                    ? "Credit / Debit Card"
                    : "PayPal"}
                </strong>{" "}
                — a test reference ID will be generated automatically.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:border-slate-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#163d71] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircleIcon" size={16} />
                    Confirm Purchase — ${totalPrice.toFixed(2)}
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Test mode · No real charges · Switch to live payments before
              launch
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkPurchase;
