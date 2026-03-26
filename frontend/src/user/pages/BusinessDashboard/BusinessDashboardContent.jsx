// Frontend/src/user/pages/Dashboard/BusinessDashboardContent.jsx
import React, { useState, useEffect, useCallback } from "react";
import Icon from "../../components/ui/AppIcon";
import {
  businessAPI,
  offerAPI,
  certificateAPI,
  paymentAPI,
  advertisementAPI,
  getUser,
  uploadAPI,
} from "../../../services/api";
import AnalyticsStatsPanel from "../../components/ui/AnalyticsStatsPanel";

// ─── Premium UI Tokens & Styles ──────────────────────────────────────────────
const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

// ─── Redemption Panel ────────────────────────────────────────────────────────
const RedemptionPanel = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const loadHistory = useCallback(async (page = 1, status = "") => {
    setHistoryLoading(true);
    try {
      const params = { page, limit: 10, ...(status && { status }) };
      const res = await certificateAPI.getRedemptions(params);
      const list = Array.isArray(res) ? res : res?.data || [];
      setHistory(list);
      setHistoryTotal(res?.pagination?.total || list.length);
    } catch (err) {
      console.error("Redemption history fetch failed:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(historyPage, statusFilter);
  }, [historyPage, statusFilter, loadHistory]);

  const handleRedeem = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await certificateAPI.redeemByCode(trimmed);
      setResult({
        success: true,
        message: res.message || "Certificate successfully redeemed!",
        data: res.data,
      });
      setCode("");
      loadHistory(1, statusFilter);
      setHistoryPage(1);
    } catch (err) {
      const msg = err.message || "Redemption failed or code invalid.";
      setResult({ success: false, message: msg, data: null });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(historyTotal / 10);

  return (
    <div className="space-y-12">
      {/* ── Code Entry Area ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm max-w-2xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm border border-emerald-100">
            <Icon name="QrCodeIcon" size={32} />
          </div>
          <h3
            className="text-2xl font-bold text-slate-900 tracking-tight"
            style={HEADING_FONT}
          >
            Redeem Certificate
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Enter the member's unique code (e.g., DISC-XXXX-XXXX-XXXX)
          </p>
        </div>

        <form onSubmit={handleRedeem} className="space-y-5">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setResult(null);
            }}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxLength={19}
            className="w-full text-center px-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono text-2xl md:text-3xl font-bold tracking-[0.2em] text-slate-800 uppercase focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner placeholder:font-sans placeholder:tracking-normal placeholder:text-xl placeholder:font-medium placeholder:text-slate-300"
          />
          <button
            type="submit"
            disabled={loading || code.trim().length < 4}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Code...
              </>
            ) : (
              <>
                <Icon name="CheckBadgeIcon" size={24} />
                Verify & Redeem
              </>
            )}
          </button>
        </form>

        {/* ── Result Card ─────────────────────────────────────────────────── */}
        {result && (
          <div
            className={`mt-8 rounded-2xl border p-6 transition-all animate-in fade-in slide-in-from-top-4 ${
              result.success
                ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50"
                : "border-rose-200 bg-gradient-to-br from-rose-50 to-red-50/50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  result.success
                    ? "bg-emerald-500 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                <Icon
                  name={result.success ? "CheckIcon" : "XMarkIcon"}
                  size={24}
                />
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`font-black text-lg tracking-tight mb-1 ${result.success ? "text-emerald-900" : "text-rose-900"}`}
                >
                  {result.message}
                </p>

                {result.success && result.data && (
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Business", result.data.businessName],
                      [
                        "Type",
                        result.data.type === "PREPAID_CERTIFICATE"
                          ? "Prepaid Gift"
                          : "Value-Added",
                      ],
                      [
                        "Face Value",
                        result.data.faceValue
                          ? `$${result.data.faceValue}`
                          : "—",
                      ],
                      [
                        "Discount",
                        result.data.discountValue
                          ? `$${result.data.discountValue} off`
                          : "—",
                      ],
                      ["Member", result.data.memberEmail || "—"],
                      [
                        "Redeemed",
                        result.data.redeemedAt
                          ? new Date(result.data.redeemedAt).toLocaleString()
                          : "—",
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-sm"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 mb-0.5">
                          {label}
                        </p>
                        <p className="font-bold text-emerald-950 truncate">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Redemption History ────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3
              className="text-2xl font-bold text-slate-900 tracking-tight"
              style={HEADING_FONT}
            >
              Redemption History
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Review all scanned and purchased certificates.
              {historyTotal > 0 && (
                <span className="ml-1 text-emerald-600 font-bold">
                  ({historyTotal} total)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setHistoryPage(1);
              }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 shadow-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PURCHASED">Purchased</option>
              <option value="REDEEMED">Redeemed</option>
            </select>
            <button
              onClick={() => loadHistory(historyPage, statusFilter)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:text-[#1C4D8D] hover:border-[#1C4D8D] transition-colors shadow-sm"
              title="Refresh Data"
            >
              <Icon name="ArrowPathIcon" size={18} />
            </button>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Loading history...
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Icon name="TicketIcon" size={28} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-700">
              No redemptions found
            </p>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Certificates processed will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {[
                      "Code",
                      "Type",
                      "Value",
                      "Member",
                      "Purchased",
                      "Redeemed",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="py-4 px-5 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {history.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-slate-900 tracking-wide">
                        {row.uniqueCode || "—"}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            row.type === "PREPAID_CERTIFICATE"
                              ? "bg-blue-50 border-blue-100 text-[#1C4D8D]"
                              : "bg-emerald-50 border-emerald-100 text-emerald-700"
                          }`}
                        >
                          {row.type === "PREPAID_CERTIFICATE"
                            ? "Prepaid"
                            : "Value-Added"}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900">
                        ${row.faceValue ?? "—"}
                      </td>
                      <td className="py-4 px-5 text-sm font-medium text-slate-600 max-w-[150px] truncate">
                        {row.memberEmail || "—"}
                      </td>
                      <td className="py-4 px-5 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {row.purchasedAt
                          ? new Date(row.purchasedAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="py-4 px-5 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {row.redeemedAt
                          ? new Date(row.redeemedAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                            row.status === "REDEEMED"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                              : row.status === "PURCHASED"
                                ? "bg-blue-50 text-[#1C4D8D] ring-1 ring-blue-600/10"
                                : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${row.status === "REDEEMED" ? "bg-emerald-500" : row.status === "PURCHASED" ? "bg-blue-500" : "bg-slate-400"}`}
                          />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page {historyPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage((p) => p - 1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Prev
                  </button>
                  <button
                    disabled={historyPage === totalPages}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1C4D8D] hover:border-[#1C4D8D]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
  );
};

// ─── Main BusinessDashboardContent ───────────────────────────────────────────
const BusinessDashboardContent = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState("top");
  const [selectedDuration, setSelectedDuration] = useState("monthly");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerLinkUrl, setBannerLinkUrl] = useState("");
  const [paymentStep, setPaymentStep] = useState("details");
  const [myBanners, setMyBanners] = useState([]);
  const [businessData, setBusinessData] = useState(null);
  const [activeOffers, setActiveOffers] = useState([]);
  const [activeCertificates, setActiveCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [uploadingOfferImage, setUploadingOfferImage] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    type: "DISCOUNT",
    discountValue: "",
    minSpend: "",
    expiryDate: "",
  });
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateForm, setCertificateForm] = useState({
    offerId: "",
    faceValue: "",
    memberPrice: "",
    expiryDate: "",
  });
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [bannerPaymentLoading, setBannerPaymentLoading] = useState(false);
  const user = getUser();

  const loadOffers = (businessId) =>
    offerAPI
      .getByBusiness(businessId)
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.offers || data?.items || [];
        setActiveOffers(list);
      })
      .catch(() => {});

  const loadCertificates = () =>
    certificateAPI
      .getByBusiness()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.certificates || data?.items || [];
        setActiveCertificates(list);
      })
      .catch(() => {});

  useEffect(() => {
    loadCertificates();
    Promise.allSettled([businessAPI.getMyProfile()])
      .then(([profileRes]) => {
        if (profileRes.status === "fulfilled") {
          const p = profileRes.value;
          console.log("Business Profile Data:", p);
          console.log("Performance Overview:", p.performanceOverview);
          setBusinessData({
            id: p.id || p._id,
            name: p.name || p.businessName || user?.email,
            category: p.category?.name || p.category || "",
            profileViews: p.profileViews ?? 0,
            offerSaves: p.offerSaves ?? 0,
            certificateRedemptions: p.certificateRedemptions ?? 0,
            engagementRate: p.engagementRate ?? 0,
            performanceOverview: p.performanceOverview || [],
            _id: p._id || p.id,
          });
          if (p._id || p.id) loadOffers(p._id || p.id);
        }
      })
      .catch((err) => {
        console.error("Failed to load business profile:", err);
      })
      .finally(() => setLoading(false));
  }, []);

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
    if (!businessData?._id && !businessData?.id) return;
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
      loadOffers(businessData?._id || businessData?.id);
    } catch (error) {
      alert(error.message || "Failed to save offer.");
    }
  };

  const handleOfferImageUpload = async (file) => {
    if (!file) return;
    setUploadingOfferImage(true);
    try {
      const data = await uploadAPI.image(file);
      setOfferForm((prev) => ({
        ...prev,
        imageUrl: data?.url || data?.secure_url || "",
      }));
    } catch (error) {
      alert(error.message || "Failed to upload image.");
    } finally {
      setUploadingOfferImage(false);
    }
  };

  const handleOfferDelete = async (offerId) => {
    try {
      await offerAPI.delete(offerId);
      if (businessData?._id || businessData?.id)
        loadOffers(businessData?._id || businessData?.id);
    } catch (error) {
      alert(error.message || "Failed to delete offer.");
    }
  };

  const handleOfferToggle = async (offer) => {
    try {
      await offerAPI.update(offer.id, { isActive: !offer.isActive });
      if (businessData?._id || businessData?.id)
        loadOffers(businessData?._id || businessData?.id);
    } catch (error) {
      alert(error.message || "Failed to update offer status.");
    }
  };

  const openCreateCertificate = () => {
    setCertificateForm({
      offerId: prepaidOffers[0]?.id || "",
      faceValue: "",
      memberPrice: "",
      expiryDate: "",
    });
    setShowCertificateModal(true);
  };

  const handleCertificateSubmit = async (e) => {
    e.preventDefault();
    try {
      await certificateAPI.create({
        offerId: certificateForm.offerId,
        faceValue: certificateForm.faceValue,
        memberPrice: certificateForm.memberPrice,
        expiryDate: certificateForm.expiryDate || null,
      });
      setShowCertificateModal(false);
      loadCertificates();
    } catch (error) {
      alert(error.message || "Failed to create certificate.");
    }
  };

  // ── Banner Pricing ──────────────────────────────────────────────────────
  const BANNER_PRICING = {
    top: { daily: 50, weekly: 250, monthly: 800 },
    middle: { daily: 40, weekly: 200, monthly: 600 },
    bottom: { daily: 30, weekly: 150, monthly: 450 },
  };

  const calculateBannerPrice = () => {
    const position = selectedPosition || "top";
    const duration = selectedDuration || "monthly";
    return BANNER_PRICING[position]?.[duration] || 0;
  };

  const bannerPrice = calculateBannerPrice();

  const handleBannerImageUpload = async (file) => {
    if (!file) return;
    setUploadingBannerImage(true);
    try {
      const res = await uploadAPI.image(file);
      setBannerImageUrl(res.url || res.secure_url);
    } catch (error) {
      alert("Image upload failed: " + (error.message || "unknown error"));
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return alert("Banner title is required");
    if (!bannerImageUrl) return alert("Banner image is required");

    if (paymentStep === "details") {
      setPaymentStep("payment");
    } else {
      setBannerPaymentLoading(true);
      try {
        const checkoutRes = await paymentAPI.createStripeCheckout({
          type: "banner",
          items: [
            {
              name: `${selectedPosition} Banner - ${selectedDuration}`,
              price: bannerPrice * 100,
              quantity: 1,
            },
          ],
          metadata: {
            bannerTitle,
            bannerImageUrl,
            bannerLinkUrl,
            bannerPosition: selectedPosition,
            bannerDuration: selectedDuration,
          },
        });

        if (checkoutRes.checkoutUrl) {
          window.location.href = checkoutRes.checkoutUrl;
        } else {
          alert("Failed to create payment session");
        }
      } catch (error) {
        alert(error.message || "Payment initialization failed");
      } finally {
        setBannerPaymentLoading(false);
      }
    }
  };

  const resetBannerForm = () => {
    setBannerTitle("");
    setBannerImageUrl("");
    setBannerLinkUrl("");
    setSelectedPosition("top");
    setSelectedDuration("monthly");
    setPaymentStep("details");
  };

  const prepaidOffers = activeOffers.filter(
    (o) =>
      o.type === "PREPAID_CERTIFICATE" || o.type === "VALUE_ADDED_CERTIFICATE",
  );

  const fallbackChartData = [
    { month: "Aug", views: 0, saves: 0, redemptions: 0 },
    { month: "Sep", views: 0, saves: 0, redemptions: 0 },
    { month: "Oct", views: 0, saves: 0, redemptions: 0 },
    { month: "Nov", views: 0, saves: 0, redemptions: 0 },
    { month: "Dec", views: 0, saves: 0, redemptions: 0 },
  ];

  const chartData =
    businessData?.performanceOverview?.length > 0
      ? businessData.performanceOverview
      : fallbackChartData;

  const maxViews = Math.max(...chartData.map((d) => d.views || 0), 1);
  const maxSaves = Math.max(...chartData.map((d) => d.saves || 0), 1);
  const maxRedemptions = Math.max(
    ...chartData.map((d) => d.redemptions || 0),
    1,
  );

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "offers", label: "Offers" },
    { id: "certificates", label: "Certificates" },
    { id: "redeem", label: "Redeem" },
    { id: "banners", label: "Banners" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#1C4D8D]/20">
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md z-50 gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin shadow-sm" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Loading Workspace...
          </p>
        </div>
      )}

      {/* Aesthetic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-60">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50/40 to-teal-50/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Hero */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0A1628] via-[#1C4D8D] to-[#4988C4] p-10 md:p-14 shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex-1">
                <p className="text-blue-300/90 text-xs font-black uppercase tracking-[0.3em] mb-3">
                  Business Dashboard
                </p>
                <h1
                  className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-md"
                  style={HEADING_FONT}
                >
                  Welcome,{" "}
                  <span className="text-blue-200">{businessData?.name}</span>
                </h1>
                <p className="text-blue-100/90 text-lg font-medium">
                  Your offers reached{" "}
                  <span className="text-white font-black">
                    {businessData?.profileViews}
                  </span>{" "}
                  members this month.
                </p>
              </div>
              {businessData?.id && (
                <div className="flex flex-col items-start md:items-end gap-3">
                  <p className="text-blue-200 text-xs font-black uppercase tracking-widest">
                    Business ID
                  </p>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                    <code className="text-white font-mono font-bold text-base tracking-wider">
                      {businessData.id.substring(0, 8).toUpperCase()}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(businessData.id);
                        alert("Business ID copied to clipboard!");
                      }}
                      className="text-blue-200 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                      title="Copy Business ID"
                    >
                      <Icon name="DocumentDuplicateIcon" size={18} />
                    </button>
                  </div>
                  <p className="text-blue-300 text-xs font-medium max-w-xs">
                    Show this ID to associations for easy linking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnalyticsStatsPanel title="Business Analytics" />

        {/* Quick stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {[
            {
              label: "Profile Views",
              value: businessData?.profileViews,
              icon: "EyeIcon",
              color: "bg-blue-50/80",
              iconColor: "text-blue-600",
              border: "border-blue-100",
            },
            {
              label: "Offer Saves",
              value: businessData?.offerSaves,
              icon: "BookmarkIcon",
              color: "bg-indigo-50/80",
              iconColor: "text-indigo-600",
              border: "border-indigo-100",
            },
            {
              label: "Redemptions",
              value: businessData?.certificateRedemptions,
              icon: "CheckCircleIcon",
              color: "bg-emerald-50/80",
              iconColor: "text-emerald-600",
              border: "border-emerald-100",
            },
            {
              label: "Engagement",
              value: `${Number.isFinite(businessData?.engagementRate) ? businessData.engagementRate : 0}%`,
              icon: "ChartBarIcon",
              color: "bg-amber-50/80",
              iconColor: "text-amber-600",
              border: "border-amber-100",
            },
          ].map(({ label, value, icon, color, iconColor, border }) => (
            <div
              key={label}
              className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 border ${border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                  {label}
                </p>
                <div className={`p-2.5 ${color} rounded-xl shadow-sm`}>
                  <Icon name={icon} size={20} className={iconColor} />
                </div>
              </div>
              <p
                className="text-4xl font-bold text-slate-900 tracking-tight"
                style={HEADING_FONT}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Segmented Control Tabs */}
        <div className="mb-10">
          <div className="flex gap-1.5 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm overflow-x-auto w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                {tab.id === "redeem" && (
                  <Icon
                    name="CheckBadgeIcon"
                    size={18}
                    className={
                      activeTab === tab.id
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }
                  />
                )}
                {tab.id !== "redeem" && tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="mb-20">
          {/* ── Overview tab ───────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                <h3
                  className="text-2xl font-bold text-slate-900 tracking-tight mb-8"
                  style={HEADING_FONT}
                >
                  Performance Overview
                </h3>
                <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-slate-100">
                  <div className="h-72 flex items-end justify-between gap-2 sm:gap-4 md:gap-8">
                    {chartData.map((data, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center gap-4 group/chart"
                      >
                        <div className="w-full flex items-end justify-center gap-1.5 h-56 relative">
                          {[
                            {
                              val: data.views,
                              max: maxViews,
                              color: "bg-blue-600",
                              label: data.views,
                            },
                            {
                              val: data.saves,
                              max: maxSaves,
                              color: "bg-indigo-400",
                              label: data.saves,
                            },
                            {
                              val: data.redemptions,
                              max: maxRedemptions,
                              color: "bg-emerald-400",
                              label: data.redemptions,
                            },
                          ].map(({ val, max, color, label }, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center flex-1 relative group/bar"
                            >
                              {/* Custom tooltip on hover */}
                              <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                                {label}
                              </div>
                              <div
                                className={`w-full ${color} rounded-t-lg transition-all duration-700 ease-out`}
                                style={{
                                  height: `${(val / max) * 100}%`,
                                  minHeight: "8px",
                                }}
                              >
                                <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent rounded-t-lg" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover/chart:text-slate-700 transition-colors">
                          {data.month}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-6 border-t border-slate-200/80">
                    {[
                      ["bg-blue-600", "Profile Views"],
                      ["bg-indigo-400", "Offer Saves"],
                      ["bg-emerald-400", "Cert Redemptions"],
                    ].map(([bg, label]) => (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 ${bg} rounded-full shadow-sm`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3
                  className="text-2xl font-bold text-slate-900 tracking-tight mb-6"
                  style={HEADING_FONT}
                >
                  Quick Actions
                </h3>
                <div className="grid md:grid-cols-3 gap-5">
                  <button
                    onClick={() => {
                      setActiveTab("offers");
                      openCreateOffer();
                    }}
                    className="flex flex-col gap-4 p-6 bg-white border border-slate-200/60 rounded-[2rem] hover:border-blue-400 hover:shadow-xl transition-all group text-left"
                  >
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon name="PlusIcon" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                        Create New Offer
                      </p>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        Add a discount or deal
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("certificates");
                      openCreateCertificate();
                    }}
                    className="flex flex-col gap-4 p-6 bg-white border border-slate-200/60 rounded-[2rem] hover:border-purple-400 hover:shadow-xl transition-all group text-left"
                  >
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon name="TicketIcon" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900 group-hover:text-purple-600 transition-colors">
                        Create Certificate
                      </p>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        Add a pre-paid voucher
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("redeem")}
                    className="flex flex-col gap-4 p-6 bg-white border border-slate-200/60 rounded-[2rem] hover:border-emerald-400 hover:shadow-xl transition-all group text-left"
                  >
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon name="CheckBadgeIcon" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                        Redeem Certificate
                      </p>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        Scan member code
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Offers tab ───────────────────────────────────────────── */}
          {activeTab === "offers" && (
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                  style={HEADING_FONT}
                >
                  Active Offers
                </h3>
                <button
                  onClick={openCreateOffer}
                  className="px-6 py-3 bg-gradient-to-r from-[#1C4D8D] to-[#153a6b] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="PlusIcon" size={18} />
                  Create Offer
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      {[
                        "Offer Title",
                        "Type",
                        "Expiry",
                        "Views",
                        "Saves",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {activeOffers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-slate-500 font-medium"
                        >
                          No offers created yet.
                        </td>
                      </tr>
                    ) : (
                      activeOffers.map((offer) => (
                        <tr
                          key={offer.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {offer.title}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 bg-blue-50 text-[#1C4D8D] border border-blue-100 rounded-md text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                              {offer.type === "DISCOUNT"
                                ? `${offer.discountValue || 0}% off`
                                : offer.type === "VALUE_ADDED_CERTIFICATE"
                                  ? "Value Added"
                                  : "Prepaid"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500 whitespace-nowrap">
                            {offer.expiryDate
                              ? new Date(offer.expiryDate).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "No expiry"}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-slate-700">
                            {offer.views || 0}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-slate-700">
                            {offer.saves || 0}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditOffer(offer)}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Icon name="PencilIcon" size={16} />
                              </button>
                              <button
                                onClick={() => handleOfferToggle(offer)}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 rounded-lg transition-colors"
                                title={offer.isActive ? "Pause" : "Activate"}
                              >
                                <Icon
                                  name={
                                    offer.isActive ? "PauseIcon" : "PlayIcon"
                                  }
                                  size={16}
                                />
                              </button>
                              <button
                                onClick={() => handleOfferDelete(offer.id)}
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Icon name="TrashIcon" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Certificates tab ───────────────────────────────────────────── */}
          {activeTab === "certificates" && (
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                  style={HEADING_FONT}
                >
                  Active Certificates
                </h3>
                <button
                  onClick={openCreateCertificate}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="TicketIcon" size={18} />
                  Create Certificate
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60">
                    <tr>
                      {[
                        "Certificate Title",
                        "Face Value",
                        "Member Price",
                        "Sold",
                        "Redeemed",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-4 px-6 text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {activeCertificates.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-slate-500 font-medium"
                        >
                          No certificates created yet.
                        </td>
                      </tr>
                    ) : (
                      activeCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {cert.title}
                          </td>
                          <td className="py-4 px-6 text-sm font-black text-slate-700">
                            ${cert.faceValue}
                          </td>
                          <td className="py-4 px-6 text-sm font-black text-emerald-600 bg-emerald-50/50">
                            ${cert.memberPrice}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-slate-700">
                            {cert.sold || 0}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-slate-700">
                            {cert.redeemed || 0}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 opacity-100 sm:opacity-40 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Icon name="PencilIcon" size={16} />
                              </button>
                              <button
                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 rounded-lg transition-colors"
                                title="Pause"
                              >
                                <Icon name="PauseIcon" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Redeem tab ───────────────────────────────────────────── */}
          {activeTab === "redeem" && <RedemptionPanel />}

          {/* ── Banners tab ───────────────────────────────────────────── */}
          {activeTab === "banners" && (
            <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3
                    className="text-2xl font-bold text-slate-900 tracking-tight"
                    style={HEADING_FONT}
                  >
                    Advertising Banners
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Boost your visibility with premium placements.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBannerModal(true);
                    setPaymentStep("details");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Icon name="SparklesIcon" size={18} />
                  Purchase Banner
                </button>
              </div>

              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <Icon name="PhotoIcon" size={28} className="text-slate-300" />
                </div>
                <p className="text-lg font-bold text-slate-700">
                  No active campaigns
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Purchase a banner to feature your business here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Offer Modal ─────────────────────────────────────────────── */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3
                  className="text-2xl font-bold text-slate-900"
                  style={HEADING_FONT}
                >
                  {editingOffer ? "Edit Offer" : "Create New Offer"}
                </h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-8">
                <form onSubmit={handleOfferSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={offerForm.title}
                      onChange={(e) =>
                        setOfferForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      placeholder="e.g., 20% Off All Services"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      Description
                    </label>
                    <textarea
                      value={offerForm.description}
                      onChange={(e) =>
                        setOfferForm((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                      rows={3}
                      placeholder="Describe the details of your offer..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                      Offer Image
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-blue-400 transition-colors relative cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleOfferImageUpload(e.target.files?.[0])
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploadingOfferImage}
                      />
                      {offerForm.imageUrl ? (
                        <div className="relative">
                          <img
                            src={offerForm.imageUrl}
                            alt="preview"
                            className="w-full h-40 object-cover rounded-xl shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                              Click to replace image
                            </span>
                          </div>
                        </div>
                      ) : uploadingOfferImage ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-bold text-slate-500">
                            Uploading...
                          </span>
                        </div>
                      ) : (
                        <div className="py-4 pointer-events-none">
                          <Icon
                            name="PhotoIcon"
                            size={32}
                            className="text-slate-300 mx-auto mb-2"
                          />
                          <p className="text-sm font-bold text-slate-600">
                            Click or drag image to upload
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                        Offer Type
                      </label>
                      <select
                        value={offerForm.type}
                        onChange={(e) =>
                          setOfferForm((p) => ({ ...p, type: e.target.value }))
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="DISCOUNT">Standard Discount</option>
                        <option value="VALUE_ADDED_CERTIFICATE">
                          Value Added Certificate
                        </option>
                        <option value="PREPAID_CERTIFICATE">
                          Prepaid Certificate
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                        Value Amount
                      </label>
                      <div className="relative">
                        {offerForm.type !== "DISCOUNT" && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                            $
                          </span>
                        )}
                        <input
                          type="number"
                          step="0.01"
                          value={offerForm.discountValue}
                          onChange={(e) =>
                            setOfferForm((p) => ({
                              ...p,
                              discountValue: e.target.value,
                            }))
                          }
                          className={`w-full ${offerForm.type !== "DISCOUNT" ? "pl-8" : "px-4"} py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
                          placeholder={
                            offerForm.type === "DISCOUNT"
                              ? "e.g. 15 (for 15%)"
                              : "e.g. 50"
                          }
                        />
                        {offerForm.type === "DISCOUNT" && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                            %
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                        Minimum Spend (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={offerForm.minSpend}
                          onChange={(e) =>
                            setOfferForm((p) => ({
                              ...p,
                              minSpend: e.target.value,
                            }))
                          }
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={offerForm.expiryDate}
                        onChange={(e) =>
                          setOfferForm((p) => ({
                            ...p,
                            expiryDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(false)}
                      className="flex-1 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-blue-800 shadow-md shadow-blue-900/20 transition-all"
                    >
                      {editingOffer ? "Save Changes" : "Create Offer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── Certificate Modal ───────────────────────────────────────────── */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-[2rem] max-w-xl w-full shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3
                  className="text-2xl font-bold text-slate-900"
                  style={HEADING_FONT}
                >
                  Create Certificate
                </h3>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>
              <form
                onSubmit={handleCertificateSubmit}
                className="p-8 space-y-6"
              >
                {prepaidOffers.length === 0 ? (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-medium">
                    <div className="flex items-center gap-2 mb-2 font-bold">
                      <Icon name="ExclamationTriangleIcon" size={20} /> Warning
                    </div>
                    You need to create a PREPAID_CERTIFICATE or
                    VALUE_ADDED_CERTIFICATE offer in the "Offers" tab first
                    before generating certs.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                        Base Offer
                      </label>
                      <select
                        required
                        value={certificateForm.offerId}
                        onChange={(e) =>
                          setCertificateForm((p) => ({
                            ...p,
                            offerId: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                      >
                        <option value="">Select an offer template</option>
                        {prepaidOffers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                          Face Value
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={certificateForm.faceValue}
                            onChange={(e) =>
                              setCertificateForm((p) => ({
                                ...p,
                                faceValue: e.target.value,
                              }))
                            }
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            placeholder="100.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                          Member Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={certificateForm.memberPrice}
                            onChange={(e) =>
                              setCertificateForm((p) => ({
                                ...p,
                                memberPrice: e.target.value,
                              }))
                            }
                            className="w-full pl-8 pr-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl font-black text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="80.00"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={certificateForm.expiryDate}
                        onChange={(e) =>
                          setCertificateForm((p) => ({
                            ...p,
                            expiryDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                      />
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCertificateModal(false)}
                        className="flex-1 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg shadow-purple-900/20 transition-all"
                      >
                        Generate Certificate
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ── Banner Modal ───────────────────────────────────────────── */}
        {showBannerModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3
                  className="text-2xl font-bold text-slate-900"
                  style={HEADING_FONT}
                >
                  {paymentStep === "details"
                    ? "Purchase Advertisement"
                    : "Complete Order"}
                </h3>
                <button
                  onClick={() => {
                    setShowBannerModal(false);
                    resetBannerForm();
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              {paymentStep === "details" ? (
                <div className="overflow-y-auto p-8">
                  <form onSubmit={handleBannerSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                          Campaign Title
                        </label>
                        <input
                          type="text"
                          required
                          value={bannerTitle}
                          onChange={(e) => setBannerTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="e.g., Summer Blowout Sale"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                          Creative Asset
                        </label>
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-indigo-400 transition-colors relative cursor-pointer group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0])
                                handleBannerImageUpload(e.target.files[0]);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={uploadingBannerImage}
                          />
                          {bannerImageUrl ? (
                            <div className="relative">
                              <img
                                src={bannerImageUrl}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-xl shadow-sm"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                                  Replace image
                                </span>
                              </div>
                            </div>
                          ) : uploadingBannerImage ? (
                            <div className="flex flex-col items-center gap-2 py-4">
                              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm font-bold text-slate-500">
                                Uploading asset...
                              </span>
                            </div>
                          ) : (
                            <div className="py-4 pointer-events-none">
                              <Icon
                                name="PhotoIcon"
                                size={32}
                                className="text-slate-300 mx-auto mb-2"
                              />
                              <p className="text-sm font-bold text-slate-600">
                                Upload high-res banner image
                              </p>
                              <p className="text-xs font-medium text-slate-400 mt-1">
                                Recommended size: 1200x300px
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                          Destination URL{" "}
                          <span className="font-normal normal-case tracking-normal">
                            (Optional)
                          </span>
                        </label>
                        <input
                          type="url"
                          value={bannerLinkUrl}
                          onChange={(e) => setBannerLinkUrl(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                          placeholder="https://yourwebsite.com/sale"
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Placements */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                          Placement
                        </label>
                        <div className="space-y-3">
                          {[
                            { id: "top", desc: "Highest visibility" },
                            { id: "middle", desc: "Mid-page scroll" },
                            { id: "bottom", desc: "Footer placement" },
                          ].map((pos) => (
                            <label
                              key={pos.id}
                              className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border-2 transition-all ${selectedPosition === pos.id ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-slate-300"}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPosition === pos.id ? "border-indigo-600" : "border-slate-300"}`}
                              >
                                {selectedPosition === pos.id && (
                                  <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 capitalize text-sm">
                                  {pos.id} Position
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                  {pos.desc}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                          Duration
                        </label>
                        <div className="space-y-3">
                          {["daily", "weekly", "monthly"].map((dur) => (
                            <label
                              key={dur}
                              className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedDuration === dur ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-300"}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedDuration === dur ? "border-slate-900" : "border-slate-300"}`}
                              >
                                {selectedDuration === dur && (
                                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                                )}
                              </div>
                              <p className="font-bold text-slate-900 capitalize text-sm">
                                {dur}
                              </p>
                            </label>
                          ))}
                        </div>

                        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                          <span className="font-bold text-slate-600">
                            Total Price
                          </span>
                          <span className="text-2xl font-black text-indigo-600">
                            ${bannerPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-md"
                    >
                      Review & Checkout
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-8 bg-slate-50/30">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 tracking-tight uppercase text-xs">
                      Order Summary
                    </h4>
                    {bannerImageUrl && (
                      <img
                        src={bannerImageUrl}
                        alt="Creative"
                        className="w-full h-32 object-cover rounded-xl mb-6 shadow-sm border border-slate-100"
                      />
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-500">
                          Campaign
                        </span>
                        <span className="font-bold text-slate-900">
                          {bannerTitle}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-500">
                          Placement
                        </span>
                        <span className="font-bold text-slate-900 capitalize">
                          {selectedPosition}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-500">
                          Duration
                        </span>
                        <span className="font-bold text-slate-900 capitalize">
                          {selectedDuration}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-base font-black text-slate-900">
                          Total Due
                        </span>
                        <span className="text-2xl font-black text-indigo-600">
                          ${bannerPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep("details")}
                      disabled={bannerPaymentLoading}
                      className="w-1/3 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBannerSubmit}
                      disabled={bannerPaymentLoading}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-md shadow-indigo-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {bannerPaymentLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                          Secure Checkout...
                        </>
                      ) : (
                        <>
                          <Icon name="LockClosedIcon" size={18} /> Pay $
                          {bannerPrice} Securely
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboardContent;
