import React, { useEffect, useRef, useState, useCallback } from "react";
import Icon from "../../components/ui/AppIcon";
import { QRCodeSVG } from "qrcode.react";
import AppImage from "../../components/ui/AppImage";
import { Link } from "react-router-dom";
import {
  getUser,
  memberAPI,
  discountAPI,
  businessAPI,
  travelAPI,
  certificateAPI,
} from "../../../services/api";

// ─── Safe array helper — never lets a bad API response break the UI ──────────
const toArray = (val, fallbackKeys = []) => {
  if (Array.isArray(val)) return val;
  for (const key of fallbackKeys) {
    if (Array.isArray(val?.[key])) return val[key];
  }
  return [];
};

const MemberDashboardContent = () => {
  // ── Stable user ref — never recreated, never triggers useEffect re-run ─────
  const userRef = useRef(getUser());
  const user = userRef.current;

  const [memberProfile, setMemberProfile] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [newDiscounts, setNewDiscounts] = useState([]);
  const [providerDirectory, setProviderDirectory] = useState([]);
  const [travelDeals, setTravelDeals] = useState([]);
  const [unbeatableDeals, setUnbeatableDeals] = useState([]);
  const [newCertificates, setNewCertificates] = useState([]);
  const [hotCertificates, setHotCertificates] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [savingsSummary, setSavingsSummary] = useState(null);

  // ── Single loading flag — true only on the very first load ────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  // Track whether we've already fetched so StrictMode double-invoke is harmless
  const hasFetched = useRef(false);

  // ── QR rotation interval ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const userId = user?.id || user?._id || "UNKNOWN";
    setQrCodeData(`DCC-MEMBER-${userId}-${Date.now()}`);

    const qrInterval = setInterval(
      () => {
        setQrCodeData(`DCC-MEMBER-${userId}-${Date.now()}`);
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(qrInterval);
  }, []); // empty deps — runs once, user comes from ref

  // ── Data fetch — runs once, never re-runs on re-renders ──────────────────
  const fetchDashboardData = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const [
        profileRes,
        savingsRes,
        txnRes,
        discountsRes,
        businessesRes,
        travelRes,
        certsRes,
      ] = await Promise.allSettled([
        memberAPI.getProfile(),
        memberAPI.getSavings("lifetime"),
        memberAPI.getTransactions({ limit: 5, page: 1 }),
        discountAPI.getAll({ limit: 6 }),
        businessAPI.getAll({ limit: 10 }),
        // Use getAll() — /api/travel. search() also maps here now
        travelAPI.getAll({ limit: 3 }),
        certificateAPI.getMy(),
      ]);

      // ── Profile + QR ──────────────────────────────────────────────────────
      if (profileRes.status === "fulfilled" && profileRes.value) {
        const profile = profileRes.value;
        setMemberProfile(profile);
        const userId = profile?.userId || user?.id || user?._id || "UNKNOWN";
        if (profile?.qrCode) {
          setQrCodeData(profile.qrCode);
        } else {
          setQrCodeData(`DCC-MEMBER-${userId}-${Date.now()}`);
        }
      }

      // ── Savings ───────────────────────────────────────────────────────────
      if (savingsRes.status === "fulfilled") {
        setSavingsSummary(
          savingsRes.value?.summary ?? savingsRes.value ?? null,
        );
      }

      // ── Transactions ──────────────────────────────────────────────────────
      if (txnRes.status === "fulfilled") {
        const list = toArray(txnRes.value, ["transactions", "items"]);
        setRecentTransactions(list.slice(0, 5));
      }

      // ── Discounts ─────────────────────────────────────────────────────────
      if (discountsRes.status === "fulfilled") {
        const list = toArray(discountsRes.value, [
          "discounts",
          "data",
          "items",
        ]);
        setNewDiscounts(list.slice(0, 6));
        setUnbeatableDeals(list.slice(0, 5));
      }

      // ── Businesses / provider directory ───────────────────────────────────
      if (businessesRes.status === "fulfilled") {
        const list = toArray(businessesRes.value, [
          "businesses",
          "data",
          "items",
        ]);
        setProviderDirectory(list.slice(0, 10));
      }

      // ── Travel deals ──────────────────────────────────────────────────────
      if (travelRes.status === "fulfilled") {
        const list = toArray(travelRes.value, [
          "results",
          "items",
          "data",
          "deals",
        ]);
        setTravelDeals(list.slice(0, 3));
      }
      // If travel fails (API not configured) we just show the empty state — no crash

      // ── Certificates ──────────────────────────────────────────────────────
      if (certsRes.status === "fulfilled") {
        const list = toArray(certsRes.value, ["certificates", "items", "data"]);
        setNewCertificates(list.slice(0, 3));
        setHotCertificates(list.slice(0, 4));
      }
    } catch (error) {
      // Unexpected error — log but don't crash the dashboard
      console.error("Dashboard fetch error:", error);
    } finally {
      // Only set loading false once — prevents the flicker from a second render
      setInitialLoading(false);
    }
  }, []); // no deps — stable function, runs once

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Derived display values ────────────────────────────────────────────────
  const buildDisplayName = () => {
    const firstName = (memberProfile?.firstName || "").trim();
    const lastName = (memberProfile?.lastName || "").trim();
    if (firstName || lastName) {
      if (
        firstName &&
        lastName &&
        firstName.toLowerCase() === lastName.toLowerCase()
      ) {
        return firstName;
      }
      return [firstName, lastName].filter(Boolean).join(" ").trim();
    }
    const fallback =
      (user?.name || "").trim() || user?.email?.split("@")?.[0] || "Member";
    const parts = fallback.split(/\s+/).filter(Boolean);
    if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase())
      return parts[0];
    return fallback;
  };

  const displayName = buildDisplayName();
  const membershipStatusRaw = memberProfile?.membership?.status || "not active";
  const isMembershipActive = membershipStatusRaw.toLowerCase() === "active";
  const membershipStatus = membershipStatusRaw.toUpperCase();

  const getQrValue = () => {
    const userId = user?.id || user?._id || "UNKNOWN";
    let value = qrCodeData || `DCC-MEMBER-${userId}-${Date.now()}`;
    if (typeof value !== "string") {
      try {
        value = JSON.stringify(value);
      } catch {
        value = `DCC-MEMBER-${userId}`;
      }
    }
    return value.length > 300 ? value.slice(0, 300) : value;
  };

  // ── Loading skeleton — shown only on first paint ──────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-green-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ── Inactive membership banner ────────────────────────────────── */}
        {!isMembershipActive && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-700">
                Membership inactive
              </p>
              <p className="text-slate-700 mt-1">
                Activate your membership to access discounts, travel deals, and
                your QR code.
              </p>
            </div>
            <Link
              to="/membership"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#1C4D8D] text-white font-semibold hover:bg-[#0F2854] transition-colors"
            >
              Activate Membership
            </Link>
          </div>
        )}

        {/* ── Membership Card ───────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] p-8 md:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    Discount Club Cayman
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      isMembershipActive
                        ? "bg-green-400/20 text-green-200 border-green-400/30"
                        : "bg-red-400/20 text-red-200 border-red-400/30"
                    }`}
                  >
                    {membershipStatus}
                  </span>
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
                  {displayName}
                </h1>
                <p className="text-blue-200 font-medium">
                  {memberProfile?.membership?.tier || "Standard"} Member
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 min-w-[110px]">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                    Member Since
                  </p>
                  <p className="text-white font-bold">
                    {memberProfile?.membership?.startDate
                      ? new Date(
                          memberProfile.membership.startDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "–"}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 min-w-[110px]">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
                    Expires
                  </p>
                  <p className="text-white font-bold">
                    {memberProfile?.membership?.expiryDate
                      ? new Date(
                          memberProfile.membership.expiryDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "–"}
                  </p>
                </div>
                <button
                  onClick={() => setShowQRModal(true)}
                  disabled={!isMembershipActive}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-2xl px-5 py-4 border border-white/30 flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/20"
                >
                  <Icon name="QrCodeIcon" size={26} className="text-white" />
                  <p className="text-white text-xs font-bold uppercase tracking-wide">
                    {isMembershipActive ? "Member QR" : "Activate to Access"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Savings Summary ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: "BanknotesIcon",
              iconColor: "text-[#1C4D8D]",
              bgColor: "bg-blue-50",
              label: "Total Saved",
              value: `$${(savingsSummary?.totalSavings || 0).toFixed(2)}`,
              valueColor: "text-[#1C4D8D]",
              sub: "Lifetime savings to date",
            },
            {
              icon: "CreditCardIcon",
              iconColor: "text-slate-500",
              bgColor: "bg-slate-50",
              label: "Membership Cost",
              value: `$${(savingsSummary?.membershipCost || 89.99).toFixed(2)}`,
              valueColor: "text-slate-700",
              sub: "Annual membership fee",
            },
            {
              icon: "ArrowTrendingUpIcon",
              iconColor: "text-emerald-600",
              bgColor: "bg-emerald-50",
              label: "ROI Multiplier",
              value: `${(savingsSummary?.roi || 0).toFixed(1)}×`,
              valueColor: "text-emerald-600",
              sub: "Return on investment",
            },
          ].map(
            ({ icon, iconColor, bgColor, label, value, valueColor, sub }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}
                  >
                    <Icon name={icon} size={22} className={iconColor} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    {label}
                  </p>
                </div>
                <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
            ),
          )}
        </div>

        {/* ── Recent Activity ───────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-slate-900">
              Recent Activity
            </h2>
            <Link
              to="/browse-discounts"
              className="text-[#1C4D8D] font-semibold hover:underline text-sm flex items-center gap-1"
            >
              View All <Icon name="ArrowRightIcon" size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {recentTransactions.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                <Icon
                  name="ClockIcon"
                  size={36}
                  className="mx-auto mb-3 text-slate-200"
                />
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm mt-1">
                  Start saving by using your member discounts at local
                  businesses.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentTransactions.map((tx, i) => (
                  <li
                    key={tx.id || tx._id || i}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {tx.business?.logoUrl ? (
                        <AppImage
                          src={tx.business.logoUrl}
                          alt={tx.business.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Icon
                          name="BuildingStorefrontIcon"
                          size={20}
                          className="text-[#1C4D8D]"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {tx.business?.name || "Business"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {tx.offer?.title || tx.type || "Discount"} ·{" "}
                        {new Date(
                          tx.transactionDate || tx.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-emerald-600">
                        −${(tx.savingsAmount || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">
                        ${(tx.saleAmount || 0).toFixed(2)} spent
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Quick Links ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            {
              to: "/travel",
              icon: "GlobeAltIcon",
              title: "Travel Deals",
              sub: "Hotels & flights",
              dark: false,
            },
            {
              to: "/browse-discounts",
              icon: "TagIcon",
              title: "Discounts",
              sub: "Local savings",
              dark: false,
            },
            {
              to: "/certification",
              icon: "TicketIcon",
              title: "Certificates",
              sub: "High-value certs",
              dark: false,
            },
          ].map(({ to, icon, title, sub }) => (
            <Link
              key={to}
              to={to}
              className="group relative overflow-hidden bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors" />
              <div className="relative z-10">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={icon} size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1">
                  {title}
                </h3>
                <p className="text-blue-100 text-sm">{sub}</p>
              </div>
            </Link>
          ))}
          <button
            onClick={() => setShowQRModal(true)}
            disabled={!isMembershipActive}
            className="group relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full text-left disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon name="QrCodeIcon" size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1">
                Member QR
              </h3>
              <p className="text-slate-300 text-sm">
                {isMembershipActive
                  ? "Show to redeem"
                  : "Activate membership first"}
              </p>
            </div>
          </button>
        </div>

        {/* ── Travel Deals ──────────────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">
              Featured Travel Deals
            </h2>
            <Link
              to="/travel"
              className="text-[#1C4D8D] font-semibold hover:underline flex items-center gap-1"
            >
              View All <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {travelDeals.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400">
                <Icon
                  name="GlobeAltIcon"
                  size={40}
                  className="mx-auto mb-3 text-slate-200"
                />
                <p>
                  Travel deals will appear here once the travel API is
                  configured.
                </p>
                <Link
                  to="/travel"
                  className="text-[#1C4D8D] font-semibold mt-2 inline-block"
                >
                  Browse travel →
                </Link>
              </div>
            ) : (
              travelDeals.map((deal) => (
                <div
                  key={deal.id || deal._id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {(deal.image_url || deal.imageUrl || deal.image) && (
                      <AppImage
                        src={deal.image_url || deal.imageUrl || deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                        {deal.title || deal.name}
                      </h3>
                      <p className="text-white/90 text-sm line-clamp-1">
                        {deal.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">
                          Member Price
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-[#1C4D8D]">
                            $
                            {deal.member_price ||
                              deal.memberPrice ||
                              deal.price ||
                              "–"}
                          </span>
                          {(deal.regular_price || deal.regularPrice) && (
                            <span className="text-sm text-slate-400 line-through">
                              ${deal.regular_price || deal.regularPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to="/travel"
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-[#1C4D8D] hover:text-white transition-all duration-300"
                      >
                        View Deal
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── New Local Discounts ───────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">
              New Local Discounts
            </h2>
            <Link
              to="/discounts"
              className="text-[#1C4D8D] font-semibold hover:underline flex items-center gap-1"
            >
              View All <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {newDiscounts.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400">
                <Icon
                  name="TagIcon"
                  size={40}
                  className="mx-auto mb-3 text-slate-200"
                />
                <p>
                  No discounts yet.{" "}
                  <Link
                    to="/browse-discounts"
                    className="text-[#1C4D8D] font-semibold"
                  >
                    Browse discounts →
                  </Link>
                </p>
              </div>
            ) : (
              newDiscounts.map((discount) => (
                <div
                  key={discount.id || discount._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 bg-white p-1">
                      {discount.business?.logoUrl ? (
                        <AppImage
                          src={discount.business.logoUrl}
                          alt={discount.business?.name}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-xl">
                          <Icon
                            name="BuildingStorefrontIcon"
                            size={24}
                            className="text-slate-400"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                        {discount.business?.name || "Business"}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {discount.category?.name ||
                          discount.business?.category ||
                          "General"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-5 mb-5 border border-blue-100">
                    <p className="text-lg font-bold text-[#1C4D8D] text-center">
                      {discount.discountValue
                        ? `${discount.discountValue}% off`
                        : discount.title}
                    </p>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                    {discount.description}
                  </p>
                  <Link
                    to={`/business-profile/${discount.business?.id || discount.businessId}`}
                    className="w-full block text-center py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Unbeatable Deals (horizontal scroll) ─────────────────────── */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-8">
            Unbeatable Deals
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            {unbeatableDeals.length === 0 ? (
              <p className="text-slate-400 py-8 px-4">
                Check back soon for unbeatable deals!
              </p>
            ) : (
              unbeatableDeals.map((banner) => (
                <Link
                  key={banner.id || banner._id}
                  to="/browse-discounts"
                  className="flex-shrink-0 w-[85vw] md:w-[400px] snap-center bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group/card"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {(banner.image || banner.imageUrl) && (
                      <AppImage
                        src={banner.image || banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="px-2 py-1 bg-[#1C4D8D] text-white text-xs font-bold rounded-md mb-2 inline-block">
                        Featured
                      </span>
                      <h3 className="font-bold text-white text-xl leading-tight">
                        {banner.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      {banner.business?.name || ""}
                    </p>
                    <span className="text-[#1C4D8D] text-sm font-bold flex items-center gap-1">
                      Check it out <Icon name="ArrowRightIcon" size={14} />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* ── New Certificates ──────────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900">
              New Certificates
            </h2>
            <Link
              to="/certification"
              className="text-[#1C4D8D] font-semibold hover:underline flex items-center gap-1"
            >
              View All <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {newCertificates.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-400">
                <Icon
                  name="TicketIcon"
                  size={40}
                  className="mx-auto mb-3 text-slate-200"
                />
                <p>
                  No certificates yet.{" "}
                  <Link
                    to="/certification"
                    className="text-[#1C4D8D] font-semibold"
                  >
                    Browse certificates →
                  </Link>
                </p>
              </div>
            ) : (
              newCertificates.map((cert) => (
                <div
                  key={cert.id || cert._id}
                  className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-slate-50 rounded-[1.4rem] p-6 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-1">
                        <Icon
                          name="TicketIcon"
                          size={24}
                          className="text-slate-400"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {cert.title || cert.offer?.title || "Certificate"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {cert.offer?.business?.name || ""}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                        <span className="text-sm text-slate-500">
                          Face Value
                        </span>
                        <span className="text-lg font-bold text-slate-900 line-through decoration-slate-400 decoration-2">
                          ${cert.faceValue || "–"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#1C4D8D] to-[#4988C4] rounded-xl text-white shadow-md">
                        <span className="text-sm font-medium opacity-90">
                          Your Price
                        </span>
                        <span className="text-2xl font-bold">
                          ${cert.memberPrice || "–"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">
                        {cert.status || ""}
                      </span>
                      <Link
                        to="/certification"
                        className="text-sm font-bold text-[#1C4D8D] hover:underline"
                      >
                        Purchase Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── HOT Certificates ──────────────────────────────────────────── */}
        {hotCertificates.length > 0 && (
          <div className="mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4988C4] to-[#BDE8F5] shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                    <Icon
                      name="FireIcon"
                      size={28}
                      className="text-[#1C4D8D]"
                      variant="solid"
                    />
                  </div>
                  HOT Certificates — Limited Time!
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {hotCertificates.map((cert) => (
                    <div
                      key={cert.id || cert._id}
                      className="flex-shrink-0 w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {cert.title || cert.offer?.title || "Certificate"}
                          </h3>
                          <p className="text-orange-100 text-sm">
                            {cert.offer?.business?.name || ""}
                          </p>
                        </div>
                        <span className="bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-lg">
                          HOT
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-orange-200 mb-0.5">
                            Member Price
                          </p>
                          <span className="text-3xl font-bold text-white">
                            ${cert.memberPrice || "–"}
                          </span>
                        </div>
                        <Link
                          to="/certification"
                          className="px-4 py-2 bg-white text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg"
                        >
                          Get It
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Provider Directory ────────────────────────────────────────── */}
        {providerDirectory.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-8">
              Discount Provider Directory
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {providerDirectory.map((business) => (
                <Link
                  key={business.id || business._id}
                  to={`/business-profile/${business.id || business._id}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 mb-4 rounded-full bg-slate-50 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300">
                    {business.logoUrl || business.logo_url ? (
                      <AppImage
                        src={business.logoUrl || business.logo_url}
                        alt={business.name}
                        className="w-full h-full object-contain rounded-full"
                      />
                    ) : (
                      <Icon
                        name="BuildingStorefrontIcon"
                        size={32}
                        className="text-slate-400"
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-[#1C4D8D] transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">
                    {business.category}
                  </p>
                  <div className="mt-auto pt-2 border-t border-slate-50 w-full">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                      {business.district || "Cayman Islands"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── QR Modal ──────────────────────────────────────────────────────── */}
      {showQRModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Member ID</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center mb-6">
              <QRCodeSVG
                value={getQrValue()}
                size={200}
                level="H"
                className="mb-4"
              />
              <p className="font-mono text-sm font-bold text-slate-600 tracking-widest">
                {(user?.id || user?._id || "UNKNOWN")
                  .toString()
                  .substring(0, 8)
                  .toUpperCase()}
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-slate-900">
                Show this code to redeem discounts
              </p>
              <p className="text-xs text-slate-500">
                Refreshes every 10 minutes for your security.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboardContent;
