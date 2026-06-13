import React, { useEffect, useState, useCallback } from "react";
import { adminAPI, categoryAPI, businessAPI } from "../../../services/api";
import toast from "react-hot-toast";

const STOREFRONT_FALLBACK = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231C4D8D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E";

const getCategoryEmoji = (slug) => {
  const emojis = {
    "automotive-marine": "🚗",
    "b2b": "💼",
    "beauty": "✂️",
    "construction": "🏗️",
    "electronics": "💻",
    "fashion": "🛍️",
    "food": "🍕",
    "health": "💪",
    "home": "🏡",
    "kids": "👶",
    "retail": "🏷️",
    "uncategorized": "📁",
  };
  return emojis[slug?.toLowerCase()] || "📁";
};

const BusinessProfiles = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [businesses, setBusinesses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Detailed review drawer states
  const [reviewingBizId, setReviewingBizId] = useState(null);
  const [reviewingBusiness, setReviewingBusiness] = useState(null);
  const [reviewingLoading, setReviewingLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);

  // Edit profile states inside drawer
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    website: "",
    cuisineType: "",
    coverBannerUrl: "",
    logoUrl: "",
    facebook: "",
    instagram: "",
    twitter: "",
    status: "PENDING",
  });

  // Fetch all categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories: " + err.message);
    }
  }, []);

  // Fetch admin businesses based on filters
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 1000 }; // Fetch all businesses for category-wise audit
      if (selectedCategoryId !== "all") {
        params.categoryId = selectedCategoryId;
      }
      if (statusFilter !== "all") {
        params.status = statusFilter.toUpperCase();
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await adminAPI.getBusinesses(params);
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load businesses.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, statusFilter, searchQuery]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Load detailed profile for drawer
  const handleReviewProfile = async (biz) => {
    setReviewingBizId(biz.id);
    setReviewingLoading(true);
    setReviewingBusiness(null);
    setShowDrawer(true);
    try {
      const data = await businessAPI.getById(biz.id);
      setReviewingBusiness(data?.business || data);
    } catch (err) {
      toast.error("Failed to fetch full business profile: " + err.message);
      setShowDrawer(false);
    } finally {
      setReviewingLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionsLoading(true);
    try {
      await adminAPI.approveBusiness(id);
      toast.success("Business approved successfully!");
      const updated = await businessAPI.getById(id);
      setReviewingBusiness(updated?.business || updated);
      loadBusinesses();
    } catch (err) {
      toast.error(err.message || "Failed to approve business.");
    } finally {
      setActionsLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionsLoading(true);
    try {
      await adminAPI.rejectBusiness(id);
      toast.success("Business listing rejected.");
      const updated = await businessAPI.getById(id);
      setReviewingBusiness(updated?.business || updated);
      loadBusinesses();
    } catch (err) {
      toast.error(err.message || "Failed to reject business.");
    } finally {
      setActionsLoading(false);
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    setActionsLoading(true);
    try {
      await adminAPI.updateUserStatus(userId, !isActive);
      toast.success(`User status set to ${!isActive ? "Active" : "Inactive"}`);
      if (reviewingBusiness?.id) {
        const updated = await businessAPI.getById(reviewingBusiness.id);
        setReviewingBusiness(updated?.business || updated);
      }
      loadBusinesses();
    } catch (err) {
      toast.error(err.message || "Failed to update user status.");
    } finally {
      setActionsLoading(false);
    }
  };

  // Open Edit Modal
  const openEdit = (business) => {
    let social = {};
    if (business.socialLinks) {
      try {
        social = typeof business.socialLinks === "string" 
          ? JSON.parse(business.socialLinks) 
          : business.socialLinks;
      } catch (e) {
        console.error("Error parsing social links", e);
      }
    }

    setEditForm({
      name: business.name || "",
      categoryId: business.categoryId || business.category?.id || "",
      description: business.description || "",
      phone: business.phone || "",
      email: business.email || "",
      address: business.address || "",
      district: business.district || "",
      website: business.website || "",
      cuisineType: business.cuisineType || "",
      coverBannerUrl: business.coverBannerUrl || "",
      logoUrl: business.logoUrl || "",
      facebook: social.facebook || "",
      instagram: social.instagram || "",
      twitter: social.twitter || "",
      status: business.status || "PENDING",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingBusiness?.id) return;
    setActionsLoading(true);
    try {
      const socialLinks = {
        facebook: editForm.facebook,
        instagram: editForm.instagram,
        twitter: editForm.twitter,
      };

      const payload = {
        ...editForm,
        socialLinks,
      };

      await adminAPI.updateBusiness(reviewingBusiness.id, payload);
      toast.success("Business profile updated successfully!");
      setShowEditModal(false);
      
      // Refresh detailed view & main list
      const updated = await businessAPI.getById(reviewingBusiness.id);
      setReviewingBusiness(updated?.business || updated);
      loadBusinesses();
    } catch (err) {
      toast.error(err.message || "Failed to update business.");
    } finally {
      setActionsLoading(false);
    }
  };

  // Group businesses category-wise
  const getGroupedBusinesses = () => {
    const grouped = {};
    
    // Initialize with categories in database
    categories.forEach((cat) => {
      grouped[cat.id] = {
        category: cat,
        businesses: [],
      };
    });

    // Handle uncategorized
    const UNCATEGORIZED_ID = "uncategorized";
    grouped[UNCATEGORIZED_ID] = {
      category: {
        id: UNCATEGORIZED_ID,
        name: "Uncategorized",
        slug: "uncategorized",
      },
      businesses: [],
    };

    // Distribute businesses
    businesses.forEach((biz) => {
      const catId = biz.categoryId || biz.category?.id || UNCATEGORIZED_ID;
      if (grouped[catId]) {
        grouped[catId].businesses.push(biz);
      } else {
        // Fallback for custom category ids
        grouped[catId] = {
          category: biz.category || { id: catId, name: "Other", slug: "other" },
          businesses: [biz],
        };
      }
    });

    // Format list based on selected category filter
    const result = [];
    if (selectedCategoryId === "all") {
      Object.keys(grouped).forEach((catId) => {
        if (grouped[catId].businesses.length > 0) {
          result.push(grouped[catId]);
        }
      });
    } else {
      if (grouped[selectedCategoryId] && grouped[selectedCategoryId].businesses.length > 0) {
        result.push(grouped[selectedCategoryId]);
      }
    }

    return result;
  };

  const groupedBusinesses = getGroupedBusinesses();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1500px] mx-auto min-h-screen relative font-sans text-slate-800">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
        <div>
          <h1
            className="text-3xl font-bold text-[#111936] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Business Directory (Audit)
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Review and audit partner business profiles organized category-wise.
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Dropdown Selector */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-[#1C4D8D]"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="uncategorized">Uncategorized</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] focus:ring-1 focus:ring-[#1C4D8D] transition-all font-medium"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          {/* Status selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["all", "pending", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Category-wise Section Layout */}
      {loading ? (
        <div className="py-24 text-center">
          <span className="w-10 h-10 border-4 border-slate-100 border-t-[#1C4D8D] rounded-full animate-spin inline-block mb-3" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading profiles...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold text-sm">
          ⚠️ {error}
        </div>
      ) : groupedBusinesses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm max-w-lg mx-auto">
          <div className="text-3xl mb-4">🏬</div>
          <h3 className="font-bold text-slate-800 text-lg">No Business Profiles Found</h3>
          <p className="text-slate-400 text-sm mt-1.5 max-w-sm mx-auto font-medium">
            Try adjusting your search query, status filters, or selected category.
          </p>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
          {groupedBusinesses.map((group) => (
            <div key={group.category.id} className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100">
              
              {/* Category Section Header */}
              <div className="flex items-center gap-3 mb-6 pb-2.5 border-b border-slate-200/70">
                <span className="text-3xl">{getCategoryEmoji(group.category.slug)}</span>
                <div>
                  <h2
                    className="text-xl font-bold text-[#111936]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {group.category.name}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {group.businesses.length} Business{group.businesses.length !== 1 ? "es" : ""} found
                  </p>
                </div>
              </div>

              {/* Businesses Grid for this Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Cover Banner */}
                    <div className="h-24 bg-slate-100 relative overflow-hidden">
                      {biz.coverBannerUrl || (biz.imageUrls && biz.imageUrls[0]) ? (
                        <img
                          src={biz.coverBannerUrl || biz.imageUrls[0]}
                          alt={biz.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800";
                          }}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1C4D8D]/5 to-[#1C4D8D]/15" />
                      )}
                      {/* Floating Status Pill */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm ${
                            biz.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : biz.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {biz.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 pt-0 flex-1 flex flex-col justify-between relative">
                      {/* Circular Logo Overlay */}
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/50 p-1 flex items-center justify-center shadow-md absolute -top-7 left-5 overflow-hidden">
                        <img
                          src={biz.logoUrl || STOREFRONT_FALLBACK}
                          alt={biz.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = STOREFRONT_FALLBACK;
                          }}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>

                      <div className="mt-9">
                        <h3
                          className="font-bold text-slate-900 text-base tracking-tight leading-tight mb-1 truncate"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                          title={biz.name}
                        >
                          {biz.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {biz.district && (
                            <span className="text-[11px] text-slate-400 font-semibold">📍 {biz.district}</span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium">
                          {biz.description || "No business description provided yet."}
                        </p>
                      </div>

                      {/* Footer buttons */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="text-[9px] text-slate-400 font-bold font-mono truncate max-w-[120px]">
                          {biz.user?.email || "—"}
                        </div>
                        <button
                          onClick={() => handleReviewProfile(biz)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-bold text-[#1C4D8D] rounded-xl hover:bg-blue-50 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Review Profile ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Drawer Panel */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => !actionsLoading && setShowDrawer(false)} />

          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-8 pointer-events-none">
            <div className="w-full h-full max-w-[1400px] bg-white flex flex-col rounded-[2.5rem] shadow-2xl relative overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Business Audit Details
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Audit complete registration, active details, and documentation.
                  </p>
                </div>
                <button
                  disabled={actionsLoading}
                  onClick={() => setShowDrawer(false)}
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xl font-bold transition-all"
                >
                  ×
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              {reviewingLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <span className="w-8 h-8 border-4 border-slate-100 border-t-[#1C4D8D] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-400 font-semibold animate-pulse">Loading details...</p>
                </div>
              ) : reviewingBusiness ? (() => {
                const offers = reviewingBusiness.offers || [];
                const reviewingDiscounts = offers.filter((o) => o.type === "DISCOUNT");
                const certificateOffers = offers.filter(
                  (o) =>
                    o.type === "PREPAID_CERTIFICATE" ||
                    o.type === "VALUE_ADDED_CERTIFICATE"
                );
                const reviewingCertificates = certificateOffers.flatMap((o) =>
                  (o.certificates || []).map((c) => ({ ...c, offer: o }))
                );

                return (
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  
                  {/* Banner / Cover Header inside Drawer */}
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                    {reviewingBusiness.coverBannerUrl || (reviewingBusiness.imageUrls && reviewingBusiness.imageUrls[0]) ? (
                      <img
                        src={reviewingBusiness.coverBannerUrl || reviewingBusiness.imageUrls[0]}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800";
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1C4D8D]/5 to-[#1C4D8D]/15" />
                    )}
                    
                    {/* Floating Overlapping Logo */}
                    <div className="absolute bottom-4 left-6 w-20 h-20 bg-white border border-slate-200/50 rounded-2xl p-1 shadow-md overflow-hidden flex items-center justify-center">
                      <img
                        src={reviewingBusiness.logoUrl || STOREFRONT_FALLBACK}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = STOREFRONT_FALLBACK;
                        }}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Core Meta Details */}
                  <div>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {reviewingBusiness.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          ID: {reviewingBusiness.id} · Created: {new Date(reviewingBusiness.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          reviewingBusiness.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : reviewingBusiness.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {reviewingBusiness.status}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2 flex-wrap">
                      <span className="text-xs bg-[#1C4D8D]/5 border border-[#1C4D8D]/10 text-[#1C4D8D] px-2.5 py-1 rounded-lg font-bold">
                        {reviewingBusiness.category?.name || "Uncategorized"}
                      </span>
                      {reviewingBusiness.cuisineType && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                          🍽️ {reviewingBusiness.cuisineType}
                        </span>
                      )}
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${reviewingBusiness.isB2B ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-600"}`}>
                        {reviewingBusiness.isB2B ? "💼 B2B Partner" : "🛍️ Consumer Retail"}
                      </span>
                    </div>
                  </div>

                  {/* Approve/Reject Admin Panel Section */}
                  <div className="bg-slate-50 border border-slate-200/70 rounded-[1.5rem] p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">
                      Workflow Approval Controls
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {reviewingBusiness.status !== "APPROVED" && (
                        <button
                          disabled={actionsLoading}
                          onClick={() => handleApprove(reviewingBusiness.id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          {actionsLoading ? "Approving..." : "Approve Listing"}
                        </button>
                      )}
                      {reviewingBusiness.status !== "REJECTED" && (
                        <button
                          disabled={actionsLoading}
                          onClick={() => handleReject(reviewingBusiness.id)}
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          {actionsLoading ? "Rejecting..." : "Reject Listing"}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(reviewingBusiness)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => window.open(`/business-profile/${reviewingBusiness.id}`, "_blank")}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        View Public Profile ➔
                      </button>
                    </div>
                  </div>

                  {/* Profile Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      About Description
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      {reviewingBusiness.description || "No description written by business."}
                    </p>
                  </div>

                  {/* Exclusive Discounts Section */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                      🏷️ Exclusive Discounts ({reviewingDiscounts.length})
                    </h4>
                    {reviewingDiscounts.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium italic bg-slate-50 p-4 rounded-xl border border-slate-100">No active discounts listed.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {reviewingDiscounts.map((discount) => (
                          <div key={discount.id} className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white hover:border-[#1C4D8D]/30 transition-all p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              {discount.imageUrl && (
                                <img
                                  src={discount.imageUrl}
                                  alt=""
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = STOREFRONT_FALLBACK;
                                  }}
                                  className="w-12 h-12 object-cover rounded-lg shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-[#1C4D8D] text-[9px] font-black uppercase tracking-wider mb-1">
                                  {discount.discountValue ? `${discount.discountValue}% Off` : "Offer"}
                                </span>
                                <h5 className="font-extrabold text-slate-800 text-xs truncate leading-tight" title={discount.title}>{discount.title}</h5>
                                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                                  Expires: {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            </div>
                            {discount.description && (
                              <p className="text-slate-500 text-[10px] leading-relaxed mt-2.5 line-clamp-2 border-t border-slate-50 pt-2 font-medium">
                                {discount.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Certificates Available Section */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                      🎫 Certificates Available ({reviewingCertificates.length})
                    </h4>
                    {reviewingCertificates.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium italic bg-slate-50 p-4 rounded-xl border border-slate-100">No available certificates listed.</p>
                    ) : (
                      <div className="space-y-3">
                        {reviewingCertificates.map((cert) => {
                          const face = cert.faceValue || 0;
                          const price = cert.memberPrice || 0;
                          const savings = face - price;
                          const pct = face > 0 ? Math.round((savings / face) * 100) : 0;
                          return (
                            <div key={cert.id} className="relative bg-white rounded-2xl p-4 border border-slate-200/60 flex items-center justify-between gap-4 overflow-hidden shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 text-[#1C4D8D] rounded-xl flex items-center justify-center text-lg shrink-0">
                                  🎁
                                </div>
                                <div>
                                  <h5 className="font-extrabold text-slate-800 text-xs leading-tight">
                                    {cert.offer?.title || `Prepaid $${face} Certificate`}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                                    Member Price: <span className="text-[#1C4D8D] font-extrabold">${price}</span> · Face Value: <span className="text-slate-700 font-extrabold">${face}</span>
                                    {savings > 0 && (
                                      <span className="text-emerald-600 font-extrabold ml-1.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        Save ${savings.toFixed(2)} ({pct}% off)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-lg border border-slate-200">
                                {cert.offer?.type === "PREPAID_CERTIFICATE" ? "Prepaid" : "Value-Add"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Contacts & Metadata */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Contact Details
                      </h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="text-slate-400">📞</span> {reviewingBusiness.phone || "No phone listed"}
                        </li>
                        <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="text-slate-400">✉️</span> {reviewingBusiness.email || "No email listed"}
                        </li>
                        <li className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="text-slate-400">🌐</span>{" "}
                          {reviewingBusiness.website ? (
                            <a href={reviewingBusiness.website} target="_blank" rel="noreferrer" className="text-[#1C4D8D] hover:underline truncate max-w-full">
                              {reviewingBusiness.website}
                            </a>
                          ) : (
                            "No website listed"
                          )}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Address Location
                      </h4>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                          <span className="text-slate-400">📍</span>
                          <div>
                            <p>{reviewingBusiness.address || "No address listed"}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">
                              District: {reviewingBusiness.district || "N/A"} · {reviewingBusiness.country || "Cayman Islands"}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Social links */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Social Channels
                    </h4>
                    {(() => {
                      let social = {};
                      if (reviewingBusiness.socialLinks) {
                        try {
                          social = typeof reviewingBusiness.socialLinks === "string"
                            ? JSON.parse(reviewingBusiness.socialLinks)
                            : reviewingBusiness.socialLinks;
                        } catch (e) {
                          social = {};
                        }
                      }
                      const hasSocials = social && (social.facebook || social.instagram || social.twitter);
                      if (!hasSocials) {
                        return <p className="text-xs text-slate-400 font-medium italic">No social media links connected.</p>;
                      }
                      return (
                        <div className="flex gap-2 flex-wrap">
                          {social.facebook && (
                            <a href={social.facebook} target="_blank" rel="noreferrer" className="bg-[#1C4D8D]/5 text-[#1C4D8D] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1C4D8D]/10 transition-all">
                              📘 Facebook
                            </a>
                          )}
                          {social.instagram && (
                            <a href={social.instagram} target="_blank" rel="noreferrer" className="bg-[#1C4D8D]/5 text-[#1C4D8D] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1C4D8D]/10 transition-all">
                              📸 Instagram
                            </a>
                          )}
                          {social.twitter && (
                            <a href={social.twitter} target="_blank" rel="noreferrer" className="bg-[#1C4D8D]/5 text-[#1C4D8D] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#1C4D8D]/10 transition-all">
                              🐦 Twitter
                            </a>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Image Gallery */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Gallery Images
                    </h4>
                    {reviewingBusiness.imageUrls && reviewingBusiness.imageUrls.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {reviewingBusiness.imageUrls.map((url, i) => (
                          <div key={i} className="aspect-square bg-slate-50 border border-slate-100 rounded-xl overflow-hidden cursor-pointer" onClick={() => window.open(url, "_blank")}>
                            <img
                              src={url}
                              alt=""
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800";
                              }}
                              className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No secondary images uploaded.</p>
                    )}
                  </div>

                  {/* Verification Documents */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Uploaded Verification Documents
                    </h4>
                    {reviewingBusiness.documentUrls && reviewingBusiness.documentUrls.length > 0 ? (
                      <ul className="space-y-2">
                        {reviewingBusiness.documentUrls.map((docUrl, i) => (
                          <li key={i}>
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-[#1C4D8D] hover:underline flex items-center gap-1.5"
                            >
                              📄 Verification File Link {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No verification documents uploaded.</p>
                    )}
                  </div>

                  {/* Owner User Status section */}
                  <div className="bg-slate-50 border border-slate-200/70 rounded-[1.5rem] p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Owner Account Settings
                    </h4>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-slate-600 font-bold">
                          Login Email: {reviewingBusiness.user?.email || "—"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Status: {reviewingBusiness.user?.isActive !== false ? "🟢 Active Logins Allowed" : "🔴 Blocked / Deactivated"}
                        </p>
                      </div>
                      <button
                        disabled={actionsLoading}
                        onClick={() => handleToggleUser(reviewingBusiness.user?.id, reviewingBusiness.user?.isActive !== false)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          reviewingBusiness.user?.isActive !== false
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-800"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                        }`}
                      >
                        {reviewingBusiness.user?.isActive !== false ? "Deactivate User" : "Activate User"}
                      </button>
                    </div>
                  </div>

                </div>
                );
              })() : (
                <div className="flex-1 flex items-center justify-center p-12">
                  <p className="text-slate-400 font-medium">Business details could not be found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Edit Business Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-semibold">Change profile text fields and configuration.</p>
              </div>
              <button
                disabled={actionsLoading}
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-8 flex-1">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={editForm.categoryId}
                      onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-bold text-slate-700"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium resize-none"
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Physical Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      value={editForm.district}
                      onChange={(e) => setEditForm((p) => ({ ...p, district: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm((p) => ({ ...p, website: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Cuisine Type (if Dining)
                    </label>
                    <input
                      type="text"
                      value={editForm.cuisineType}
                      onChange={(e) => setEditForm((p) => ({ ...p, cuisineType: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={editForm.logoUrl}
                      onChange={(e) => setEditForm((p) => ({ ...p, logoUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Cover Banner URL
                    </label>
                    <input
                      type="url"
                      value={editForm.coverBannerUrl}
                      onChange={(e) => setEditForm((p) => ({ ...p, coverBannerUrl: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Social media inputs */}
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Social Channels Links
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Facebook</label>
                      <input
                        type="url"
                        value={editForm.facebook}
                        onChange={(e) => setEditForm((p) => ({ ...p, facebook: e.target.value }))}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Instagram</label>
                      <input
                        type="url"
                        value={editForm.instagram}
                        onChange={(e) => setEditForm((p) => ({ ...p, instagram: e.target.value }))}
                        placeholder="https://instagram.com/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Twitter</label>
                      <input
                        type="url"
                        value={editForm.twitter}
                        onChange={(e) => setEditForm((p) => ({ ...p, twitter: e.target.value }))}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3 shrink-0">
                  <button
                    type="button"
                    disabled={actionsLoading}
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionsLoading}
                    className="flex-1 py-3.5 bg-gradient-to-b from-[#1C4D8D] to-[#153a6b] text-white rounded-xl text-sm font-bold hover:from-[#163d71] hover:to-[#0f2a4e] shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {actionsLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProfiles;
