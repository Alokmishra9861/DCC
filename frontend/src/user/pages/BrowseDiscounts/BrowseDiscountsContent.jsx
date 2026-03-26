// Frontend/src/user/pages/Shopping/BrowseDiscounts.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { discountAPI, getUser } from "../../../services/api";

const BrowseDiscountsContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const categoryNameFromState = location.state?.categoryName;

  const slugToLabel = (slug) =>
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const activeCategoryLabel =
    selectedCategory !== "all"
      ? categoryNameFromState || slugToLabel(selectedCategory)
      : null;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get("category") || "all");
  }, [location.search]);

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
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#1C4D8D]/20 pt-20 md:pt-24">
      {/* Employer Read-Only Notice */}
      {user && String(user.role || "").toUpperCase() === "EMPLOYER" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex items-center gap-3 text-blue-900">
              <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center flex-shrink-0">
                <Icon
                  name="InformationCircleIcon"
                  size={18}
                  className="text-blue-600"
                />
              </div>
              <p className="text-sm font-medium">
                <strong>Analytics View:</strong> Viewing available discounts and
                categories for employee insights. This is read-only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="relative bg-white py-12 md:py-16 border-b border-slate-200/60 overflow-hidden">
        {/* Soft glowing background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          {activeCategoryLabel && (
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-500 font-semibold text-sm mb-8 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200/60"
            >
              <Icon name="ArrowLeftIcon" size={16} />
              Back to Categories
            </Link>
          )}

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {user && String(user.role || "").toUpperCase() === "EMPLOYER"
              ? activeCategoryLabel
                ? `${activeCategoryLabel} Insights`
                : "Browse Categories"
              : activeCategoryLabel
                ? activeCategoryLabel
                : "Exclusive Discounts"}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {user && String(user.role || "").toUpperCase() === "EMPLOYER"
              ? activeCategoryLabel
                ? `Showing discounts available in ${activeCategoryLabel} for employee reference.`
                : "View category breakdowns to understand where your employees accrue savings."
              : activeCategoryLabel
                ? `Showing member discounts in ${activeCategoryLabel} across the Cayman Islands.`
                : "Explore 150+ premium discounts from trusted local businesses across the Cayman Islands."}
          </p>

          {activeCategoryLabel && (
            <div className="mt-8 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1C4D8D] to-indigo-700 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-900/20">
                <Icon name="TagIcon" size={14} className="opacity-80" />
                {activeCategoryLabel}
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Clear filter"
                >
                  <Icon name="XMarkIcon" size={14} />
                </button>
              </span>
              <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-4 py-2.5 rounded-full border border-slate-200/60">
                {filteredDiscounts.length} Result
                {filteredDiscounts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters — Glassmorphism sticky bar */}
      <div className="sticky top-[72px] z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onChange={(e) => handleCategoryChange(e.target.value)}
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

            {/* Location dropdown */}
            <div className="relative group">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white appearance-none text-slate-700 font-medium cursor-pointer transition-all shadow-sm"
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#1C4D8D] transition-colors">
                <Icon name="ChevronDownIcon" size={16} />
              </div>
            </div>

            {/* Deal type dropdown */}
            <div className="relative group flex gap-3">
              <div className="relative flex-1">
                <select
                  value={selectedDealType}
                  onChange={(e) => setSelectedDealType(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] focus:bg-white appearance-none text-slate-700 font-medium cursor-pointer transition-all shadow-sm"
                >
                  {dealTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-[#1C4D8D] transition-colors">
                  <Icon name="ChevronDownIcon" size={16} />
                </div>
              </div>
              <button
                title="Find Near Me"
                className="w-12 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200/80 rounded-2xl text-[#1C4D8D] hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
              >
                <Icon name="MapPinIcon" size={20} />
              </button>
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
              Loading offers...
            </p>
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                name="BuildingStorefrontIcon"
                size={32}
                className="text-slate-400"
              />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">
              {activeCategoryLabel
                ? `No discounts found in ${activeCategoryLabel}`
                : "No discounts found"}
            </p>
            <p className="text-slate-500 font-medium">
              Try adjusting your filters or search query.
            </p>

            <div className="flex gap-4 justify-center mt-8">
              {selectedCategory !== "all" && (
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md"
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/categories"
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
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
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(28,77,141,0.15)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full group"
              >
                <div className="relative h-60 bg-slate-100 overflow-hidden">
                  {discount.memberOnly && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-10 transition-opacity duration-300">
                      <div className="text-center transform scale-100 bg-white/10 p-6 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                          <Icon
                            name="LockClosedIcon"
                            size={24}
                            className="text-white"
                          />
                        </div>
                        <p className="text-white font-bold text-lg tracking-wide mb-1">
                          Member Only
                        </p>
                        <p className="text-white/80 text-sm font-medium">
                          Join to unlock
                        </p>
                      </div>
                    </div>
                  )}
                  <AppImage
                    src={discount.image}
                    alt={discount.imageAlt}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                      discount.memberOnly
                        ? "blur-sm scale-110"
                        : "group-hover:scale-105"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-slate-700 shadow-lg border border-white/50">
                    {discount.categorySlug
                      ? categories.find(
                          (c) => c.value === discount.categorySlug,
                        )?.label || discount.categorySlug
                      : "General"}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow relative bg-white">
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

                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/60 rounded-2xl p-5 mb-8 mt-auto group-hover:bg-blue-50 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C4D8D] to-indigo-600 font-black text-2xl leading-tight mb-1 relative z-10">
                      {discount.offer}
                    </p>
                    {discount.terms && (
                      <p className="text-xs text-slate-500 font-medium relative z-10 line-clamp-2">
                        {discount.terms}
                      </p>
                    )}
                  </div>

                  {discount.businessId ? (
                    <Link
                      to={`/business-profile/${discount.businessId}`}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-[#1C4D8D] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
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
                      className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm cursor-not-allowed"
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

      {/* Bottom CTA */}
      <div className="bg-gradient-to-br from-[#1C4D8D] via-[#1e3a8a] to-[#312e81] py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-400 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Unlock All Member-Only Deals
          </h2>
          <p className="text-lg md:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto font-medium">
            Join now and get instant access to premium exclusive discounts worth
            thousands across the islands.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1C4D8D] rounded-2xl text-lg font-black hover:bg-slate-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-1"
          >
            Join the Club
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrowseDiscountsContent;
