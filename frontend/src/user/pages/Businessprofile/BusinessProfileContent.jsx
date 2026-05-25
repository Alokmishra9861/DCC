import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import {
  businessAPI,
  offerAPI,
  getUser,
  uploadAPI,
} from "../../../services/api";
import { redirectToStripeCheckout } from "../../../services/stripeService";

// ─── Custom Responsive SVG Vector Map (Cayman Islands Vibe) ───────────────────
const PremiumMockMap = ({ address }) => {
  return (
    <div className="relative w-full h-[220px] md:h-[260px] rounded-3xl overflow-hidden bg-[#E2E8F0] border border-slate-100 shadow-inner flex items-center justify-center group select-none">
      {/* Premium Island Map Art Overlay */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {/* Deep ocean background */}
        <rect width="400" height="300" fill="#C5DDFC" />
        
        {/* Soft coastal land representation */}
        <path d="M -20 160 Q 90 90 190 120 T 330 150 T 430 170 L 430 330 L -20 330 Z" fill="#F8FAFC" />
        
        {/* Island green parks */}
        <rect x="30" y="180" width="70" height="50" rx="16" fill="#D2F4D2" opacity="0.9" />
        <rect x="190" y="140" width="110" height="70" rx="20" fill="#D2F4D2" opacity="0.9" />
        <rect x="310" y="190" width="60" height="40" rx="12" fill="#D2F4D2" opacity="0.9" />
        
        {/* Roads network */}
        <path d="M -30 220 C 110 200 210 250 430 230" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
        <path d="M -30 220 C 110 200 210 250 430 230" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />

        <path d="M 130 90 L 170 330" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M 130 90 L 170 330" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />

        <path d="M 290 90 Q 240 210 350 330" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
        <path d="M 290 90 Q 240 210 350 330" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />

        {/* Dynamic Mock buildings */}
        <rect x="160" y="170" width="16" height="16" rx="4" fill="#CBD5E1" />
        <rect x="185" y="180" width="22" height="14" rx="4" fill="#CBD5E1" />
        <rect x="110" y="200" width="20" height="20" rx="4" fill="#CBD5E1" />
        <rect x="270" y="220" width="26" height="16" rx="4" fill="#CBD5E1" />

        {/* Bouncing Marker Drop Pin */}
        <g transform="translate(200, 190)">
          {/* Radar circle effect */}
          <circle cx="0" cy="0" r="14" fill="#1C4D8D" opacity="0.3">
            <animate attributeName="r" values="8;20;8" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* Main pin icon */}
          <path d="M 0 -24 C -6 -24 -10 -20 -10 -14 C -10 -5 0 8 0 8 C 0 8 10 -5 10 -14 C 10 -20 6 -24 0 -24 Z" fill="#1C4D8D" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="0" cy="-14" r="4" fill="#FFFFFF" />
        </g>
      </svg>
      {/* Address overlay label */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-100/40 text-xs">
        <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Icon name="MapPinIcon" size={14} className="text-[#1C4D8D]" />
          Verified Directory Location
        </p>
        <p className="text-slate-500 font-medium truncate mt-0.5">{address}</p>
      </div>
    </div>
  );
};

// ─── Purchase Confirmation Modal ──────────────────────────────────────────────
const PurchaseModal = ({ cert, onConfirm, onClose, loading, error }) => {
  if (!cert) return null;
  const isPrepaid = cert.offer?.type === "PREPAID_CERTIFICATE" || !cert.offer?.type;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Color stripe banner */}
        <div className={`px-8 pt-8 pb-6 text-white relative ${isPrepaid ? "bg-gradient-to-r from-[#1C4D8D] to-[#2563eb]" : "bg-gradient-to-r from-emerald-600 to-teal-500"}`}>
          {!loading && (
            <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
              <Icon name="XMarkIcon" size={16} className="text-white" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
              <Icon name="TicketIcon" size={22} className={isPrepaid ? "text-[#1C4D8D]" : "text-emerald-600"} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {isPrepaid ? "Prepaid Gift Certificate" : "Value-Added Certificate"}
              </p>
              <p className="font-extrabold text-lg leading-tight mt-0.5">
                {cert.offer?.title || "Certificate"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal content body */}
        <div className="px-8 py-6">
          <div className="bg-slate-50 rounded-2xl p-5 mb-5 border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Summary</p>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-500 font-medium">Face Value</span>
              <span className="font-bold text-slate-700">${cert.faceValue}</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-slate-500 font-medium">Member Special Price</span>
              <span className="font-extrabold text-[#1C4D8D] text-base">${cert.memberPrice}</span>
            </div>
            <div className="border-t border-slate-200/60 pt-3 mt-3 flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700">Total Savings</span>
              <span className="font-black text-emerald-600 text-base">
                ${(cert.faceValue - cert.memberPrice).toFixed(2)}{" "}
                <span className="text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full ml-1">
                  ({Math.round(((cert.faceValue - cert.memberPrice) / cert.faceValue) * 100)}% Off)
                </span>
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">What happens next</p>
            <ul className="space-y-2.5">
              {(isPrepaid
                ? [
                    "You'll receive a unique redemption code instantly",
                    "Redeem full face-value ($" + cert.faceValue + ") inside store",
                    "Track transactions live in your Member Dashboard",
                  ]
                : [
                    "Your certificate activates immediately",
                    "Present the code at checkout for verified savings",
                    "Single-use only, backed by DCC safety guidelines",
                  ]
              ).map((text, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                  <Icon name="CheckCircleIcon" size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <p className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center animate-shake">
              {error}
            </p>
          )}

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed ${
              isPrepaid ? "bg-[#1C4D8D] hover:bg-blue-800" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Securing checkout...</span>
              </>
            ) : (
              <>
                <Icon name="CreditCardIcon" size={18} />
                <span>Pay ${cert.memberPrice} Securely</span>
              </>
            )}
          </button>
          {!loading && (
            <button onClick={onClose} className="w-full mt-3 py-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors">
              Cancel Purchase
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Discount Details Modal ──────────────────────────────────────────────────────
const DiscountDetailModal = ({ discount, onClose, businessName }) => {
  if (!discount) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Banner with solid background or image */}
        <div className="relative h-44 bg-gradient-to-br from-[#1C4D8D] to-indigo-800 flex items-center justify-center p-6 text-white text-center">
          {discount.imageUrl && (
            <div className="absolute inset-0 opacity-25 pointer-events-none">
              <img src={discount.imageUrl} alt="Discount backdrop" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative z-10">
            <span className="bg-[#D4A62A] text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              Exclusive Member Deal
            </span>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-black text-4xl mt-3 leading-none">
              {discount.discountValue ? `${discount.discountValue}% OFF` : "SPECIAL OFFER"}
            </p>
            <p className="text-white/80 font-bold text-xs uppercase tracking-wider mt-1">{businessName}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8">
          <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
            {discount.title}
          </h3>
          
          {discount.description && (
            <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-3">
              {discount.description}
            </p>
          )}

          {/* Terms and Conditions card */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 mt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deal Terms</p>
            <div className="space-y-2 text-xs font-bold text-slate-700">
              <div className="flex justify-between">
                <span>Minimum Spend</span>
                <span className="text-slate-900">${discount.minSpend || "0.00"}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span>Valid Until</span>
                <span className="text-rose-500">
                  {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Redemption Steps */}
          <div className="mt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">How to Redeem</p>
            <ul className="space-y-2 text-[11px] font-bold text-slate-600">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1C4D8D] flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Visit {businessName} in person.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1C4D8D] flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Present your digital DCC Membership Card at checkout.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-50 text-[#1C4D8D] flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>The merchant will verify your active membership and apply the savings.</span>
              </li>
            </ul>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3.5 bg-[#1C4D8D] hover:bg-blue-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-md"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const BusinessProfileContent = () => {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Offer modal state for Owners
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

  const handlePurchaseClick = useCallback(
    (cert) => {
      if (!user) {
        toast.error("Please login to purchase a certificate.");
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
    } catch (err) {
      console.error("Purchase error:", err);
      if (
        err.message?.toLowerCase().includes("membership") ||
        err.message?.toLowerCase().includes("active")
      ) {
        setPurchaseError("An active membership is required. Redirecting to membership subscription...");
        setTimeout(() => navigate("/membership"), 2000);
      } else {
        setPurchaseError(err.message || "Payment processing failed. Please try again.");
      }
      setPurchasing(false);
    }
  }, [selectedCert, navigate]);

  const handleCloseModal = useCallback(() => {
    if (purchasing) return;
    setSelectedCert(null);
    setPurchaseError("");
  }, [purchasing]);

  // Quick Actions triggers
  const handleCall = () => {
    if (business?.phone) {
      window.open(`tel:${business.phone}`);
    } else {
      toast.error("Phone number not listed.");
    }
  };

  const handleDirections = () => {
    if (business?.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ", Cayman Islands")}`, "_blank");
    } else {
      toast.error("Address details not found.");
    }
  };

  const handleWebsite = () => {
    if (business?.website) {
      window.open(business.website, "_blank");
    } else {
      toast.error("Website URL not found.");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: business?.name || "Discount Club Cayman",
        text: `Check out exclusive deals at ${business?.name || "this business"} on Discount Club Cayman!`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!");
    }
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success(`${business?.name || "Business"} added to your favorites!`);
    } else {
      toast.success("Removed from favorites.");
    }
  };

  // Offer administration handlers for owners
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
        toast.success("Offer updated successfully!");
      } else {
        await offerAPI.create(payload);
        toast.success("Offer created successfully!");
      }
      setShowOfferModal(false);
      fetchBusinessData();
    } catch (error) {
      console.error("Offer save failed:", error);
      toast.error(error.message || "Failed to save offer details.");
    }
  };

  const handleOfferImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const data = await uploadAPI.image(file);
      const url = data?.url || data?.secure_url || "";
      setOfferForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOfferDelete = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await offerAPI.delete(offerId);
      toast.success("Offer deleted.");
      fetchBusinessData();
    } catch (error) {
      console.error("Offer delete failed:", error);
      toast.error("Failed to delete offer.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-semibold text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <Icon name="BuildingStorefrontIcon" size={32} />
          </div>
          <h2 className="font-extrabold text-2xl text-slate-800 mb-2">Business Profile Missing</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">
            The business page you are trying to view does not exist or has been disabled.
          </p>
          <Link
            to="/discounts"
            className="w-full py-3.5 bg-[#1C4D8D] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-md"
          >
            <Icon name="ArrowLeftIcon" size={16} />
            <span>Return to Discounts</span>
          </Link>
        </div>
      </div>
    );
  }

  // Gallery slider fallback assets
  const galleryImages = business.imageUrls && business.imageUrls.length > 0
    ? business.imageUrls
    : [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800",
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800"
      ];

  // Dynamic Cover Image Banner selection: prioritize custom banner, fallback to first gallery image, then beautiful scenery fallback
  const coverImage = business.coverBannerUrl || (business.imageUrls && business.imageUrls[0]) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800";

  const categoryLabel = business.category?.name || business.category?.slug || business.category || "Local Favorite";
  const categorySlug = business.category?.slug || (typeof business.category === "string" ? business.category.toLowerCase().replace(/\s+/g, "-") : "all");

  // Helper render for Quick Action row (re-usable on both Desktop Sidebar and Mobile Stream)
  const renderActionsPanel = () => (
    <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-4 grid grid-cols-5 gap-1.5 text-center">
      <button
        onClick={handleCall}
        className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600 hover:text-[#1C4D8D]"
      >
        <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-[#1C4D8D] bg-blue-50/20">
          <Icon name="PhoneIcon" size={18} />
        </div>
        <span className="text-[10px] font-extrabold tracking-wide uppercase">Call</span>
      </button>
      
      <button
        onClick={handleDirections}
        className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600 hover:text-[#1C4D8D]"
      >
        <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-[#1C4D8D] bg-blue-50/20">
          <Icon name="MapPinIcon" size={18} />
        </div>
        <span className="text-[10px] font-extrabold tracking-wide uppercase">Directions</span>
      </button>
      
      <button
        onClick={handleWebsite}
        className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600 hover:text-[#1C4D8D]"
      >
        <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-[#1C4D8D] bg-blue-50/20">
          <Icon name="GlobeAltIcon" size={18} />
        </div>
        <span className="text-[10px] font-extrabold tracking-wide uppercase">Website</span>
      </button>

      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600 hover:text-[#1C4D8D]"
      >
        <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-[#1C4D8D] bg-blue-50/20">
          <Icon name="ShareIcon" size={18} />
        </div>
        <span className="text-[10px] font-extrabold tracking-wide uppercase">Share</span>
      </button>

      <button
        onClick={handleSaveToggle}
        className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-slate-600 hover:text-[#1C4D8D]"
      >
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
          isSaved 
            ? "bg-amber-500/10 border-amber-300 text-amber-500 animate-bounce-short" 
            : "border-slate-100 text-slate-600 bg-blue-50/20"
        }`}>
          <Icon name="BookmarkIcon" size={18} className={isSaved ? "fill-amber-500" : ""} />
        </div>
        <span className="text-[10px] font-extrabold tracking-wide uppercase">
          {isSaved ? "Saved" : "Save"}
        </span>
      </button>
    </div>
  );

  return (
    <div
      className="min-h-screen text-slate-900 bg-[#F8FAFC]"
      style={{
        fontFamily: '"Outfit", "Space Grotesk", system-ui, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-heading { font-family: 'Space Grotesk', sans-serif; }
        .animate-bounce-short {
          animation: bounce-short 0.4s ease-out;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* ── Outer wrapper targeting premium screen widths ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-24">
        
        {/* ── 1. Responsive Grid System: Stacks perfectly on mobile, forms 2-column layout on Desktop ── */}
        <div className="grid lg:grid-cols-[1.8fr_1.2fr] gap-8 items-start">
          
          {/* ────────────────── LEFT COLUMN: Core Content ────────────────── */}
          <div className="space-y-6">
            
            {/* ── Profile Hero Header Card (Fades dark-theme backdrop) ── */}
            <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950 h-56 md:h-64 shadow-lg border border-slate-900/10 transition-all duration-300">
              {/* Fully visible background banner from database */}
              {coverImage && (
                <div className="absolute inset-0 pointer-events-none">
                  <AppImage
                    src={coverImage}
                    alt="Banner cover background"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {/* Premium dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
              
              {/* Alignment context for logo + profile details */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-4 md:gap-5">
                {/* Overlapping Business Logo box */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-3xl bg-white border-[3px] border-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 translate-y-1">
                  {business.logoUrl ? (
                    <AppImage
                      src={business.logoUrl}
                      alt={business.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <Icon name="BuildingStorefrontIcon" size={32} className="text-slate-400" />
                  )}
                </div>

                {/* Profile summaries */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-lg sm:text-xl md:text-3xl font-black text-white leading-tight">
                      {business.name}
                    </h1>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-[#3B82F6] rounded-full shadow shrink-0">
                      <Icon name="CheckIcon" size={12} className="text-white" variant="solid" />
                    </span>
                  </div>
                  
                  {/* Category labels and links */}
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-white/95 text-[11px] md:text-sm font-semibold">
                    <span>{business.district || "Cayman Islands"}</span>
                    <span className="opacity-50">•</span>
                    <Link
                      to={`/categoriespage/${categorySlug}`}
                      className="text-[#D4A62A] hover:text-[#f3b52b] underline transition-colors decoration-wavy decoration-1 underline-offset-4"
                    >
                      {categoryLabel}
                    </Link>
                  </div>

                  {/* Ratings and dynamic statuses */}
                  <div className="flex items-center gap-3.5 mt-1.5 text-white/80 text-[11px] md:text-sm font-semibold flex-wrap">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Icon name="StarIcon" size={14} className="fill-amber-400 text-amber-400 shrink-0" variant="solid" />
                      <span>4.7 (320)</span>
                    </span>
                    <span className="opacity-30">|</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Icon name="PaperAirplaneIcon" size={13} className="rotate-45 shrink-0" />
                      <span>0.4 km</span>
                    </span>
                    <span className="opacity-30">|</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span>Open Today</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. MOBILE ACTIONS ROW: Only visible on small viewports ── */}
            <div className="lg:hidden">
              {renderActionsPanel()}
            </div>

            {/* ── 3. Exclusive Discounts Section ── */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Exclusive Discounts
                </h2>
                {discounts.length > 0 && (
                  <span className="text-xs font-extrabold text-[#1C4D8D] hover:underline cursor-pointer transition-all">
                    View All ({discounts.length})
                  </span>
                )}
              </div>

              {discounts.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Icon name="TagIcon" size={24} />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">No active discounts available right now.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {discounts.map((discount) => (
                    <div
                      key={discount.id}
                      onClick={() => setSelectedDiscount(discount)}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group cursor-pointer"
                    >
                      {/* Cover visual banner */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 shrink-0">
                        {discount.imageUrl ? (
                          <AppImage
                            src={discount.imageUrl}
                            alt={discount.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C4D8D]/10 to-blue-500/10 text-[#1C4D8D]">
                            <Icon name="SparklesIcon" size={32} />
                          </div>
                        )}
                        {/* Gold member percent pill */}
                        <div className="absolute top-3 left-3 bg-[#1C4D8D] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                          {discount.discountValue ? `${discount.discountValue}% OFF` : "MEMBER VALUE"}
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-[#1C4D8D] transition-colors">
                            {discount.title}
                          </h3>
                          {discount.description && (
                            <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-2 line-clamp-2">
                              {discount.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 mt-4">
                          <div className="text-[10px] font-black text-rose-500 flex items-center gap-1">
                            <Icon name="CalendarIcon" size={13} className="shrink-0" />
                            <span>EXPIRES: {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {isOwner && (
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => openEditOffer(discount)}
                                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all"
                                  title="Edit"
                                >
                                  <Icon name="PencilIcon" size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOfferDelete(discount.id)}
                                  className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                                  title="Delete"
                                >
                                  <Icon name="TrashIcon" size={13} />
                                </button>
                              </div>
                            )}
                            <span className="w-7 h-7 rounded-full bg-blue-50/50 flex items-center justify-center text-[#1C4D8D] shrink-0 group-hover:bg-[#1C4D8D] group-hover:text-white transition-all">
                              <Icon name="ChevronRightIcon" size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── 4. Prepaid Gift Certificates Section ── */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Certificates Available
                </h2>
                {certificates.length > 0 && (
                  <span className="text-xs font-extrabold text-[#1C4D8D] hover:underline cursor-pointer transition-all">
                    View All ({certificates.length})
                  </span>
                )}
              </div>

              {certificates.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Icon name="TicketIcon" size={24} />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">No available certificates right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => {
                    const face = cert.faceValue || 0;
                    const price = cert.memberPrice || 0;
                    const savings = face - price;
                    const pct = face > 0 ? Math.round((savings / face) * 100) : 0;
                    
                    return (
                      <div
                        key={cert.id}
                        className="relative bg-white rounded-3xl p-5 border border-slate-100/80 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden group"
                      >
                        {/* Physical ticket punch decorative marks */}
                        <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#F8FAFC] border-r border-slate-100 rounded-r-full" />
                        <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#F8FAFC] border-l border-slate-100 rounded-l-full" />

                        {/* Gift box ticket left icon block */}
                        <div className="w-12 h-12 bg-blue-50/70 border border-blue-100/40 rounded-2xl flex items-center justify-center text-[#1C4D8D] shrink-0 mx-auto sm:mx-0">
                          <Icon name="GiftIcon" size={20} className="group-hover:scale-105 transition-all duration-300" />
                        </div>

                        {/* Description block */}
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight group-hover:text-[#1C4D8D] transition-colors">
                            {cert.offer?.title || `Prepaid $${face} Gift Certificate`}
                          </h4>
                          <p className="text-xs font-semibold text-slate-500 mt-1 leading-normal">
                            Pay <span className="text-[#1C4D8D] font-extrabold">${price}</span> for a total face value of <span className="text-slate-700 font-extrabold">${face}</span>.
                            {savings > 0 && (
                              <span className="text-emerald-600 font-extrabold ml-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Save ${savings.toFixed(2)} ({pct}% off)
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Instant Buy button */}
                        <div className="shrink-0 flex justify-center sm:pr-2">
                          <button
                            onClick={() => handlePurchaseClick(cert)}
                            className="px-6 py-2.5 bg-[#1C4D8D] hover:bg-blue-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider active:scale-98 transition-all shadow-md group-hover:shadow shadow-blue-500/10"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 5. About Business section ── */}
            <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6 md:p-8">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">
                About {business.name}
              </h2>
              <div className="relative">
                <p className={`text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed ${!expandedAbout ? "line-clamp-3" : ""}`}>
                  {business.description || `${business.name} provides premier experiences, quality products, and unbeatable value-added offerings to members in the Cayman Islands. Explore special deals and verify redemptions easily today.`}
                </p>
                {business.description && business.description.length > 180 && (
                  <button
                    onClick={() => setExpandedAbout(!expandedAbout)}
                    className="mt-3.5 text-xs font-black text-[#1C4D8D] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{expandedAbout ? "Read Less" : "Read More"}</span>
                    <Icon name="ChevronDownIcon" size={14} className={`transition-transform duration-300 ${expandedAbout ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {/* Showcase slide images */}
              <div className="grid grid-cols-3 gap-3.5 mt-6">
                {galleryImages.slice(0, 3).map((url, idx) => (
                  <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-sm group cursor-zoom-in">
                    <AppImage
                      src={url}
                      alt={`Business slide ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-104 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 6. Mobile Only Business Info container ── */}
            <div className="lg:hidden bg-white rounded-3xl border border-slate-100/80 shadow-sm p-6">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5">
                Business Information
              </h2>
              <div className="grid gap-6">
                {/* List detail */}
                <div className="space-y-4 font-semibold text-xs sm:text-sm text-slate-700">
                  {business.phone && (
                    <div className="flex items-start gap-3">
                      <Icon name="PhoneIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                      <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-start gap-3">
                      <Icon name="EnvelopeIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                      <a href={`mailto:${business.email}`} className="hover:underline truncate">{business.email}</a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-start gap-3">
                      <Icon name="GlobeAltIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate text-[#1C4D8D]">{business.website}</a>
                    </div>
                  )}
                  {business.address && (
                    <div className="flex items-start gap-3">
                      <Icon name="MapPinIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                      <span>{business.address}, {business.district || "Cayman Islands"}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Icon name="ClockIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-600 font-extrabold">Open Today</span>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        {business.workingHours || "9:00 AM - 10:00 PM"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Map Vector box */}
                <PremiumMockMap address={business.address || "George Town, Grand Cayman"} />
              </div>

              {/* Giant Full-Width Buy Certificate button */}
              {certificates.length > 0 && (
                <button
                  onClick={() => handlePurchaseClick(certificates[0])}
                  className="w-full mt-6 py-4 bg-[#1C4D8D] hover:bg-blue-800 active:scale-98 transition-all text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  <Icon name="TicketIcon" size={18} />
                  <span>Buy Certificate</span>
                </button>
              )}
            </div>

          </div>

          {/* ────────────────── RIGHT COLUMN: Desktop Sidebar ────────────────── */}
          <div className="hidden lg:block space-y-6">
            
            {/* Desktop Actions Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              {renderActionsPanel()}
            </div>

            {/* Desktop Map and Details Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Location & Details
              </h3>
              
              <div className="space-y-4 font-semibold text-sm text-slate-700">
                {business.phone && (
                  <div className="flex items-start gap-3">
                    <Icon name="PhoneIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                    <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-start gap-3">
                    <Icon name="EnvelopeIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                    <a href={`mailto:${business.email}`} className="hover:underline truncate">{business.email}</a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-start gap-3">
                    <Icon name="GlobeAltIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate text-[#1C4D8D]">{business.website}</a>
                  </div>
                )}
                {business.address && (
                  <div className="flex items-start gap-3">
                    <Icon name="MapPinIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                    <span>{business.address}, {business.district || "Cayman Islands"}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Icon name="ClockIcon" size={18} className="text-[#1C4D8D] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-600 font-extrabold">Open Today</span>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {business.workingHours || "9:00 AM - 10:00 PM"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vector responsive map */}
              <div className="pt-2">
                <PremiumMockMap address={business.address || "George Town, Grand Cayman"} />
              </div>

              {/* Giant Full-Width Buy Certificate button for Desktop */}
              {certificates.length > 0 && (
                <button
                  onClick={() => handlePurchaseClick(certificates[0])}
                  className="w-full mt-4 py-4 bg-[#1C4D8D] hover:bg-blue-800 active:scale-98 transition-all text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  <Icon name="TicketIcon" size={18} />
                  <span>Buy Certificate</span>
                </button>
              )}
            </div>

            {/* Merchant spec panel for owners */}
            {isOwner && (
              <div className="bg-[#111936] text-white rounded-3xl p-6 border border-white/5 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4A62A]">Merchant Tools</p>
                <h4 className="font-extrabold text-white text-base mt-2">Manage Store Offers</h4>
                <p className="text-xs text-slate-300 font-semibold leading-relaxed mt-2">
                  Create high-performance limited discounts to attract local customers directly inside Grand Cayman.
                </p>
                <button
                  type="button"
                  onClick={openCreateOffer}
                  className="w-full mt-4 py-3 bg-[#D4A62A] text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider hover:bg-[#f3b52b] active:scale-98 transition-all"
                >
                  Create New Offer
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ── 8. Bottom Sticky Mobile bar for Checkouts (hidden on desktop) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-md border-t border-slate-100 py-3.5 px-6 shadow-2xl z-40 flex items-center justify-center animate-in slide-in-from-bottom duration-300">
        <div className="max-w-md w-full">
          <button
            onClick={() => {
              if (certificates.length > 0) {
                handlePurchaseClick(certificates[0]);
              } else if (business.website) {
                window.open(business.website, "_blank");
              } else {
                handleDirections();
              }
            }}
            className="w-full py-3.5 bg-[#1C4D8D] hover:bg-blue-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-99 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="TicketIcon" size={18} />
            <span>
              {certificates.length > 0 ? "Buy Gift Certificate" : "Visit Website"}
            </span>
          </button>
        </div>
      </div>

      {/* ── 9. Offer administration CRUD modal for owners ── */}
      {showOfferModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-2xl text-slate-800">
                {editingOffer ? "Edit Offer" : "Create Offer"}
              </h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, title: e.target.value })
                    }
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Type
                  </label>
                  <select
                    value={offerForm.type}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, type: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-semibold text-sm"
                  >
                    <option value="DISCOUNT">Discount</option>
                    <option value="PREPAID_CERTIFICATE">
                      Prepaid Certificate
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-semibold text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Offer Image
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleOfferImageUpload(e.target.files?.[0])
                    }
                    className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                  {uploadingImage && (
                    <span className="text-xs text-slate-500 animate-pulse">Uploading...</span>
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
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Discount Value (%)
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
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Min Spend ($)
                  </label>
                  <input
                    type="number"
                    value={offerForm.minSpend}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, minSpend: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={offerForm.expiryDate}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, expiryDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-semibold text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#1C4D8D] text-white text-xs font-black shadow-md hover:bg-blue-800 transition-colors"
                >
                  {editingOffer ? "Save Changes" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Purchase Modal ── */}
      {selectedCert && (
        <PurchaseModal
          cert={selectedCert}
          onConfirm={handleConfirmPurchase}
          onClose={handleCloseModal}
          loading={purchasing}
          error={purchaseError}
        />
      )}

      {/* ── Discount Details Modal ── */}
      {selectedDiscount && (
        <DiscountDetailModal
          discount={selectedDiscount}
          businessName={business.name}
          onClose={() => setSelectedDiscount(null)}
        />
      )}

    </div>
  );
};

export default BusinessProfileContent;
