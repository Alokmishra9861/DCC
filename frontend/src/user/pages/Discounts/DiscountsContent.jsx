// Frontend/src/user/pages/Shopping/DiscountsContent.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { discountAPI, getUser, membershipAPI } from "../../../services/api";

const DiscountsContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(getUser());
  const [loading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const [membership, setMembership] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [topBanners, setTopBanners] = useState([]);
  const [midBanners, setMidBanners] = useState([]);
  const [bottomBanners, setBottomBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState({
    top: 0,
    mid: 0,
    bottom: 0,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  useEffect(() => {
    const loadMembership = async () => {
      if (!user || String(user.role || "").toUpperCase() !== "MEMBER") {
        return;
      }
      try {
        setLoadingMembership(true);
        const membershipRes = await membershipAPI.getMy();
        setMembership(membershipRes || null);
      } catch {
        setMembership(null);
      } finally {
        setLoadingMembership(false);
      }
    };
    loadMembership();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => ({
        top: topBanners.length > 0 ? (prev.top + 1) % topBanners.length : 0,
        mid: midBanners.length > 0 ? (prev.mid + 1) % midBanners.length : 0,
        bottom:
          bottomBanners.length > 0
            ? (prev.bottom + 1) % bottomBanners.length
            : 0,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [topBanners.length, midBanners.length, bottomBanners.length]);

  const fetchDiscounts = async () => {
    try {
      const role = String(user?.role || "").toUpperCase();
      const fetchFn =
        role === "BUSINESS" ? discountAPI.getMyOffers : discountAPI.getAll;
      const data = await fetchFn({ type: "DISCOUNT", limit: 100 });
      const list = Array.isArray(data)
        ? data
        : data?.discounts || data?.items || [];
      const normalized = list.map((offer) => {
        const rawValue = Number(offer.discountValue ?? 0);
        const offerType = offer.type || "DISCOUNT";
        const discountType = offerType === "DISCOUNT" ? "percentage" : "fixed";
        const value = rawValue;
        const terms = offer.minSpend
          ? `Minimum spend $${offer.minSpend}`
          : offer.expiryDate
            ? `Valid until ${new Date(offer.expiryDate).toLocaleDateString("en-US")}`
            : "";

        return {
          id: offer.id,
          title: offer.title,
          description: offer.description || "",
          offerType,
          discountType,
          value,
          discountValue: rawValue,
          business: offer.business || null,
          businessId: offer.business?.id || offer.businessId,
          category: offer.business?.category || "",
          isFeatured: false,
          is_featured: false,
          imageUrl: offer.imageUrl || offer.business?.logoUrl,
          terms,
        };
      });
      setDiscounts(normalized);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      setDiscounts([]);
    } finally {
      setLoadingDiscounts(false);
    }
  };

  const fetchBanners = async () => {
    setTopBanners([]);
    setMidBanners([]);
    setBottomBanners([]);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Dining" },
    { value: "groceries", label: "Groceries" },
    { value: "health", label: "Health & Wellness" },
    { value: "auto", label: "Auto & Transport" },
    { value: "home", label: "Home & Garden" },
    { value: "services", label: "Professional Services" },
    { value: "family", label: "Family & Kids" },
    { value: "travel", label: "Travel & Leisure" },
    { value: "retail", label: "Retail" },
    { value: "entertainment", label: "Entertainment" },
  ];

  const filteredDiscounts = discounts.filter((discount) => {
    const categoryValue = discount.category?.slug || discount.category || "";
    const matchesCategory =
      selectedCategory === "all" || categoryValue === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      discount.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.business?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredDiscounts = filteredDiscounts.filter((d) => d.is_featured);
  const regularDiscounts = filteredDiscounts.filter((d) => !d.is_featured);

  const BannerDisplay = ({ banners, position }) => {
    if (!banners || banners.length === 0) return null;
    const currentBanner = banners[currentBannerIndex[position]];
    if (!currentBanner) return null;

    return (
      <div className="w-full mb-12">
        <Link to={currentBanner.link_url || "#"} className="block group">
          <div className="relative w-full h-[240px] bg-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <AppImage
              src={currentBanner.image_url}
              alt={currentBanner.title || "Advertisement"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/20">
              Advertisement
            </div>
          </div>
        </Link>
        {banners.length > 1 && (
          <div className="flex justify-center gap-2.5 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() =>
                  setCurrentBannerIndex((prev) => ({
                    ...prev,
                    [position]: index,
                  }))
                }
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex[position]
                    ? "bg-[#1C4D8D] w-8"
                    : "bg-slate-300 w-2 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin shadow-sm" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Authenticating...
        </p>
      </div>
    );
  }

  const DiscountCard = ({ discount }) => {
    const businessId =
      discount.business?._id || discount.business?.id || discount.businessId;
    const role = String(user?.role || "").toUpperCase();
    const isMember = role === "MEMBER";
    const isBusiness = role === "BUSINESS";
    const isMembershipActive =
      isMember && String(membership?.status || "").toUpperCase() === "ACTIVE";
    const canNavigate =
      Boolean(businessId) && (isBusiness || isMembershipActive);
    const Wrapper = canNavigate ? Link : "button";
    const wrapperProps = canNavigate
      ? { to: `/business-profile/${businessId}` }
      : {
          type: "button",
          onClick: () => {
            if (!user) {
              navigate("/login", { state: { from: location } });
              return;
            }
            navigate("/membership", { state: { reason: "subscribe" } });
          },
        };

    return (
      <Wrapper
        {...wrapperProps}
        className={`bg-white rounded-[2rem] overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(28,77,141,0.15)] transition-all duration-300 flex flex-col h-full group ${
          !canNavigate ? "cursor-pointer" : ""
        }`}
        aria-disabled={!canNavigate}
      >
        <div className="relative h-56 bg-slate-100 overflow-hidden">
          <AppImage
            src={
              discount.imageUrl ||
              discount.image ||
              discount.business?.logoUrl ||
              "https://images.unsplash.com/photo-1542838132-92c53300491e"
            }
            alt={discount.business?.name || "Business"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {discount.isFeatured && (
            <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg">
              Featured
            </div>
          )}
          {!loadingMembership && isMember && !isMembershipActive && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-10 transition-opacity duration-300">
              <div className="text-center transform scale-100 bg-white/10 p-6 rounded-3xl border border-white/20 shadow-2xl">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                  <Icon
                    name="LockClosedIcon"
                    size={20}
                    className="text-white"
                  />
                </div>
                <p className="text-white font-bold text-sm tracking-wide">
                  Subscribe to unlock
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 flex flex-col flex-grow relative bg-white">
          <div className="mb-6">
            <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-[#1C4D8D] transition-colors">
              {discount.business?.name || "Business"}
            </h3>
          </div>

          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/60 rounded-2xl p-5 mb-4 mt-auto group-hover:bg-blue-50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C4D8D] to-indigo-600 font-black text-2xl leading-tight mb-2 relative z-10">
              {discount.discountType === "percentage"
                ? `${discount.value}% off`
                : discount.discountType === "fixed"
                  ? `$${discount.value} off`
                  : discount.title}
            </p>
            <p className="text-sm font-medium text-slate-500 line-clamp-2 relative z-10">
              {discount.description}
            </p>
          </div>
          {discount.terms && (
            <p className="text-[11px] font-medium text-slate-400 mt-2 px-2 uppercase tracking-wider">
              {discount.terms}
            </p>
          )}
        </div>
      </Wrapper>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#1C4D8D]/20 pt-20 md:pt-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#312e81] py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-500 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500 blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-sm"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Member-Exclusive Deals
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 mb-10 font-medium">
              Browse 150+ premium discounts from trusted local businesses across
              the Cayman Islands.
            </p>

            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full group-hover:bg-white/30 transition-all duration-300" />
              <input
                type="text"
                placeholder="Search businesses or discounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full px-8 py-5 pr-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full focus:outline-none focus:bg-white focus:text-slate-900 text-white placeholder:text-white/60 text-lg font-medium transition-all shadow-2xl"
              />
              <Icon
                name="MagnifyingGlassIcon"
                size={24}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-[#1C4D8D] transition-colors z-10 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <BannerDisplay banners={topBanners} position="top" />

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-6 py-3 rounded-full text-[13px] font-bold tracking-wide uppercase transition-all duration-300 shadow-sm ${
                selectedCategory === cat.value
                  ? "bg-gradient-to-r from-[#1C4D8D] to-indigo-600 text-white shadow-lg shadow-blue-900/20 scale-105"
                  : "bg-white text-slate-600 border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Section */}
        {featuredDiscounts.length > 0 && (
          <div className="mb-20">
            <h2
              className="text-3xl font-bold text-slate-900 mb-8 tracking-tight flex items-center gap-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-amber-500">★</span> Featured Discounts
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDiscounts.map((discount) => (
                <DiscountCard key={discount.id} discount={discount} />
              ))}
            </div>
          </div>
        )}

        <BannerDisplay banners={midBanners} position="mid" />

        {/* All Discounts Section */}
        <div className="mb-16">
          <h2
            className="text-3xl font-bold text-slate-900 mb-8 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            All Discounts
          </h2>
          {loadingDiscounts ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin shadow-sm" />
            </div>
          ) : regularDiscounts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
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
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularDiscounts.map((discount) => (
                <DiscountCard key={discount.id} discount={discount} />
              ))}
            </div>
          )}
        </div>

        <BannerDisplay banners={bottomBanners} position="bottom" />
      </div>
    </div>
  );
};

export default DiscountsContent;
