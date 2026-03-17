// Frontend/src/user/pages/Dashboard/BusinessDashboardContent.jsx
// CHANGES FROM ORIGINAL:
//   + New "Redeem" tab between Certificates and Banners
//   + RedemptionPanel component: code entry, live result, history table
//   Everything else is IDENTICAL to the original.

import React, { useState, useEffect, useCallback } from "react";
import Icon from "../../components/ui/AppIcon";
import {
  businessAPI,
  offerAPI,
  certificateAPI,
  getUser,
  uploadAPI,
} from "../../../services/api";
import AnalyticsStatsPanel from "../../components/ui/AnalyticsStatsPanel";

// ─── Redemption Panel — lives inside the Redeem tab ──────────────────────────
const RedemptionPanel = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, data }
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(""); // "" | "PURCHASED" | "REDEEMED"

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
        message: res.message || "Redeemed!",
        data: res.data,
      });
      setCode("");
      // Refresh history
      loadHistory(1, statusFilter);
      setHistoryPage(1);
    } catch (err) {
      // api.js throws with err.message = backend message
      const msg = err.message || "Redemption failed";
      // Check if it was already redeemed (backend returns 400 with data)
      setResult({ success: false, message: msg, data: null });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(historyTotal / 10);

  return (
    <div className="space-y-8">
      {/* ── Code Entry ─────────────────────────────────────────────────────── */}
      <div className="max-w-xl">
        <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
          Redeem a Certificate
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Enter the unique code the member received after purchase (format:
          DISC-XXXX-XXXX-XXXX).
        </p>
        <form onSubmit={handleRedeem} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setResult(null);
            }}
            placeholder="DISC-XXXX-XXXX-XXXX"
            maxLength={19}
            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-sm font-bold tracking-widest text-slate-800 uppercase focus:outline-none focus:border-[#1C4D8D] focus:ring-2 focus:ring-[#1C4D8D]/20 transition-all placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || code.trim().length < 4}
            className="px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Checking…
              </>
            ) : (
              <>
                <Icon name="CheckBadgeIcon" size={18} />
                Redeem
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Result Card ────────────────────────────────────────────────────── */}
      {result && (
        <div
          className={`rounded-2xl border-2 p-6 max-w-xl transition-all ${
            result.success
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                result.success ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              <Icon
                name={result.success ? "CheckIcon" : "XMarkIcon"}
                size={20}
                className="text-white"
              />
            </div>
            <p
              className={`font-bold text-lg ${
                result.success ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {result.message}
            </p>
          </div>

          {result.success && result.data && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
                  result.data.faceValue ? `$${result.data.faceValue}` : "—",
                ],
                [
                  "Discount",
                  result.data.discountValue
                    ? `$${result.data.discountValue} off`
                    : "—",
                ],
                ["Member", result.data.memberEmail || "—"],
                [
                  "Redeemed At",
                  result.data.redeemedAt
                    ? new Date(result.data.redeemedAt).toLocaleString()
                    : "—",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-white/70 rounded-xl p-3 border border-emerald-100"
                >
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="font-semibold text-slate-800 truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Redemption History ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-heading text-xl font-bold text-slate-900">
            Redemption History
            {historyTotal > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({historyTotal} total)
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setHistoryPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 focus:outline-none focus:border-[#1C4D8D]"
            >
              <option value="">All</option>
              <option value="PURCHASED">Purchased</option>
              <option value="REDEEMED">Redeemed</option>
            </select>
            <button
              onClick={() => loadHistory(historyPage, statusFilter)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Refresh"
            >
              <Icon name="ArrowPathIcon" size={18} />
            </button>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Icon
              name="TicketIcon"
              size={48}
              className="text-slate-200 mx-auto mb-3"
            />
            <p className="text-slate-500 font-medium">No redemptions yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Certificates redeemed by members will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
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
                        className="text-left py-3 px-4 font-bold text-slate-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 tracking-wide">
                        {row.uniqueCode || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            row.type === "PREPAID_CERTIFICATE"
                              ? "bg-blue-50 text-[#1C4D8D]"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {row.type === "PREPAID_CERTIFICATE"
                            ? "Prepaid"
                            : "Value-Added"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ${row.faceValue ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-35 truncate">
                        {row.memberEmail || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {row.purchasedAt
                          ? new Date(row.purchasedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {row.redeemedAt
                          ? new Date(row.redeemedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            row.status === "REDEEMED"
                              ? "bg-emerald-100 text-emerald-700"
                              : row.status === "PURCHASED"
                                ? "bg-blue-50 text-[#1C4D8D]"
                                : "bg-slate-100 text-slate-500"
                          }`}
                        >
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Page {historyPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage((p) => p - 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={historyPage === totalPages}
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
          setBusinessData({
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

  // Tab config — added Redeem between Certificates and Banners
  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "offers", label: "Offers" },
    { id: "certificates", label: "Certificates" },
    { id: "redeem", label: "Redeem" }, // ← NEW
    { id: "banners", label: "Banners" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome,{" "}
            <span className="text-[#1C4D8D]">{businessData?.name}</span>
          </h1>
          <p className="text-lg text-slate-600">
            Your offers reached{" "}
            <span className="text-[#1C4D8D] font-bold">
              {businessData?.profileViews}
            </span>{" "}
            members this month
          </p>
        </div>

        <AnalyticsStatsPanel title="Business Analytics" />

        {/* Quick stats (unchanged) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: "Profile Views",
              value: businessData?.profileViews,
              icon: "EyeIcon",
              color: "bg-blue-50",
              iconColor: "text-[#1C4D8D]",
            },
            {
              label: "Offer Saves",
              value: businessData?.offerSaves,
              icon: "BookmarkIcon",
              color: "bg-purple-50",
              iconColor: "text-purple-600",
            },
            {
              label: "Redemptions",
              value: businessData?.certificateRedemptions,
              icon: "CheckCircleIcon",
              color: "bg-emerald-50",
              iconColor: "text-emerald-600",
            },
            {
              label: "Engagement Rate",
              value: `${Number.isFinite(businessData?.engagementRate) ? businessData.engagementRate : 0}%`,
              icon: "ChartBarIcon",
              color: "bg-orange-50",
              iconColor: "text-orange-600",
            },
          ].map(({ label, value, icon, color, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className={`p-2 ${color} rounded-lg`}>
                  <Icon name={icon} size={20} className={iconColor} />
                </div>
              </div>
              <p className="text-3xl font-heading font-bold text-slate-900">
                {value}
              </p>
              <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <Icon name="ArrowTrendingUpIcon" size={12} /> +8% from last
                month
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-10 overflow-hidden">
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-6 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#1C4D8D] text-[#1C4D8D]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.id === "redeem" && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="CheckBadgeIcon" size={16} />
                      {tab.label}
                    </span>
                  )}
                  {tab.id !== "redeem" && tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* ── Overview tab (unchanged) ────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-6">
                    Performance Overview
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="h-80 flex items-end justify-between gap-3 sm:gap-4 md:gap-6">
                      {chartData.map((data, index) => (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-3"
                        >
                          <div className="w-full flex items-end justify-center gap-1 h-64">
                            {[
                              {
                                val: data.views,
                                max: maxViews,
                                color: "bg-[#1C4D8D]",
                                label: data.views,
                              },
                              {
                                val: data.saves,
                                max: maxSaves,
                                color: "bg-[#4988C4]",
                                label: data.saves,
                              },
                              {
                                val: data.redemptions,
                                max: maxRedemptions,
                                color: "bg-[#BDE8F5]",
                                label: data.redemptions,
                              },
                            ].map(({ val, max, color, label }, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center gap-1 flex-1"
                              >
                                <div className="w-full flex flex-col items-center">
                                  <span
                                    className={`text-xs font-semibold mb-1 ${i === 0 ? "text-[#1C4D8D]" : "text-[#4988C4]"}`}
                                  >
                                    {label}
                                  </span>
                                  <div
                                    className={`w-full ${color} rounded-t-lg`}
                                    style={{
                                      height: `${(val / max) * 200}px`,
                                      minHeight: "20px",
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm font-bold text-slate-600">
                            {data.month}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-200">
                      {[
                        ["bg-[#1C4D8D]", "Transactions"],
                        ["bg-[#4988C4]", "Cert Purchases"],
                        ["bg-[#BDE8F5]", "Cert Redemptions"],
                      ].map(([bg, label]) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 ${bg} rounded-full`} />
                          <span className="text-sm font-medium text-slate-600">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        setActiveTab("offers");
                        openCreateOffer();
                      }}
                      className="flex items-center gap-4 p-5 border border-slate-200 rounded-2xl hover:border-[#1C4D8D] hover:shadow-md transition-all bg-white group"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon
                          name="PlusIcon"
                          size={24}
                          className="text-[#1C4D8D]"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                          Create New Offer
                        </p>
                        <p className="text-sm text-slate-500">Add a discount</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("certificates");
                        openCreateCertificate();
                      }}
                      className="flex items-center gap-4 p-5 border border-slate-200 rounded-2xl hover:border-[#4988C4] hover:shadow-md transition-all bg-white group"
                    >
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon
                          name="TicketIcon"
                          size={24}
                          className="text-[#4988C4]"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 group-hover:text-[#4988C4] transition-colors">
                          Create Certificate
                        </p>
                        <p className="text-sm text-slate-500">Add a voucher</p>
                      </div>
                    </button>
                    {/* NEW quick action */}
                    <button
                      onClick={() => setActiveTab("redeem")}
                      className="flex items-center gap-4 p-5 border border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all bg-white group"
                    >
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon
                          name="CheckBadgeIcon"
                          size={24}
                          className="text-emerald-600"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Redeem Certificate
                        </p>
                        <p className="text-sm text-slate-500">
                          Scan member code
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Offers tab (unchanged) ──────────────────────────────────── */}
            {activeTab === "offers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    Active Offers
                  </h3>
                  <button
                    onClick={openCreateOffer}
                    className="px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Icon name="PlusIcon" size={18} />
                    Create Offer
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {[
                          "Offer Title",
                          "Type",
                          "Duration",
                          "Views",
                          "Saves",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-4 px-6 text-sm font-bold text-slate-600"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeOffers.map((offer) => (
                        <tr
                          key={offer.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            {offer.title}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-blue-50 text-[#1C4D8D] rounded-full text-xs font-bold">
                              {offer.type === "DISCOUNT"
                                ? `${offer.discountValue || 0}% off`
                                : offer.type === "VALUE_ADDED_CERTIFICATE"
                                  ? "Value Added"
                                  : "Prepaid Certificate"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-500">
                            {offer.expiryDate
                              ? new Date(offer.expiryDate).toLocaleDateString()
                              : "No expiry"}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                            {offer.views}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                            {offer.saves}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditOffer(offer)}
                                className="p-2 hover:bg-blue-50 text-slate-400 hover:text-[#1C4D8D] rounded-lg transition-colors"
                              >
                                <Icon name="PencilIcon" size={18} />
                              </button>
                              <button
                                onClick={() => handleOfferToggle(offer)}
                                className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-500 rounded-lg transition-colors"
                              >
                                <Icon name="PauseIcon" size={18} />
                              </button>
                              <button
                                onClick={() => handleOfferDelete(offer.id)}
                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                              >
                                <Icon name="TrashIcon" size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Certificates tab (unchanged) ───────────────────────────── */}
            {activeTab === "certificates" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    Active Certificates
                  </h3>
                  <button
                    onClick={openCreateCertificate}
                    className="px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Icon name="PlusIcon" size={18} />
                    Create Certificate
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
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
                            className="text-left py-4 px-6 text-sm font-bold text-slate-600"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeCertificates.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            {cert.title}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                            ${cert.faceValue}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-[#1C4D8D]">
                            ${cert.memberPrice}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-slate-900">
                            {cert.sold}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-emerald-600">
                            {cert.redeemed}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-blue-50 text-slate-400 hover:text-[#1C4D8D] rounded-lg transition-colors">
                                <Icon name="PencilIcon" size={18} />
                              </button>
                              <button className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-500 rounded-lg transition-colors">
                                <Icon name="PauseIcon" size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── NEW: Redeem tab ─────────────────────────────────────────── */}
            {activeTab === "redeem" && <RedemptionPanel />}

            {/* ── Banners tab (unchanged) ─────────────────────────────────── */}
            {activeTab === "banners" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    Advertising Banners
                  </h3>
                  <button
                    onClick={() => {
                      setShowBannerModal(true);
                      setPaymentStep("details");
                    }}
                    className="px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Icon name="PlusIcon" size={18} />
                    Purchase Banner
                  </button>
                </div>
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Icon
                    name="PhotoIcon"
                    size={48}
                    className="text-slate-300 mx-auto mb-4"
                  />
                  <p className="text-slate-500">No active banners yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Offer modal (unchanged) ──────────────────────────────────────── */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold text-slate-900">
                  {editingOffer ? "Edit Offer" : "Create Offer"}
                </h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                >
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>
              <form onSubmit={handleOfferSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={offerForm.title}
                    onChange={(e) =>
                      setOfferForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="10% off lunch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Offer Image
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleOfferImageUpload(e.target.files?.[0])
                      }
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold"
                    />
                    {uploadingOfferImage && (
                      <span className="text-xs text-slate-500">
                        Uploading...
                      </span>
                    )}
                  </div>
                  {offerForm.imageUrl && (
                    <img
                      src={offerForm.imageUrl}
                      alt="preview"
                      className="mt-3 w-full h-40 object-cover rounded-2xl border border-slate-100"
                    />
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Type
                    </label>
                    <select
                      value={offerForm.type}
                      onChange={(e) =>
                        setOfferForm((p) => ({ ...p, type: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="DISCOUNT">Discount</option>
                      <option value="VALUE_ADDED_CERTIFICATE">
                        Value Added Certificate
                      </option>
                      <option value="PREPAID_CERTIFICATE">
                        Prepaid Certificate
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Discount Value
                    </label>
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Min Spend
                    </label>
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Expiry Date
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all"
                >
                  {editingOffer ? "Save Changes" : "Create Offer"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Certificate modal (unchanged) ───────────────────────────────── */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold text-slate-900">
                  Create Certificate
                </h3>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                >
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>
              <form
                onSubmit={handleCertificateSubmit}
                className="p-6 space-y-4"
              >
                {prepaidOffers.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                    Create a PREPAID_CERTIFICATE or VALUE_ADDED_CERTIFICATE
                    offer first.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Offer
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
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="">Select an offer</option>
                        {prepaidOffers.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Face Value
                        </label>
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
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Member Price
                        </label>
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
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                          placeholder="80"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Expiry Date
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
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all"
                    >
                      Create Certificate
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboardContent;
