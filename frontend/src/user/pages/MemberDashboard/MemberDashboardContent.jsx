// Frontend/src/user/pages/Dashboard/MemberDashboardContent.jsx
// CHANGES FROM PREVIOUS VERSION:
//  + Imports MyCertificatesSection as separate component (re-fetches on every mount)
//  + Reads location.state.openCertificates to auto-open My Certificates after payment
//  + My Certificates quick link now shows active cert count badge
//  Everything else is identical to the previous version.

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { QRCodeSVG } from "qrcode.react";
import AppImage from "../../components/ui/AppImage";
import {
  getUser,
  memberAPI,
  discountAPI,
  businessAPI,
  travelAPI,
  certificateAPI,
} from "../../../services/api";
import AnalyticsStatsPanel from "../../components/ui/AnalyticsStatsPanel";
import MyCertificatesSection from "../../components/ui/MyCertificatesSection";

const toArray = (val, fallbackKeys = []) => {
  if (Array.isArray(val)) return val;
  for (const key of fallbackKeys) {
    if (Array.isArray(val?.[key])) return val[key];
  }
  return [];
};

const getCategoryLabel = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || category.slug || "";
};

const MemberDashboardContent = () => {
  const userRef = useRef(getUser());
  const user = userRef.current;
  const location = useLocation();

  // If navigated from PaymentSuccessPage with openCertificates:true, auto-open
  const [activeView, setActiveView] = useState(
    location.state?.openCertificates ? "certificates" : "dashboard",
  );

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
  const [activeCertCount, setActiveCertCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasFetched = useRef(false);

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
  }, []);

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
        myPurchasesRes,
      ] = await Promise.allSettled([
        memberAPI.getProfile(),
        memberAPI.getSavings("lifetime"),
        memberAPI.getTransactions({ limit: 5, page: 1 }),
        discountAPI.getAll({ limit: 6 }),
        businessAPI.getAll({ limit: 10 }),
        travelAPI.getAll({ limit: 3 }),
        certificateAPI.getAvailable({ limit: 4 }),
        certificateAPI.getMy(), // ← get active cert count for badge
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        const profile = profileRes.value;
        setMemberProfile(profile);
        const userId = profile?.userId || user?.id || user?._id || "UNKNOWN";
        setQrCodeData(profile?.qrCode || `DCC-MEMBER-${userId}-${Date.now()}`);
      }
      if (savingsRes.status === "fulfilled")
        setSavingsSummary(
          savingsRes.value?.summary ?? savingsRes.value ?? null,
        );
      if (txnRes.status === "fulfilled")
        setRecentTransactions(
          toArray(txnRes.value, ["transactions", "items"]).slice(0, 5),
        );
      if (discountsRes.status === "fulfilled") {
        const list = toArray(discountsRes.value, [
          "discounts",
          "data",
          "items",
        ]);
        setNewDiscounts(list.slice(0, 6));
        setUnbeatableDeals(list.slice(0, 5));
      }
      if (businessesRes.status === "fulfilled")
        setProviderDirectory(
          toArray(businessesRes.value, ["businesses", "data", "items"]).slice(
            0,
            10,
          ),
        );
      if (travelRes.status === "fulfilled")
        setTravelDeals(
          toArray(travelRes.value, ["results", "items", "data", "deals"]).slice(
            0,
            3,
          ),
        );
      if (certsRes.status === "fulfilled") {
        const list = toArray(certsRes.value, ["certificates", "items", "data"]);
        setNewCertificates(list.slice(0, 3));
        setHotCertificates(list.slice(0, 4));
      }
      if (myPurchasesRes.status === "fulfilled") {
        const list = toArray(myPurchasesRes.value, [
          "data",
          "certificates",
          "items",
        ]);
        setActiveCertCount(list.filter((p) => p.status === "PURCHASED").length);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const buildDisplayName = () => {
    const firstName = (memberProfile?.firstName || "").trim();
    const lastName = (memberProfile?.lastName || "").trim();
    if (firstName || lastName) {
      if (
        firstName &&
        lastName &&
        firstName.toLowerCase() === lastName.toLowerCase()
      )
        return firstName;
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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-green-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Inactive membership banner */}
        {!isMembershipActive && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-700">
                Membership inactive
              </p>
              <p className="text-slate-700 mt-1">
                Activate your membership to access all features.
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

        {/* Membership card */}
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
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isMembershipActive ? "bg-green-400/20 text-green-200 border-green-400/30" : "bg-red-400/20 text-red-200 border-red-400/30"}`}
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
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-2xl px-5 py-4 border border-white/30 flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="QrCodeIcon" size={26} className="text-white" />
                  <p className="text-white text-xs font-bold uppercase tracking-wide">
                    {isMembershipActive ? "Member QR" : "Activate"}
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnalyticsStatsPanel title="My Savings Analytics" />

        {/* Savings summary */}
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

        {/* Recent activity */}
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
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentTransactions.map((tx, i) => (
                  <li
                    key={tx.id || tx._id || i}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {/* My Certificates — prominent, with badge */}
          <button
            onClick={() =>
              setActiveView(
                activeView === "certificates" ? "dashboard" : "certificates",
              )
            }
            className={`group relative overflow-hidden rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full text-left ${
              activeView === "certificates"
                ? "bg-gradient-to-br from-[#0F2854] to-[#1C4D8D] ring-4 ring-[#1C4D8D]/30"
                : "bg-gradient-to-br from-[#1C4D8D] to-[#4988C4]"
            }`}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                <Icon name="TicketIcon" size={24} className="text-white" />
                {activeCertCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-slate-900 text-xs font-black rounded-full flex items-center justify-center shadow">
                    {activeCertCount}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-white leading-tight mb-1">
                My Certificates
              </h3>
              <p className="text-blue-100 text-sm">
                {activeView === "certificates"
                  ? "← Back to dashboard"
                  : "View & share codes"}
              </p>
            </div>
          </button>

          {[
            {
              to: "/travel",
              icon: "GlobeAltIcon",
              title: "Travel Deals",
              sub: "Hotels & flights",
            },
            {
              to: "/browse-discounts",
              icon: "TagIcon",
              title: "Discounts",
              sub: "Local savings",
            },
            {
              to: "/certifications",
              icon: "ShoppingCartIcon",
              title: "Buy Certificates",
              sub: "High-value certs",
            },
          ].map(({ to, icon, title, sub }) => (
            <Link
              key={to}
              to={to}
              className="group relative overflow-hidden bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={icon} size={24} className="text-white" />
                </div>
                <h3 className="font-bold text-lg text-white leading-tight mb-1">
                  {title}
                </h3>
                <p className="text-blue-100 text-sm">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── My Certificates section ──────────────────────────────────── */}
        {activeView === "certificates" && (
          <div className="mb-16">
            {/* MyCertificatesSection mounts fresh each time → re-fetches automatically */}
            <MyCertificatesSection key={Date.now()} />
          </div>
        )}

        {/* Rest of dashboard */}
        {activeView === "dashboard" && (
          <>
            {/* Travel deals */}
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
              {travelDeals.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Icon
                    name="GlobeAltIcon"
                    size={40}
                    className="mx-auto mb-3 text-slate-200"
                  />
                  <p>Travel deals will appear here once configured.</p>
                  <Link
                    to="/travel"
                    className="text-[#1C4D8D] font-semibold mt-2 inline-block"
                  >
                    Browse travel →
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  {travelDeals.map((deal) => (
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
                        </div>
                      </div>
                      <div className="p-6 flex items-end justify-between">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">
                            Member Price
                          </p>
                          <span className="text-3xl font-bold text-[#1C4D8D]">
                            $
                            {deal.member_price ||
                              deal.memberPrice ||
                              deal.price ||
                              "–"}
                          </span>
                        </div>
                        <Link
                          to="/travel"
                          className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-[#1C4D8D] hover:text-white transition-all"
                        >
                          View Deal
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New local discounts */}
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
              {newDiscounts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
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
                      Browse →
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {newDiscounts.map((discount) => (
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
                            {getCategoryLabel(discount.category) ||
                              getCategoryLabel(discount.business?.category) ||
                              "General"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-5 mb-5 border border-blue-100">
                        <p className="text-lg font-bold text-[#1C4D8D] text-center">
                          {(discount.type || "DISCOUNT") === "DISCOUNT"
                            ? `${discount.discountValue || 0}% off`
                            : `$${discount.discountValue || 0} off`}
                        </p>
                      </div>
                      <Link
                        to={`/business-profile/${discount.business?.id || discount.businessId}`}
                        className="w-full block text-center py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Provider directory */}
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
                        {business.logoUrl ? (
                          <AppImage
                            src={business.logoUrl}
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
                        {getCategoryLabel(business.category) || "General"}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                        {business.district || "Cayman Islands"}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Modal */}
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
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
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
                Refreshes every 10 minutes for security.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboardContent;
