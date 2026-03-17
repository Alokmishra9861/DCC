// Frontend/src/user/pages/Business Section/Businessprofile.jsx  — FULL REPLACEMENT
import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import {
  businessAPI,
  offerAPI,
  getUser,
  uploadAPI,
} from "../../../services/api";
import { redirectToStripeCheckout } from "../../../services/stripeService";

// ─── Purchase confirmation modal (same pattern as CertificateContent.jsx) ────
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
              <Icon
                name="TicketIcon"
                size={22}
                className={isPrepaid ? "text-[#1C4D8D]" : "text-emerald-600"}
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                {isPrepaid
                  ? "Prepaid Gift Certificate"
                  : "Value-Added Certificate"}
              </p>
              <p className="font-bold text-lg leading-tight">
                {cert.offer?.title || "Certificate"}
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
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Face Value</span>
              <span className="font-bold text-slate-900">
                ${cert.faceValue}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Member Price</span>
              <span className="font-bold text-[#1C4D8D]">
                ${cert.memberPrice}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
              <span className="font-semibold text-slate-700">You Save</span>
              <span className="font-bold text-green-600">
                ${(cert.faceValue - cert.memberPrice).toFixed(2)}{" "}
                <span className="text-sm">
                  (
                  {Math.round(
                    ((cert.faceValue - cert.memberPrice) / cert.faceValue) *
                      100,
                  )}
                  % off)
                </span>
              </span>
            </div>
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
                    "Share it via WhatsApp or email",
                    `Recipient redeems full $${cert.faceValue} at this business`,
                  ]
                : [
                    "Your certificate activates immediately",
                    "Show it at the business to get your discount",
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

// ─── Main component ───────────────────────────────────────────────────────────
const BusinessProfileContent = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Offer modal state (unchanged)
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    type: "DISCOUNT",
    discountValue: "",
    minSpend: "",
    expiryDate: "",
  });

  // ── NEW: purchase modal state ─────────────────────────────────────────────
  const [selectedCert, setSelectedCert] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");

  const user = getUser();
  const ownerId =
    user?.profile?._id ||
    user?.profile?.id ||
    user?.business?._id ||
    user?.business?.id;
  const isOwner =
    String(ownerId || "") === String(businessId || "") &&
    String(user?.role || "").toUpperCase() === "BUSINESS";

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      if (!businessId) {
        setLoading(false);
        return;
      }
      const data = await businessAPI.getById(businessId);
      const businessData = data?.business || data;
      setBusiness(businessData);

      const offers = businessData?.offers || [];
      const discountOffers = offers.filter((o) => o.type === "DISCOUNT");
      const certificateOffers = offers.filter(
        (o) =>
          o.type === "PREPAID_CERTIFICATE" ||
          o.type === "VALUE_ADDED_CERTIFICATE",
      );
      const availableCertificates = certificateOffers.flatMap((o) =>
        (o.certificates || []).map((c) => ({ ...c, offer: o })),
      );
      setDiscounts(discountOffers);
      setCertificates(availableCertificates);
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── NEW: purchase handlers ────────────────────────────────────────────────
  const handlePurchaseClick = useCallback(
    (cert) => {
      // If user is not logged in, redirect to login
      if (!user) {
        navigate("/login");
        return;
      }
      setPurchaseError("");
      setSelectedCert(cert);
    },
    [user, navigate],
  );

  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedCert) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      await redirectToStripeCheckout({
        certificateId: selectedCert.id || selectedCert._id,
        type: selectedCert.offer?.type || "PREPAID_CERTIFICATE",
      });
      // Code here only runs if Stripe redirect didn't happen
    } catch (err) {
      console.error("Purchase error:", err);
      // Handle membership gate error from backend
      if (
        err.message?.toLowerCase().includes("membership") ||
        err.message?.toLowerCase().includes("active")
      ) {
        setPurchaseError(
          "An active membership is required. Redirecting to membership page…",
        );
        setTimeout(() => navigate("/membership"), 2000);
      } else {
        setPurchaseError(err.message || "Payment failed. Please try again.");
      }
      setPurchasing(false);
    }
  }, [selectedCert, navigate]);

  const handleCloseModal = useCallback(() => {
    if (purchasing) return;
    setSelectedCert(null);
    setPurchaseError("");
  }, [purchasing]);

  // ── Offer handlers (unchanged) ────────────────────────────────────────────
  const openCreateOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: "",
      description: "",
      imageUrl: "",
      type: "DISCOUNT",
      discountValue: "",
      minSpend: "",
      expiryDate: "",
    });
    setShowOfferModal(true);
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || "",
      description: offer.description || "",
      imageUrl: offer.imageUrl || "",
      type: offer.type || "DISCOUNT",
      discountValue: offer.discountValue ?? "",
      minSpend: offer.minSpend ?? "",
      expiryDate: offer.expiryDate
        ? new Date(offer.expiryDate).toISOString().slice(0, 10)
        : "",
    });
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: offerForm.title,
      description: offerForm.description,
      imageUrl: offerForm.imageUrl || null,
      type: offerForm.type,
      discountValue: offerForm.discountValue || null,
      minSpend: offerForm.minSpend || null,
      expiryDate: offerForm.expiryDate || null,
    };
    try {
      if (editingOffer) {
        await offerAPI.update(editingOffer.id, payload);
      } else {
        await offerAPI.create(payload);
      }
      setShowOfferModal(false);
      fetchBusinessData();
    } catch (error) {
      console.error("Offer save failed:", error);
      alert(error.message || "Failed to save offer.");
    }
  };

  const handleOfferImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const data = await uploadAPI.image(file);
      const url = data?.url || data?.secure_url || "";
      setOfferForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(error.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOfferDelete = async (offerId) => {
    if (!window.confirm("Delete this offer? This cannot be undone.")) return;
    try {
      await offerAPI.delete(offerId);
      fetchBusinessData();
    } catch (error) {
      console.error("Offer delete failed:", error);
      alert(error.message || "Failed to delete offer.");
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon
            name="BuildingStorefrontIcon"
            size={64}
            className="text-muted-foreground mx-auto mb-4"
          />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Business Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The business you are looking for does not exist.
          </p>
          <Link
            to="/discounts"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
          >
            <Icon name="ArrowLeftIcon" size={18} />
            Back to Discounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        background:
          "radial-gradient(circle at 10% 10%, rgba(34, 74, 128, 0.15), transparent 50%), radial-gradient(circle at 90% 0%, rgba(16, 185, 129, 0.12), transparent 45%), #f8fafc",
        fontFamily: '"Outfit", "Space Grotesk", system-ui, sans-serif',
        "--ink": "#0f172a",
        "--accent": "#1c4d8d",
        "--sun": "#f59e0b",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .dcc-title { font-family: 'Space Grotesk', 'Outfit', sans-serif; }
      `}</style>

      {/* ── Purchase Modal ──────────────────────────────────────────────── */}
      {selectedCert && (
        <PurchaseModal
          cert={selectedCert}
          onConfirm={handleConfirmPurchase}
          onClose={handleCloseModal}
          loading={purchasing}
          error={purchaseError}
        />
      )}

      {/* Hero (unchanged) */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute top-24 -left-16 w-64 h-64 rounded-full bg-blue-200/40 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl p-8">
              <div className="flex flex-wrap items-start gap-6">
                <div className="w-24 h-24 bg-slate-900/5 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                  {business.logoUrl ? (
                    <AppImage
                      src={business.logoUrl}
                      alt="Business logo"
                      className="w-20 h-20 object-contain rounded-xl"
                    />
                  ) : (
                    <Icon
                      name="BuildingStorefrontIcon"
                      size={48}
                      className="text-slate-700"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-[220px]">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    Verified Partner
                  </div>
                  <h1 className="dcc-title text-4xl md:text-5xl font-bold text-[var(--ink)] mt-3">
                    {business.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                    {business.address && (
                      <div className="flex items-center gap-2">
                        <Icon name="MapPinIcon" size={16} />
                        <span>{business.address}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <Icon name="PhoneIcon" size={16} />
                        <a
                          href={`tel:${business.phone}`}
                          className="hover:text-[var(--accent)]"
                        >
                          {business.phone}
                        </a>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center gap-2">
                        <Icon name="EnvelopeIcon" size={16} />
                        <a
                          href={`mailto:${business.email}`}
                          className="hover:text-[var(--accent)]"
                        >
                          {business.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {business.description && (
                <p className="mt-6 text-base md:text-lg text-slate-600 leading-relaxed">
                  {business.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Icon name="GlobeAltIcon" size={16} />
                    Visit Website
                  </a>
                )}
                <Link
                  to="/advertise"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--accent)] text-white font-semibold shadow-lg shadow-blue-500/20 hover:bg-[#163c6b] transition-all"
                >
                  <Icon name="MegaphoneIcon" size={16} />
                  Advertise With Us
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                Highlights
              </p>
              <h2 className="dcc-title text-2xl font-semibold mt-3">
                Member favorites and weekly deals
              </h2>
              <div className="mt-6 grid gap-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs text-white/60">Category</p>
                  <p className="text-lg font-semibold">
                    {business.category?.name ||
                      business.category?.slug ||
                      business.category ||
                      "Local Favorite"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs text-white/60">District</p>
                  <p className="text-lg font-semibold">
                    {business.district || "Cayman Islands"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs text-white/60">Specials</p>
                  <p className="text-lg font-semibold">
                    {discounts.length} active offers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discounts & Offers (unchanged) */}
      {discounts.length > 0 && (
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between gap-6 mb-8">
              <h2 className="dcc-title text-3xl font-bold text-[var(--ink)]">
                Current Offers
              </h2>
              <div className="flex items-center gap-3">
                {isOwner && (
                  <button
                    type="button"
                    onClick={openCreateOffer}
                    className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-semibold shadow-md hover:bg-[#163c6b] transition-all"
                  >
                    Add Offer
                  </button>
                )}
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  Updated weekly
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {discounts.map((discount) => (
                <div
                  key={discount.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all"
                >
                  {discount.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100">
                      <AppImage
                        src={discount.imageUrl}
                        alt={discount.title || "Offer image"}
                        className="w-full h-44 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="dcc-title text-2xl font-semibold text-[var(--ink)]">
                      {discount.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        Limited
                      </span>
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditOffer(discount)}
                            className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-700 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOfferDelete(discount.id)}
                            className="px-3 py-1 rounded-full text-xs font-semibold border border-rose-200 text-rose-600 hover:border-rose-300 hover:text-rose-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[var(--accent)] font-bold text-xl mt-3">
                    {discount.type === "DISCOUNT" && discount.discountValue
                      ? `${discount.discountValue}% off`
                      : discount.type === "VALUE_ADDED_CERTIFICATE" &&
                          discount.discountValue
                        ? `$${discount.discountValue} off`
                        : discount.title}
                  </p>
                  {discount.description && (
                    <p className="text-slate-600 mt-3">
                      {discount.description}
                    </p>
                  )}
                  {discount.expiryDate && (
                    <p className="text-sm text-slate-500 mt-4">
                      <strong>Valid until:</strong>{" "}
                      {new Date(discount.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offer CRUD modal (unchanged) */}
      {showOfferModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="dcc-title text-2xl font-semibold text-[var(--ink)]">
                {editingOffer ? "Edit Offer" : "Create Offer"}
              </h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, title: e.target.value })
                    }
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Type
                  </label>
                  <select
                    value={offerForm.type}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, type: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="DISCOUNT">Discount</option>
                    <option value="PREPAID_CERTIFICATE">
                      Prepaid Certificate
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Offer Image
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleOfferImageUpload(e.target.files?.[0])
                    }
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {uploadingImage && (
                    <span className="text-xs text-slate-500">Uploading...</span>
                  )}
                </div>
                {offerForm.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100">
                    <AppImage
                      src={offerForm.imageUrl}
                      alt="Offer preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={offerForm.discountValue}
                    onChange={(e) =>
                      setOfferForm({
                        ...offerForm,
                        discountValue: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Min Spend
                  </label>
                  <input
                    type="number"
                    value={offerForm.minSpend}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, minSpend: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={offerForm.expiryDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, expiryDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-5 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[var(--accent)] text-white font-semibold shadow-md hover:bg-[#163c6b]"
                >
                  {editingOffer ? "Save Changes" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Certificates section — Purchase button NOW has onClick ─────── */}
      {certificates.length > 0 && (
        <div className="py-16 bg-white/70 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="dcc-title text-3xl font-bold text-[var(--ink)] mb-8">
              Available Certificates
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all"
                >
                  <h3 className="dcc-title text-xl font-semibold text-[var(--ink)] mb-4">
                    {cert.offer?.title || "Certificate"}
                  </h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Face Value</span>
                      <span className="font-bold text-slate-900">
                        ${cert.faceValue}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Member Price</span>
                      <span className="font-bold text-[var(--accent)]">
                        ${cert.memberPrice}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-900">
                        You Save
                      </span>
                      <span className="font-bold text-emerald-600">
                        $
                        {(
                          (cert.faceValue || 0) - (cert.memberPrice || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {cert.expiryDate && (
                    <p className="text-xs text-slate-400 mb-3">
                      Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mb-4">
                    Status: {cert.status || "AVAILABLE"}
                  </p>
                  {/* ── FIXED: was <button> with no onClick ── */}
                  <button
                    type="button"
                    onClick={() => handlePurchaseClick(cert)}
                    disabled={cert.status !== "AVAILABLE"}
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cert.status === "AVAILABLE" ? "Purchase" : cert.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advertise CTA (unchanged) */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#1c4d8d] text-white rounded-3xl p-12 text-center shadow-2xl">
            <Icon name="MegaphoneIcon" size={64} className="mx-auto mb-6" />
            <h2 className="dcc-title text-4xl font-bold mb-4">
              Want to Boost Your Visibility?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Advertise your business with premium banner placements on our
              high-traffic discount directory.
            </p>
            <Link
              to="/advertise"
              className="px-8 py-4 bg-white text-[#1c4d8d] rounded-full text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Learn About Advertising
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfileContent;
