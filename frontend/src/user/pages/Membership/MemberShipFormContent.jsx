import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { membershipAPI, paymentAPI } from "../../../services/api";

const MemberShipFormContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  
  // Track selected plan & payment provider
  const [selectedPlanId, setSelectedPlanId] = useState(location.state?.selectedPlanId || "");
  const [paymentProvider, setPaymentProvider] = useState("STRIPE");
  
  const showSubscribeNotice = location.state?.reason === "subscribe";

  useEffect(() => {
    const load = async () => {
      try {
        const [planRes, membershipRes] = await Promise.allSettled([
          membershipAPI.getPlans(),
          membershipAPI.getMy(),
        ]);

        if (planRes.status === "fulfilled") {
          const activePlans = planRes.value?.data || planRes.value || [];
          setPlans(activePlans);
        }

        if (membershipRes.status === "fulfilled") {
          setMembership(membershipRes.value || null);
        }
      } catch (err) {
        setError(err.message || "Unable to load membership details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Pre-select Premium or first plan if none selected
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const premium = plans.find((p) =>
        p.name.toUpperCase().includes("PREMIUM")
      );
      setSelectedPlanId(premium ? premium.id : plans[0].id);
    }
  }, [plans, selectedPlanId]);

  useEffect(() => {
    if (membership?.status === "ACTIVE") {
      navigate("/member-dashboard", { replace: true });
    }
  }, [membership, navigate]);

  const handleCheckout = async () => {
    if (!selectedPlanId) {
      setError("Please select a membership plan to continue.");
      return;
    }

    setError("");
    setPaying(true);
    try {
      if (paymentProvider === "PAYPAL") {
        const checkout = await paymentAPI.createPayPalCheckout({
          planId: selectedPlanId,
        });
        const approveLink = checkout?.links?.find((l) => l.rel === "approve");
        if (approveLink?.href) {
          window.location.href = approveLink.href;
          return;
        }
        throw new Error("Unable to start PayPal checkout.");
      } else {
        const checkout = await paymentAPI.createStripeCheckout({
          planId: selectedPlanId,
        });
        if (checkout?.checkoutUrl) {
          window.location.href = checkout.checkoutUrl;
          return;
        }
        throw new Error("Unable to start Stripe checkout.");
      }
    } catch (err) {
      setError(err.message || "Payment could not be started.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1328] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = membership?.status === "ACTIVE";

  if (isActive) {
    return (
      <div className="min-h-screen bg-[#0D1328] flex items-center justify-center">
        <div className="text-slate-300">Redirecting to your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1328] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md/80 backdrop-blur-sm border border-white/10 rounded-full text-[#D4AF37] font-semibold text-sm mb-6 shadow-sm">
            <Icon name="CreditCardIcon" size={16} />
            Membership Payment
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
            Activate Your Membership
          </h1>
          <p className="text-slate-300 text-lg">
            Complete payment to unlock your member dashboard and QR access.
          </p>
        </div>

        {showSubscribeNotice && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <Icon name="LockClosedIcon" size={20} className="text-amber-600" />
            <p className="text-sm text-amber-700 font-medium">
              You need an active membership to view discount details.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <Icon
              name="ExclamationCircleIcon"
              size={20}
              className="text-red-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/10 shadow-xl">
            <h2 className="font-heading text-2xl font-bold text-white mb-6">
              Choose a Membership Plan
            </h2>

            {plans.length === 0 ? (
              <p className="text-slate-300">Plans are unavailable right now.</p>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => {
                  const isPremium = plan.name.toUpperCase().includes('PREMIUM');
                  const isVIP = plan.name.toUpperCase().includes('VIP');
                  const isBasic = plan.name.toUpperCase().includes('BASIC');
                  const isSelected = selectedPlanId === plan.id;

                  let borderStyle = "border-white/10 hover:border-white/30 bg-white/5";
                  let radioColor = "border-slate-400 bg-transparent";

                  if (isSelected) {
                    if (isPremium) {
                      borderStyle = "border-amber-400 bg-gradient-to-br from-amber-500/10 to-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.2)]";
                      radioColor = "border-amber-400 bg-amber-400";
                    } else if (isVIP) {
                      borderStyle = "border-purple-500 bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-[0_0_20px_rgba(147,51,234,0.2)]";
                      radioColor = "border-purple-500 bg-purple-500";
                    } else {
                      borderStyle = "border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.2)]";
                      radioColor = "border-blue-500 bg-blue-500";
                    }
                  }

                  return (
                    <div
                      key={plan.id}
                      onClick={() => !paying && setSelectedPlanId(plan.id)}
                      className={`p-5 border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 transform ${
                        isSelected ? "scale-[1.01]" : ""
                      } ${borderStyle} ${paying ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${radioColor}`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#0D1328]" />}
                        </span>
                        <div>
                          <p className="font-semibold text-white flex items-center gap-2">
                            {plan.name}
                            {plan.badge && (
                              <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                isPremium ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : isVIP ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}>
                                {plan.badge}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-300 mt-1">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          ${plan.price}
                        </p>
                        <p className="text-xs text-slate-300 capitalize">
                          {plan.billingCycle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Payment Method Selector */}
            <h3 className="font-heading text-xl font-bold text-white mt-10 mb-6">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "STRIPE",
                  label: "Credit / Debit Card",
                  sublabel: "Processed securely via Stripe",
                  icon: "CreditCardIcon",
                  badge: "Secure",
                  badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                },
                {
                  key: "PAYPAL",
                  label: "PayPal",
                  sublabel: "Pay with PayPal account or card",
                  icon: "CurrencyDollarIcon",
                  badge: "Fast Checkout",
                  badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30"
                }
              ].map((provider) => {
                const isSelected = paymentProvider === provider.key;
                return (
                  <div
                    key={provider.key}
                    onClick={() => !paying && setPaymentProvider(provider.key)}
                    className={`relative p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-[1.01]"
                        : "border-white/10 hover:border-white/30 hover:bg-white/5 bg-white/5"
                    } ${paying ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Icon
                          name={provider.icon}
                          size={24}
                          className={isSelected ? "text-[#D4AF37]" : "text-slate-400"}
                        />
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-full ${provider.badgeClass}`}>
                          {provider.badge}
                        </span>
                      </div>
                      <p className="font-semibold text-white">{provider.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{provider.sublabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3">
              <Icon
                name="LockClosedIcon"
                size={20}
                className={paymentProvider === "PAYPAL" ? "text-blue-400" : "text-amber-400"}
              />
              <div>
                <p className="text-sm font-semibold text-white animate-pulse">
                  Secure {paymentProvider === "PAYPAL" ? "PayPal" : "Stripe"} Checkout
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {paymentProvider === "PAYPAL"
                    ? "You will be redirected to PayPal to complete your payment securely."
                    : "You will be redirected to Stripe to complete your credit card payment securely."}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={paying || isActive || !selectedPlanId}
                className="flex-1 px-6 py-4 bg-[#D4AF37] text-white rounded-xl font-bold hover:bg-[#D4AF37]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isActive
                  ? "Membership Active"
                  : paying
                    ? `Redirecting to ${paymentProvider === "PAYPAL" ? "PayPal" : "Stripe"}...`
                    : `Pay with ${paymentProvider === "PAYPAL" ? "PayPal" : "Stripe"}`}
              </button>
              <button
                type="button"
                onClick={() => navigate("/member-dashboard")}
                disabled={!isActive}
                className="flex-1 px-6 py-4 border-2 border-white/10 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#D4AF37] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-lg">
            <h3 className="font-heading text-xl font-bold text-white mb-4">
              Membership Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Status</span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isActive
                      ? "bg-emerald-100/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-100/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {membership?.status || "NOT ACTIVE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Start</span>
                <span className="text-slate-300 text-sm">
                  {membership?.startDate
                    ? new Date(membership.startDate).toLocaleDateString("en-US")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Expires</span>
                <span className="text-slate-300 text-sm">
                  {membership?.expiryDate
                    ? new Date(membership.expiryDate).toLocaleDateString(
                        "en-US",
                      )
                    : "-"}
                </span>
              </div>
            </div>

            <div className="mt-8 text-sm text-slate-300">
              Need help?{" "}
              <Link to="/contact" className="text-[#D4AF37] hover:underline">
                Contact support
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberShipFormContent;
