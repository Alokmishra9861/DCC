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
  const showSubscribeNotice = location.state?.reason === "subscribe";

  useEffect(() => {
    const load = async () => {
      try {
        const [planRes, membershipRes] = await Promise.allSettled([
          membershipAPI.getPlans(),
          membershipAPI.getMy(),
        ]);

        if (planRes.status === "fulfilled") {
          setPlans(planRes.value || []);
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

  useEffect(() => {
    if (membership?.status === "ACTIVE") {
      navigate("/member-dashboard", { replace: true });
    }
  }, [membership, navigate]);

  const handleCheckout = async () => {
    setError("");
    setPaying(true);
    try {
      const checkout = await paymentAPI.createStripeCheckout();
      if (checkout?.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }
      throw new Error("Unable to start checkout.");
    } catch (err) {
      setError(err.message || "Payment could not be started.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = membership?.status === "ACTIVE";

  if (isActive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Redirecting to your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
            <Icon name="CreditCardIcon" size={16} />
            Membership Payment
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Activate Your Membership
          </h1>
          <p className="text-slate-600 text-lg">
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
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl">
            <h2 className="font-heading text-2xl font-bold text-slate-900 mb-6">
              Membership Plan
            </h2>

            {plans.length === 0 ? (
              <p className="text-slate-500">Plans are unavailable right now.</p>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {plan.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">
                        ${plan.price}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {plan.billingCycle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Icon name="LockClosedIcon" size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Secure Stripe Checkout
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  You will be redirected to Stripe to complete payment securely.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={paying || isActive}
                className="flex-1 px-6 py-4 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isActive
                  ? "Membership Active"
                  : paying
                    ? "Redirecting to Stripe..."
                    : "Pay with Stripe"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/member-dashboard")}
                disabled={!isActive}
                className="flex-1 px-6 py-4 border-2 border-slate-200 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">
              Membership Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {membership?.status || "NOT ACTIVE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Start</span>
                <span className="text-slate-700 text-sm">
                  {membership?.startDate
                    ? new Date(membership.startDate).toLocaleDateString("en-US")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expires</span>
                <span className="text-slate-700 text-sm">
                  {membership?.expiryDate
                    ? new Date(membership.expiryDate).toLocaleDateString(
                        "en-US",
                      )
                    : "-"}
                </span>
              </div>
            </div>

            <div className="mt-8 text-sm text-slate-500">
              Need help?{" "}
              <Link to="/contact" className="text-[#1C4D8D] hover:underline">
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
