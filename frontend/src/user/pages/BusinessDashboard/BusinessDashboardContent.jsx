import React, { useState, useEffect } from "react";
import Icon from "../../components/ui/AppIcon";
import {
  businessAPI,
  offerAPI,
  certificateAPI,
  getUser,
  uploadAPI,
} from "../../../services/api";

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
            _id: p._id || p.id,
          });
          if (p._id || p.id) {
            loadOffers(p._id || p.id);
          }
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
      console.error("Offer save failed:", error);
      alert(error.message || "Failed to save offer.");
    }
  };

  const handleOfferImageUpload = async (file) => {
    if (!file) return;
    setUploadingOfferImage(true);
    try {
      const data = await uploadAPI.image(file);
      const url = data?.url || data?.secure_url || "";
      setOfferForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Offer image upload failed:", error);
      alert(error.message || "Failed to upload image.");
    } finally {
      setUploadingOfferImage(false);
    }
  };

  const handleOfferDelete = async (offerId) => {
    try {
      await offerAPI.delete(offerId);
      if (businessData?._id || businessData?.id) {
        loadOffers(businessData?._id || businessData?.id);
      }
    } catch (error) {
      console.error("Offer delete failed:", error);
      alert(error.message || "Failed to delete offer.");
    }
  };

  const handleOfferToggle = async (offer) => {
    try {
      await offerAPI.update(offer.id, { isActive: !offer.isActive });
      if (businessData?._id || businessData?.id) {
        loadOffers(businessData?._id || businessData?.id);
      }
    } catch (error) {
      console.error("Offer toggle failed:", error);
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
      console.error("Certificate create failed:", error);
      alert(error.message || "Failed to create certificate.");
    }
  };

  const prepaidOffers = activeOffers.filter(
    (offer) => offer.type === "PREPAID_CERTIFICATE",
  );

  const chartData = [
    { month: "Aug", views: 820, saves: 124, redemptions: 18 },
    { month: "Sep", views: 950, saves: 168, redemptions: 22 },
    { month: "Oct", views: 1080, saves: 215, redemptions: 24 },
    { month: "Nov", views: 1150, saves: 267, redemptions: 26 },
    { month: "Dec", views: 1240, saves: 342, redemptions: 28 },
  ];
  return (
    <div className="min-h-screen bg-slate-50/50">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Header */}
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

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">
                Profile Views
              </p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon name="EyeIcon" size={20} className="text-[#1C4D8D]" />
              </div>
            </div>
            <p className="text-3xl font-heading font-bold text-slate-900">
              {businessData?.profileViews}
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <Icon name="ArrowTrendingUpIcon" size={12} /> +12% from last month
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Offer Saves</p>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Icon
                  name="BookmarkIcon"
                  size={20}
                  className="text-purple-600"
                />
              </div>
            </div>
            <p className="text-3xl font-heading font-bold text-slate-900">
              {businessData?.offerSaves}
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <Icon name="ArrowTrendingUpIcon" size={12} /> +18% from last month
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">Redemptions</p>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Icon
                  name="CheckCircleIcon"
                  size={20}
                  className="text-emerald-600"
                />
              </div>
            </div>
            <p className="text-3xl font-heading font-bold text-slate-900">
              {businessData?.certificateRedemptions}
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <Icon name="ArrowTrendingUpIcon" size={12} /> +8% from last month
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">
                Engagement Rate
              </p>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Icon
                  name="ChartBarIcon"
                  size={20}
                  className="text-orange-600"
                />
              </div>
            </div>
            <p className="text-3xl font-heading font-bold text-slate-900">
              {businessData?.engagementRate}%
            </p>
            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
              <Icon name="ArrowTrendingUpIcon" size={12} /> +3% from last month
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-10 overflow-hidden">
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "border-[#1C4D8D] text-[#1C4D8D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("offers")}
                className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "offers"
                    ? "border-[#1C4D8D] text-[#1C4D8D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Offers
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "certificates"
                    ? "border-[#1C4D8D] text-[#1C4D8D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Certificates
              </button>
              <button
                onClick={() => setActiveTab("banners")}
                className={`py-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "banners"
                    ? "border-[#1C4D8D] text-[#1C4D8D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Banners
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Analytics Chart */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-6">
                    Performance Overview
                  </h3>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="h-80 flex items-end justify-between gap-3 sm:gap-4 md:gap-6">
                      {chartData?.map((data, index) => (
                        <div
                          key={`chart_${index}`}
                          className="flex-1 flex flex-col items-center gap-3"
                        >
                          {/* Bars Container */}
                          <div className="w-full flex items-end justify-center gap-1 h-64">
                            {/* Views Bar */}
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-semibold text-[#1C4D8D] mb-1">
                                  {data?.views}
                                </span>
                                <div
                                  className="w-full bg-[#1C4D8D] rounded-t-lg transition-all hover:opacity-80"
                                  style={{
                                    height: `${(data?.views / 1500) * 200}px`,
                                    minHeight: "20px",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Saves Bar */}
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-semibold text-[#4988C4] mb-1">
                                  {data?.saves}
                                </span>
                                <div
                                  className="w-full bg-[#4988C4] rounded-t-lg transition-all hover:opacity-80"
                                  style={{
                                    height: `${(data?.saves / 400) * 200}px`,
                                    minHeight: "20px",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Redemptions Bar */}
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-semibold text-[#4988C4] mb-1">
                                  {data?.redemptions}
                                </span>
                                <div
                                  className="w-full bg-[#BDE8F5] rounded-t-lg transition-all hover:opacity-80"
                                  style={{
                                    height: `${(data?.redemptions / 30) * 200}px`,
                                    minHeight: "20px",
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Month Label */}
                          <p className="text-sm font-bold text-slate-600">
                            {data?.month}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 pt-6 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#1C4D8D] rounded-full" />
                        <span className="text-sm font-medium text-slate-600">
                          Profile Views
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#4988C4] rounded-full" />
                        <span className="text-sm font-medium text-slate-600">
                          Offer Saves
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#BDE8F5] rounded-full" />
                        <span className="text-sm font-medium text-slate-600">
                          Redemptions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
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
                  </div>
                </div>
              </div>
            )}

            {/* Offers Tab */}
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
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Offer Title
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Type
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Duration
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Views
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Saves
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeOffers?.map((offer) => (
                        <tr
                          key={offer?.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-900">
                              {offer?.title}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-blue-50 text-[#1C4D8D] rounded-full text-xs font-bold">
                              {offer?.type === "DISCOUNT"
                                ? `${offer?.discountValue || 0}% off`
                                : offer?.type === "VALUE_ADDED_CERTIFICATE"
                                  ? "Value Added"
                                  : "Prepaid Certificate"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-500">
                            {offer?.expiryDate
                              ? new Date(offer.expiryDate).toLocaleDateString()
                              : "No expiry"}
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-900 font-semibold">
                            {offer?.views}
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-900 font-semibold">
                            {offer?.saves}
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

            {/* Certificates Tab */}
            {activeTab === "certificates" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-slate-900">
                    Active Certificates
                  </h3>
                  <button
                    onClick={openCreateCertificate}
                    className="px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Icon name="PlusIcon" size={18} />
                    Create Certificate
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Certificate Title
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Face Value
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Member Price
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Sold
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Redeemed
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeCertificates?.map((cert) => (
                        <tr
                          key={cert?.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-900">
                              {cert?.title}
                            </p>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-900 font-semibold">
                            ${cert?.faceValue}
                          </td>
                          <td className="py-4 px-6 text-sm text-[#1C4D8D] font-bold">
                            ${cert?.memberPrice}
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-900 font-semibold">
                            {cert?.sold}
                          </td>
                          <td className="py-4 px-6 text-sm text-emerald-600 font-bold">
                            {cert?.redeemed}
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

            {/* Banners Tab */}
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
                    className="px-6 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-bold hover:bg-[#1C4D8D]/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Icon name="PlusIcon" size={18} />
                    Purchase Banner
                  </button>
                </div>

                {/* Banner Pricing Info */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#1C4D8D] rounded-lg flex items-center justify-center">
                        <Icon
                          name="SparklesIcon"
                          size={20}
                          className="text-white"
                        />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-slate-900">
                        Top Placement
                      </h4>
                    </div>
                    <p className="text-3xl font-heading font-bold text-[#1C4D8D] mb-2">
                      $500
                      <span className="text-sm text-slate-500 font-normal">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 mb-6">
                      728x200px • Premium visibility
                    </p>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={18}
                          className="text-emerald-500"
                        />
                        10% off 6-month plan
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={18}
                          className="text-emerald-500"
                        />
                        15% off annual plan
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Icon
                          name="StarIcon"
                          size={20}
                          className="text-white"
                        />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-slate-900">
                        Mid Placement
                      </h4>
                    </div>
                    <p className="text-3xl font-heading font-bold text-purple-600 mb-2">
                      $350
                      <span className="text-sm text-slate-500 font-normal">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 mb-6">
                      728x200px • Great exposure
                    </p>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={18}
                          className="text-emerald-500"
                        />
                        10% off 6-month plan
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={18}
                          className="text-emerald-500"
                        />
                        15% off annual plan
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Icon
                          name="BoltIcon"
                          size={20}
                          className="text-white"
                        />
                      </div>
                      <h4 className="font-heading font-bold text-lg text-slate-900">
                        Bottom Placement
                      </h4>
                    </div>
                    <p className="text-3xl font-heading font-bold text-orange-500 mb-2">
                      $250
                      <span className="text-sm text-slate-500 font-normal">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-slate-600 mb-6">
                      728x200px • Solid reach
                    </p>
                    <ul className="space-y-3 text-sm text-slate-700">
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={18}
                          className="text-emerald-500"
                        />
                        10% off 6-month plan
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon
                          name="CheckCircleIcon"
                          size={18}
                          className="text-emerald-500"
                        />
                        15% off annual plan
                      </li>
                    </ul>
                  </div>
                </div>

                {/* My Banners */}
                <div>
                  <h4 className="font-heading text-lg font-bold text-slate-900 mb-4">
                    My Active Banners
                  </h4>
                  {myBanners?.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Icon
                        name="PhotoIcon"
                        size={48}
                        className="text-slate-300 mx-auto mb-4"
                      />
                      <p className="text-slate-500">
                        No active banners yet. Purchase your first banner to get
                        started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBanners?.map((banner) => (
                        <div
                          key={banner?.id}
                          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-slate-900 mb-2">
                                {banner?.title}
                              </h5>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Icon name="MapPinIcon" size={14} />
                                  {banner?.position} placement
                                </span>
                                <span className="flex items-center gap-1">
                                  <Icon name="CalendarIcon" size={14} />
                                  {new Date(
                                    banner?.start_date,
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    banner?.end_date,
                                  ).toLocaleDateString()}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    banner?.is_active
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {banner?.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Banner Purchase Modal */}
        {showBannerModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold text-slate-900">
                  {paymentStep === "details"
                    ? "Purchase Banner Ad"
                    : "Complete Payment"}
                </h3>
                <button
                  onClick={() => {
                    setShowBannerModal(false);
                    setBannerTitle("");
                    setBannerImageUrl("");
                    setBannerLinkUrl("");
                    setPaymentStep("details");
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                  <Icon name="XMarkIcon" size={24} />
                </button>
              </div>

              <div className="p-6">
                {paymentStep === "details" ? (
                  <div className="space-y-6">
                    {/* Banner Details Form */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Banner Title *
                      </label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="Enter banner title"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={bannerImageUrl}
                        onChange={(e) => setBannerImageUrl(e.target.value)}
                        placeholder="https://example.com/banner.jpg (728x200px)"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={bannerLinkUrl}
                        onChange={(e) => setBannerLinkUrl(e.target.value)}
                        placeholder="https://your-website.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Placement Position *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["top", "mid", "bottom"].map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setSelectedPosition(pos)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedPosition === pos
                                ? "border-[#1C4D8D] bg-[#1C4D8D]/5 shadow-sm"
                                : "border-slate-100 hover:border-[#1C4D8D]/30 bg-white"
                            }`}
                          >
                            <p className="font-bold text-slate-900 capitalize">
                              {pos}
                            </p>
                            <p className="text-sm text-slate-500">
                              $
                              {pos === "top"
                                ? "500"
                                : pos === "mid"
                                  ? "350"
                                  : "250"}
                              /mo
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Duration *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "monthly", label: "1 Month", discount: 0 },
                          {
                            value: "six_months",
                            label: "6 Months",
                            discount: 5,
                          },
                          { value: "annual", label: "1 Year", discount: 5 },
                        ].map((dur) => (
                          <button
                            key={dur.value}
                            onClick={() => setSelectedDuration(dur.value)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedDuration === dur.value
                                ? "border-[#1C4D8D] bg-[#1C4D8D]/5 shadow-sm"
                                : "border-slate-100 hover:border-[#1C4D8D]/30 bg-white"
                            }`}
                          >
                            <p className="font-bold text-slate-900">
                              {dur.label}
                            </p>
                            {dur.discount > 0 && (
                              <p className="text-xs text-emerald-600 font-bold">
                                Save {dur.discount}%
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-4">
                        Price Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Base Price:</span>
                          <span className="font-semibold text-slate-900">
                            $
                            {selectedPosition === "top"
                              ? "500"
                              : selectedPosition === "mid"
                                ? "350"
                                : "250"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Duration:</span>
                          <span className="font-semibold text-slate-900">
                            {selectedDuration === "monthly"
                              ? "1 month"
                              : selectedDuration === "six_months"
                                ? "6 months"
                                : "12 months"}
                          </span>
                        </div>
                        {(selectedDuration === "six_months" ||
                          selectedDuration === "annual") && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount (5%):</span>
                            <span className="font-semibold">
                              -$
                              {(
                                (selectedPosition === "top"
                                  ? 500
                                  : selectedPosition === "mid"
                                    ? 350
                                    : 250) *
                                (selectedDuration === "six_months" ? 6 : 12) *
                                0.05
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-lg">
                            Total:
                          </span>
                          <span className="font-bold text-[#1C4D8D] text-2xl">
                            $
                            {(
                              (selectedPosition === "top"
                                ? 500
                                : selectedPosition === "mid"
                                  ? 350
                                  : 250) *
                              (selectedDuration === "monthly"
                                ? 1
                                : selectedDuration === "six_months"
                                  ? 6
                                  : 12) *
                              (selectedDuration === "monthly" ? 1 : 0.95)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!bannerTitle.trim()) {
                          alert("Please enter a banner title");
                          return;
                        }
                        setPaymentStep("payment");
                      }}
                      className="w-full py-4 bg-[#1C4D8D] text-white rounded-xl font-bold text-lg hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Continue to Payment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">
                        Order Summary
                      </h4>
                      <p className="text-sm text-slate-600 mb-4">
                        {bannerTitle}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Total Amount:</span>
                        <span className="text-2xl font-bold text-[#1C4D8D]">
                          $
                          {(
                            (selectedPosition === "top"
                              ? 500
                              : selectedPosition === "mid"
                                ? 350
                                : 250) *
                            (selectedDuration === "monthly"
                              ? 1
                              : selectedDuration === "six_months"
                                ? 6
                                : 12) *
                            (selectedDuration === "monthly" ? 1 : 0.95)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <PayPalPayment
                      businessId={businessData?.id || ""}
                      position={selectedPosition}
                      duration={selectedDuration}
                      price={parseFloat(
                        (
                          (selectedPosition === "top"
                            ? 500
                            : selectedPosition === "mid"
                              ? 350
                              : 250) *
                          (selectedDuration === "monthly"
                            ? 1
                            : selectedDuration === "six_months"
                              ? 6
                              : 12) *
                          (selectedDuration === "monthly" ? 1 : 0.95)
                        ).toFixed(2),
                      )}
                      bannerTitle={bannerTitle}
                      bannerImageUrl={bannerImageUrl}
                      bannerLinkUrl={bannerLinkUrl}
                      onSuccess={() => {
                        setShowBannerModal(false);
                        setBannerTitle("");
                        setBannerImageUrl("");
                        setBannerLinkUrl("");
                        setPaymentStep("details");
                        alert(
                          "Banner purchased successfully! Your banner will be activated shortly.",
                        );
                      }}
                      onError={(error) => {
                        alert(`Payment failed: ${error}`);
                      }}
                    />

                    <button
                      onClick={() => setPaymentStep("details")}
                      className="w-full py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                    >
                      Back to Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showOfferModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold text-slate-900">
                  {editingOffer ? "Edit Offer" : "Create Offer"}
                </h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
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
                    placeholder="Offer details"
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
                      className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                    />
                    {uploadingOfferImage && (
                      <span className="text-xs text-slate-500">
                        Uploading...
                      </span>
                    )}
                  </div>
                  {offerForm.imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100">
                      <img
                        src={offerForm.imageUrl}
                        alt="Offer preview"
                        className="w-full h-40 object-cover"
                      />
                    </div>
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
                      required={offerForm.type !== "PREPAID_CERTIFICATE"}
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
                      Minimum Spend
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

        {showCertificateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-heading text-2xl font-bold text-slate-900">
                  Create Certificate
                </h3>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
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
                    Create a PREPAID_CERTIFICATE offer first, then add
                    certificates for it.
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
                        {prepaidOffers.map((offer) => (
                          <option key={offer.id} value={offer.id}>
                            {offer.title}
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
