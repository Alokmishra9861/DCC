import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { discountAPI, getUser } from "../../../services/api";

const BrowseDiscountsPublic = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Redirect logged-in users to full browse experience
  useEffect(() => {
    if (user) {
      navigate("/member-dashboard", { replace: true });
    }
  }, [user, navigate]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Beverage" },
    { value: "health", label: "Health & Fitness" },
    { value: "automotive-marine", label: "Automotive & Marine" },
    { value: "home", label: "Home & Garden" },
    { value: "beauty", label: "Beauty Salon & Barber Shop" },
    { value: "electronics", label: "Electronics & Office Supplies" },
    { value: "fashion", label: "Recreational" },
    { value: "construction", label: "Construction" },
    { value: "kids", label: "Kids & Fashion" },
    { value: "retail", label: "Retail" },
  ];

  useEffect(() => {
    discountAPI
      .getAll({ type: "DISCOUNT", limit: 100 })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.discounts || data?.items || [];
        setDiscounts(
          list.map((d) => ({
            id: d._id || d.id,
            businessId: d.business?.id || d.business?._id || d.businessId,
            business: d.business?.name || d.business || "Unknown Business",
            categorySlug:
              d.category?.slug ||
              d.business?.category?.slug ||
              d.business?.categorySlug ||
              (typeof d.business?.category === "string"
                ? d.business.category
                : "") ||
              "",
            location: d.business?.district || d.business?.location || "",
            image: d.imageUrl || d.image || d.business?.logoUrl || "",
            imageAlt: d.title,
            offer:
              (d.type || "DISCOUNT") === "DISCOUNT"
                ? `${d.discountValue || 0}% off`
                : d.type === "VALUE_ADDED_CERTIFICATE"
                  ? `$${d.discountValue || 0} off`
                  : d.title,
            terms: d.terms || "",
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesCategory =
      selectedCategory === "all" || discount.categorySlug === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      discount.business?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.offer?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleViewDetails = (discount) => {
    setSelectedDiscount(discount);
    setShowLoginPrompt(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-20 md:pt-24">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all z-10"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-linear-to-br from-[#1C4D8D] to-[#2563eb] text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Icon
                    name="LockClosedIcon"
                    size={22}
                    className="text-[#1C4D8D]"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                    Exclusive Access
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {selectedDiscount?.business}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-8">
              {/* Offer Preview */}
              {selectedDiscount && (
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    Special Offer
                  </p>
                  <p className="text-transparent bg-clip-text bg-linear-to-r from-[#1C4D8D] to-indigo-600 font-black text-3xl mb-2">
                    {selectedDiscount.offer}
                  </p>
                  {selectedDiscount.terms && (
                    <p className="text-sm text-slate-600">
                      {selectedDiscount.terms}
                    </p>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="mb-8">
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  See Full Details
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Log in to your account or join Discount Club Cayman to view
                  full details, terms, redemption options, and access exclusive
                  member-only offers.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon
                      name="CheckIcon"
                      size={14}
                      className="text-green-700"
                    />
                  </div>
                  <span className="text-sm text-slate-700">
                    Manage and redeem discounts in-store
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon
                      name="CheckIcon"
                      size={14}
                      className="text-green-700"
                    />
                  </div>
                  <span className="text-sm text-slate-700">
                    Access certificates and special deals
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon
                      name="CheckIcon"
                      size={14}
                      className="text-green-700"
                    />
                  </div>
                  <span className="text-sm text-slate-700">
                    Get personalized recommendations
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate("/login");
                  }}
                  className="w-full px-6 py-3 bg-[#1C4D8D] text-white rounded-lg font-bold text-sm hover:bg-[#0F2854] transition-all shadow-md hover:shadow-lg"
                >
                  Log In to Continue
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate("/sign-up");
                  }}
                  className="w-full px-6 py-3 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-lg font-bold text-sm hover:bg-blue-50 transition-all"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="relative bg-white py-12 md:py-16 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/50 via-slate-50/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#1C4D8D]">
            <Icon name="EyeIcon" size={16} />
            Preview Mode - Join to Unlock Full Access
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Browse Exclusive Discounts
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Preview discounts from trusted local businesses. Log in or join to
            manage offers and redeem them in-store.
          </p>

          {/* Quick CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#1C4D8D] text-white rounded-lg font-bold hover:bg-[#0F2854] transition-all shadow-md hover:shadow-lg"
            >
              <Icon name="LockOpenIcon" size={20} />
              <span>Log In to Manage Discounts</span>
            </button>
            <button
              onClick={() => navigate("/sign-up")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-lg font-bold hover:bg-blue-50 transition-all"
            >
              <Icon name="UserPlusIcon" size={20} />
              <span>Join Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-18 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative group">
              <Icon
                name="MagnifyingGlassIcon"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1C4D8D] transition-colors"
              />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white transition-all placeholder:text-slate-400 text-slate-700 shadow-sm font-medium"
              />
            </div>

            {/* Category dropdown */}
            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white appearance-none text-slate-700 font-medium cursor-pointer transition-all shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#1C4D8D] transition-colors">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Listings */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin shadow-sm" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
              Loading discounts...
            </p>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-4xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                name="BuildingStorefrontIcon"
                size={32}
                className="text-slate-400"
              />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">
              No discounts found
            </p>
            <p className="text-slate-500 font-medium">
              Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="bg-white rounded-4xl overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(28,77,141,0.15)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full group"
              >
                {/* Image Section with Lock Overlay */}
                <div className="relative h-60 bg-slate-100 overflow-hidden">
                  <AppImage
                    src={discount.image}
                    alt={discount.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-slate-700 shadow-lg border border-white/50">
                    {discount.categorySlug
                      ? categories.find(
                          (c) => c.value === discount.categorySlug,
                        )?.label || discount.categorySlug
                      : "General"}
                  </div>

                  {/* Lock Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30">
                      <Icon
                        name="LockClosedIcon"
                        size={32}
                        className="text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col grow relative bg-white">
                  {/* Business Name */}
                  <div className="mb-6">
                    <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-[#1C4D8D] transition-colors">
                      {discount.business}
                    </h3>
                    {discount.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Icon
                          name="MapPinIcon"
                          size={16}
                          className="text-slate-400"
                        />
                        {discount.location}
                      </div>
                    )}
                  </div>

                  {/* Offer Display */}
                  <div className="bg-linear-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/60 rounded-2xl p-5 mb-8 mt-auto group-hover:bg-blue-50 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <p className="text-transparent bg-clip-text bg-linear-to-r from-[#1C4D8D] to-indigo-600 font-black text-2xl leading-tight mb-1 relative z-10">
                      {discount.offer}
                    </p>
                    {discount.terms && (
                      <p className="text-xs text-slate-500 font-medium relative z-10 line-clamp-2">
                        {discount.terms}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleViewDetails(discount)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-[#1C4D8D] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                  >
                    View Details
                    <Icon
                      name="ArrowRightIcon"
                      size={18}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Section */}
        {!loading && filteredDiscounts.length > 0 && (
          <div className="mt-20 p-8 md:p-12 bg-linear-to-r from-[#1C4D8D] to-[#2563eb] rounded-4xl text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Saving?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join Discount Club Cayman and unlock access to manage discounts,
                purchase certificates, and redeem offers from your favorite
                businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/sign-up")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#1C4D8D] rounded-lg font-bold hover:bg-slate-100 transition-all shadow-lg"
                >
                  <Icon name="UserPlusIcon" size={20} />
                  Create Account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-all"
                >
                  Already have an account?
                  <Icon name="ArrowRightIcon" size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseDiscountsPublic;
