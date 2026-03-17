// Frontend/src/user/pages/Shopping/Certificates/CertificateContent.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { certificateAPI, getUser } from "../../../services/api";
import { redirectToStripeCheckout } from "../../../services/stripeService";

// ─── Purchase confirmation modal ──────────────────────────────────────────────
const PurchaseModal = ({ cert, onConfirm, onClose, loading, error }) => {
  if (!cert) return null;
  const isPrepaid =
    cert.offer?.type === "PREPAID_CERTIFICATE" || !cert.offer?.type;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div
          className={`px-8 pt-8 pb-6 text-white ${
            isPrepaid
              ? "bg-gradient-to-r from-[#1C4D8D] to-[#2563eb]"
              : "bg-gradient-to-r from-emerald-600 to-teal-500"
          }`}
        >
          {!loading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Icon name="XMarkIcon" size={18} className="text-white" />
            </button>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
              {cert.offer?.business?.logoUrl ? (
                <AppImage
                  src={cert.offer.business.logoUrl}
                  alt={cert.offer.business.name}
                  className="w-10 h-10 object-contain rounded-full"
                />
              ) : (
                <Icon
                  name="TicketIcon"
                  size={22}
                  className={isPrepaid ? "text-[#1C4D8D]" : "text-emerald-600"}
                />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                {isPrepaid
                  ? "Prepaid Gift Certificate"
                  : "Value-Added Certificate"}
              </p>
              <p className="font-bold text-lg leading-tight">
                {cert.offer?.business?.name || "Certificate"}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Order summary */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Order Summary
            </p>
            {isPrepaid ? (
              <>
                <SummaryRow label="Face Value" value={`$${cert.faceValue}`} />
                <SummaryRow
                  label="You Pay (Member Price)"
                  value={`$${cert.memberPrice}`}
                  blue
                />
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <SummaryRow
                    label="You Save"
                    value={`$${cert.faceValue - cert.memberPrice} (${Math.round(
                      ((cert.faceValue - cert.memberPrice) / cert.faceValue) *
                        100,
                    )}% off)`}
                    green
                  />
                </div>
              </>
            ) : (
              <>
                <SummaryRow
                  label="Discount"
                  value={`$${cert.offer?.discountValue || cert.faceValue} OFF`}
                  green
                />
                {cert.offer?.minSpend && (
                  <SummaryRow
                    label="Min. Spend"
                    value={`$${cert.offer.minSpend}`}
                  />
                )}
                <SummaryRow
                  label="Member Price"
                  value={`$${cert.memberPrice}`}
                  blue
                />
              </>
            )}
          </div>

          {/* What happens next */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              What Happens After Payment
            </p>
            <ul className="space-y-2">
              {(isPrepaid
                ? [
                    "You'll receive a unique redemption code instantly",
                    "Share it via WhatsApp, email, or copy it",
                    `Recipient redeems full $${cert.faceValue} at ${cert.offer?.business?.name}`,
                  ]
                : [
                    "Your certificate activates immediately",
                    `Show at ${cert.offer?.business?.name} to get $${cert.offer?.discountValue} off`,
                    "One-time use — tracked in your dashboard",
                  ]
              ).map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <Icon
                    name="CheckCircleIcon"
                    size={16}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </p>
          )}

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed ${
              isPrepaid
                ? "bg-[#1C4D8D] hover:bg-blue-800"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting to Stripe…
              </>
            ) : (
              <>
                <Icon name="CreditCardIcon" size={20} />
                Pay ${cert.memberPrice} securely
              </>
            )}
          </button>
          {!loading && (
            <button
              onClick={onClose}
              className="w-full mt-3 py-3 text-slate-400 text-sm hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, blue, green }) => (
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm text-slate-600">{label}</span>
    <span
      className={`font-bold text-base ${
        green ? "text-green-600" : blue ? "text-[#1C4D8D]" : "text-slate-900"
      }`}
    >
      {value}
    </span>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const CertificationContent = () => {
  const navigate = useNavigate();
  const [user] = useState(getUser());
  const [loading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const data = await certificateAPI.getAvailable();
      // Response shape: { success, data: [...], canPurchase, membershipStatus }
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.certificates || data?.items || [];
      setCertificates(list);
    } catch (err) {
      console.error("Error fetching certificates:", err);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handlePurchaseClick = useCallback((cert) => {
    setPurchaseError("");
    setSelectedCert(cert);
  }, []);

  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedCert) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      // Only certificateId and type are needed — backend fetches everything else
      await redirectToStripeCheckout({
        certificateId: selectedCert.id || selectedCert._id,
        type: selectedCert.offer?.type || "PREPAID_CERTIFICATE",
      });
    } catch (err) {
      console.error("Purchase error:", err);
      setPurchaseError(err.message || "Payment failed. Please try again.");
      setPurchasing(false);
    }
  }, [selectedCert]);

  const handleCloseModal = useCallback(() => {
    if (purchasing) return;
    setSelectedCert(null);
    setPurchaseError("");
  }, [purchasing]);

  const valueAddedCerts = certificates.filter(
    (c) => c.offer?.type === "VALUE_ADDED_CERTIFICATE",
  );
  const prepaidCerts = certificates.filter(
    (c) => c.offer?.type === "PREPAID_CERTIFICATE" || !c.offer?.type,
  );
  const calcSavings = (fv, mp) => fv - mp;
  const calcPct = (fv, mp) => Math.round(((fv - mp) / fv) * 100);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {selectedCert && (
        <PurchaseModal
          cert={selectedCert}
          onConfirm={handleConfirmPurchase}
          onClose={handleCloseModal}
          loading={purchasing}
          error={purchaseError}
        />
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
              Redeemable Certificates
            </h1>
            <p className="text-xl text-muted-foreground">
              Purchase certificates at member-exclusive prices and redeem them
              at participating businesses. Your membership pays for itself!
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              How Certificates Work
            </h2>
            <p className="text-xl text-muted-foreground">Three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Purchase",
                desc: "Pay the member price via secure Stripe checkout.",
              },
              {
                step: "2",
                title: "Receive",
                desc: "Get a unique code (prepaid) or an active certificate instantly.",
              },
              {
                step: "3",
                title: "Redeem",
                desc: "Use full face value at the business. Keep the savings!",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                  {step}
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value-Added Certificates */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              Value-Added Certificates
            </h2>
            <p className="text-xl text-muted-foreground">
              Get dollars off your next purchase at participating businesses
            </p>
          </div>
          {loadingCertificates ? (
            <Spinner />
          ) : valueAddedCerts.length === 0 ? (
            <EmptyState
              icon="TicketIcon"
              message="No value-added certificates available at this time."
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {valueAddedCerts.map((cert) => (
                <CertCard
                  key={cert.id || cert._id}
                  cert={cert}
                  variant="value"
                  onPurchase={handlePurchaseClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prepaid Gift Certificates */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              Prepaid Gift Certificates
            </h2>
            <p className="text-xl text-muted-foreground">
              Perfect for gifting — share the unique code with anyone!
            </p>
          </div>
          {loadingCertificates ? (
            <Spinner />
          ) : prepaidCerts.length === 0 ? (
            <EmptyState
              icon="GiftIcon"
              message="No prepaid certificates available at this time."
            />
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {prepaidCerts.map((cert) => (
                <CertCard
                  key={cert.id || cert._id}
                  cert={cert}
                  variant="prepaid"
                  onPurchase={handlePurchaseClick}
                  calcSavings={calcSavings}
                  calcPct={calcPct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="font-heading text-4xl font-bold mb-6">
              Your Membership Pays for Itself
            </h2>
            <p className="text-xl opacity-90 mb-8">
              With up to $2,000 in certificate savings, recover your membership
              cost in your first purchase.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                ["$2,000", "Max Certificate Value"],
                ["20%", "Average Savings"],
                ["100%", "Member Satisfaction"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="text-5xl font-bold mb-2">{n}</p>
                  <p className="opacity-90">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Shared sub-components ─────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const EmptyState = ({ icon, message }) => (
  <div className="text-center py-12">
    <Icon
      name={icon}
      size={64}
      className="text-muted-foreground mx-auto mb-4"
    />
    <p className="text-xl text-muted-foreground">{message}</p>
  </div>
);

const CertCard = ({ cert, variant, onPurchase, calcSavings, calcPct }) => {
  const isValue = variant === "value";
  return (
    <div className="bg-white rounded-2xl overflow-hidden border-2 border-border hover:border-primary hover:shadow-xl transition-all">
      <div
        className={`p-6 text-center ${
          isValue
            ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
            : "bg-gradient-to-br from-primary/10 to-secondary/10"
        }`}
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {cert.offer?.business?.logoUrl ? (
            <AppImage
              src={cert.offer.business.logoUrl}
              alt={cert.offer.business.name || "Business"}
              className="w-16 h-16 object-contain rounded-full"
            />
          ) : (
            <Icon
              name="TicketIcon"
              size={40}
              className={isValue ? "text-emerald-600" : "text-primary"}
            />
          )}
        </div>
        <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
          {cert.offer?.business?.name}
        </h3>
        <p className="text-muted-foreground">{cert.offer?.title}</p>
      </div>
      <div className="p-6">
        {cert.offer?.description && (
          <p className="text-muted-foreground text-sm mb-4">
            {cert.offer.description}
          </p>
        )}
        {isValue ? (
          <>
            <div className="bg-emerald-50 rounded-xl p-5 mb-5 text-center">
              <p className="text-4xl font-bold text-emerald-600 mb-1">
                ${cert.offer?.discountValue || cert.faceValue} off
              </p>
              <p className="text-base font-semibold text-foreground">
                your next purchase
              </p>
              {cert.offer?.minSpend && (
                <p className="text-xs text-muted-foreground mt-1">
                  Min. spend: ${cert.offer.minSpend}
                </p>
              )}
            </div>
            <div className="bg-primary/5 rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Certificate Value
                </span>
                <span className="text-xl font-bold text-foreground">
                  ${cert.faceValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Member Price
                </span>
                <span className="text-xl font-bold text-primary">
                  ${cert.memberPrice}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-primary/5 rounded-xl p-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Face Value</span>
              <span className="text-xl font-bold text-foreground">
                ${cert.faceValue}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Member Price
              </span>
              <span className="text-xl font-bold text-primary">
                ${cert.memberPrice}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center">
              <span className="font-semibold text-foreground">You Save</span>
              <span className="font-bold text-green-600">
                ${calcSavings(cert.faceValue, cert.memberPrice)}{" "}
                <span className="text-sm">
                  ({calcPct(cert.faceValue, cert.memberPrice)}% off)
                </span>
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-between text-xs text-muted-foreground mb-4">
          <span>Status: {cert.status || "AVAILABLE"}</span>
          <span>
            Expires:{" "}
            {cert.expiryDate
              ? new Date(cert.expiryDate).toLocaleDateString()
              : "—"}
          </span>
        </div>
        <button
          onClick={() => onPurchase(cert)}
          className={`w-full px-6 py-3 rounded-full font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
            isValue
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isValue ? "Get Certificate" : "Purchase Gift Certificate"}
          <Icon name="ShoppingCartIcon" size={18} />
        </button>
      </div>
    </div>
  );
};

export default CertificationContent;
