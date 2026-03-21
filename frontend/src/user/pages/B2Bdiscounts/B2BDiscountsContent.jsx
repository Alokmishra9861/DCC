// Frontend/src/user/pages/B2BDiscounts/B2BDiscountsContent.jsx
// Accessible by: ASSOCIATION (both types), B2B, MEMBER
// Shows B2B offers with real business images

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getUser, discountAPI } from "../../../services/api";
import AppImage from "../../components/ui/AppImage";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />
);

const OfferCard = ({ offer }) => {
  const business = offer.business || {};
  const discount =
    offer.type === "DISCOUNT"
      ? `${offer.discountValue}% off`
      : `$${offer.discountValue} off`;

  // Image priority: business banner → business logo → initials fallback
  const bannerImg = business.imageUrls?.[0] || business.bannerUrl || null;
  const logoImg = business.logoUrl || null;
  const initial = (business.name || "B")[0].toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* ── Image banner ── */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {bannerImg ? (
          <AppImage
            src={bannerImg}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : logoImg ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C4D8D]/8 to-[#4988C4]/8">
            <AppImage
              src={logoImg}
              alt={business.name}
              className="h-20 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C4D8D]/10 to-[#4988C4]/10">
            <div className="w-16 h-16 bg-[#1C4D8D]/20 rounded-2xl flex items-center justify-center">
              <span className="text-[#1C4D8D] font-black text-2xl">
                {initial}
              </span>
            </div>
          </div>
        )}

        {/* Overlapping logo badge when banner is present */}
        {bannerImg && logoImg && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white shadow-md overflow-hidden border border-white">
            <AppImage
              src={logoImg}
              alt={business.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
        )}

        {/* B2B tag */}
        <span className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 bg-[#1C4D8D] text-white rounded-full uppercase tracking-wide shadow-sm">
          B2B
        </span>

        {/* Category badge */}
        {business.category?.name && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 bg-white/90 text-slate-700 rounded-full shadow-sm backdrop-blur-sm">
            {business.category.name}
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="p-5">
        <div className="mb-3">
          <p className="font-bold text-slate-900 truncate">
            {business.name || "—"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {business.district || "Cayman Islands"}
          </p>
        </div>

        {offer.title && (
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {offer.title}
          </p>
        )}

        {/* Discount highlight */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-center">
          <p className="text-xl font-black text-[#1C4D8D]">{discount}</p>
          {offer.minSpend && (
            <p className="text-xs text-slate-400 mt-0.5">
              Min spend: ${offer.minSpend}
            </p>
          )}
        </div>

        {offer.expiryDate && (
          <p className="text-xs text-slate-400 mb-3">
            Valid until{" "}
            {new Date(offer.expiryDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        <Link
          to={`/business-profile/${business.id || offer.businessId}`}
          className="block w-full text-center py-2.5 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-xl text-sm font-bold hover:bg-[#1C4D8D] hover:text-white transition-all"
        >
          View Business
        </Link>
      </div>
    </div>
  );
};

const B2BDiscountsContent = ({ embedded = false }) => {
  const user = getUser();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { isB2B: true, limit: 40 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await discountAPI.getAll(params);
      const list = Array.isArray(res)
        ? res
        : (res?.discounts ?? res?.data ?? []);
      setOffers(list);
      // Extract unique categories for filter pill
      const cats = [
        ...new Set(list.map((o) => o.business?.category?.name).filter(Boolean)),
      ];
      setCategories(cats);
    } catch (err) {
      setError(err.message || "Failed to load B2B discounts");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = offers.filter((o) => {
    if (category && o.business?.category?.name !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.business?.name?.toLowerCase().includes(q) ||
        o.title?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={embedded ? "" : "min-h-screen bg-slate-50/60"}>
      <div className={embedded ? "px-5 py-6" : "max-w-7xl mx-auto px-5 py-10"}>
        {/* Header */}
        <div className="mb-7">
          {!embedded && (
            <p className="text-xs font-bold uppercase tracking-widest text-[#1C4D8D] mb-1">
              Association Network
            </p>
          )}
          <h1
            className={`font-black text-slate-900 mb-1 ${embedded ? "text-xl" : "text-3xl"}`}
          >
            B2B Discounts
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Exclusive business-to-business offers through your association
            network.
            {user?.role === "ASSOCIATION" &&
              " Share these with your members and partners."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search businesses or offers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors"
            />
          </div>
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors cursor-pointer text-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▾
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <p className="text-xs text-slate-400 mb-5">
            {filtered.length} offer{filtered.length !== 1 ? "s" : ""} available
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: embedded ? 4 : 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🤝
            </div>
            <p className="font-bold text-slate-700 mb-1">No B2B offers yet</p>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              {user?.role === "ASSOCIATION"
                ? "Add businesses to your association network to see their B2B offers here."
                : "Your association hasn't added any B2B offers yet."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default B2BDiscountsContent;
