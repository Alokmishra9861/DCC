// Frontend/src/user/pages/Shopping/BrowseDiscounts.jsx
// CHANGES FROM ORIGINAL (minimal — all existing design kept):
//   1. Reads ?category= URL param on mount → pre-selects the filter dropdown
//   2. Updates URL when filter changes (shareable links)
//   3. Shows filtered header + "Back to Categories" when a category is active
//   4. Category values in dropdown now match the slugs used in Categories.jsx
//   Everything else is IDENTICAL to your original BrowseDiscountsContent.

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { discountAPI, getUser } from "../../../services/api";

const BrowseDiscountsContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Read ?category= from URL on mount ────────────────────────────────────
  const getInitialCategory = () => {
    const params = new URLSearchParams(location.search);
    return params.get("category") || "all";
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDealType, setSelectedDealType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  // Category name for the header — passed via navigate state from Categories.jsx
  const categoryNameFromState = location.state?.categoryName;

  // Convert slug → display label for the header when state isn't available
  const slugToLabel = (slug) =>
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const activeCategoryLabel =
    selectedCategory !== "all"
      ? categoryNameFromState || slugToLabel(selectedCategory)
      : null;

  // Re-sync if user hits browser back/forward
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get("category") || "all");
  }, [location.search]);

  // Update URL when dropdown changes so the link stays shareable
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    const params = new URLSearchParams(location.search);
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
  };

  // ── Category values MUST match the slugs used in Categories.jsx ──────────
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
    { value: "b2b", label: "B2B Members" },
  ];

  const locations = [
    { value: "all", label: "All Locations" },
    { value: "george-town", label: "George Town" },
    { value: "west-bay", label: "West Bay" },
    { value: "bodden-town", label: "Bodden Town" },
    { value: "east-end", label: "East End" },
    { value: "north-side", label: "North Side" },
  ];

  const dealTypes = [
    { value: "all", label: "All Deals" },
    { value: "percentage", label: "Percentage Off" },
    { value: "fixed", label: "Fixed Discount" },
    { value: "certificate", label: "Certificate" },
  ];

  useEffect(() => {
    const role = String(user?.role || "").toUpperCase();
    const fetchFn =
      role === "BUSINESS" ? discountAPI.getMyOffers : discountAPI.getAll;

    fetchFn({ type: "DISCOUNT", limit: 100 })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.discounts || data?.items || [];
        setDiscounts(
          list.map((d) => ({
            id: d._id || d.id,
            businessId: d.business?.id || d.business?._id || d.businessId,
            business: d.business?.name || d.business || "Unknown Business",
            // Pull category slug from wherever the backend stores it
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
            dealType: d.type || "DISCOUNT",
            memberOnly: false,
            terms: d.terms || "",
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesCategory =
      selectedCategory === "all" || discount.categorySlug === selectedCategory;

    const matchesLocation =
      selectedLocation === "all" ||
      discount.location
        ?.toLowerCase()
        .includes(selectedLocation.replace(/-/g, " "));

    const matchesSearch =
      !searchQuery ||
      discount.business?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.offer?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesLocation && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Employer Read-Only Notice */}
      {user && String(user.role || "").toUpperCase() === "EMPLOYER" && (
        <div className="bg-blue-50 border-b border-blue-200 py-3">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 text-blue-900">
              <Icon
                name="InformationCircleIcon"
                size={18}
                className="text-blue-600"
              />
              <p className="text-sm font-medium">
                📊 <strong>Analytics View:</strong> Viewing available discounts
                and categories for employee insights. This is read-only for
                informational purposes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back link — only shown when coming from a category */}
          {activeCategoryLabel && (
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-[#1C4D8D] font-semibold text-sm mb-5 hover:underline"
            >
              <Icon name="ArrowLeftIcon" size={16} />
              Back to Categories
            </Link>
          )}

          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            {user && String(user.role || "").toUpperCase() === "EMPLOYER"
              ? activeCategoryLabel
                ? `${activeCategoryLabel} (Analytics View)`
                : "Browse Categories for Insights"
              : activeCategoryLabel
                ? `${activeCategoryLabel}`
                : "Browse Exclusive Discounts"}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
            {user && String(user.role || "").toUpperCase() === "EMPLOYER"
              ? activeCategoryLabel
                ? `Showing discounts available in ${activeCategoryLabel} for employee reference.`
                : "View category breakdowns to understand where your employees accrue savings."
              : activeCategoryLabel
                ? `Showing member discounts in ${activeCategoryLabel} across the Cayman Islands.`
                : "Explore 150+ discounts from trusted local businesses across Cayman Islands."}
          </p>

          {/* Active filter pill with clear button */}
          {activeCategoryLabel && (
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C4D8D] text-white rounded-full text-sm font-bold">
                <Icon name="TagIcon" size={14} />
                {activeCategoryLabel}
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="ml-1 hover:text-blue-200 transition-colors"
                  title="Clear filter"
                >
                  <Icon name="XMarkIcon" size={14} />
                </button>
              </span>
              <span className="text-sm text-slate-500">
                {filteredDiscounts.length} result
                {filteredDiscounts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters — sticky bar (unchanged) */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>

            {/* Category dropdown — now drives URL */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] appearance-none text-slate-700 cursor-pointer transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] appearance-none text-slate-700 cursor-pointer transition-all"
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>

            {/* Deal type */}
            <div className="relative">
              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] appearance-none text-slate-700 cursor-pointer transition-all"
              >
                {dealTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>
          </div>

          <button className="mt-4 flex items-center gap-2 text-[#1C4D8D] font-bold text-sm hover:gap-3 transition-all px-2">
            <Icon name="MapPinIcon" size={18} />
            Find Near Me
          </button>
        </div>
      </div>

      {/* Discount Listings */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-24">
            <Icon
              name="BuildingStorefrontIcon"
              size={64}
              className="text-muted-foreground mx-auto mb-4"
            />
            <p className="text-xl text-slate-500 mb-2">
              {activeCategoryLabel
                ? `No discounts found in ${activeCategoryLabel}.`
                : "No discounts found matching your criteria."}
            </p>
            <div className="flex gap-3 justify-center mt-6">
              {selectedCategory !== "all" && (
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-semibold text-sm"
                >
                  Show All Discounts
                </button>
              )}
              <Link
                to="/categories"
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full"
              >
                <div className="relative h-56 bg-slate-200 overflow-hidden">
                  {discount.memberOnly && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity duration-300">
                      <div className="text-center transform scale-100">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20">
                          <Icon
                            name="LockClosedIcon"
                            size={24}
                            className="text-white"
                          />
                        </div>
                        <p className="text-white font-bold text-lg tracking-wide">
                          Member Only
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          Join to unlock
                        </p>
                      </div>
                    </div>
                  )}
                  <AppImage
                    src={discount.image}
                    alt={discount.imageAlt}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      discount.memberOnly
                        ? "blur-sm scale-105"
                        : "group-hover:scale-110"
                    }`}
                  />
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-100">
                    {/* Show category label if available */}
                    {discount.categorySlug
                      ? categories.find(
                          (c) => c.value === discount.categorySlug,
                        )?.label || discount.categorySlug
                      : "General"}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="font-heading text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-[#1C4D8D] transition-colors">
                      {discount.business}
                    </h3>
                    {discount.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Icon
                          name="MapPinIcon"
                          size={16}
                          className="text-slate-400"
                        />
                        {discount.location}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 mt-auto group-hover:bg-blue-50 transition-colors">
                    <p className="text-[#1C4D8D] font-bold text-lg leading-tight">
                      {discount.offer}
                    </p>
                    {discount.terms && (
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        {discount.terms}
                      </p>
                    )}
                  </div>

                  {discount.businessId ? (
                    <Link
                      to={`/business-profile/${discount.businessId}`}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#1C4D8D] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <Icon
                        name="ArrowRightIcon"
                        size={18}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="w-full py-3 bg-slate-200 text-slate-500 rounded-xl font-bold cursor-not-allowed"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA — unchanged */}
      <div className="bg-gradient-to-br from-[#1C4D8D] to-[#153e75] py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Unlock All Member-Only Deals
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join now and get instant access to exclusive discounts worth
            thousands.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1C4D8D] rounded-xl text-lg font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Join Now
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrowseDiscountsContent;
