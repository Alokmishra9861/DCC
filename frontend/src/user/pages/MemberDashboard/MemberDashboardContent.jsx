// Frontend/src/user/pages/Dashboard/MemberDashboardContent.jsx
// PREMIUM REDESIGN — White background, editorial typography, refined card system

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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
  associationAPI,
} from "../../../services/api";
import MemberStatsBlock from "../../components/ui/MemberStatsBlock";
import MyCertificatesSection from "../../components/ui/MyCertificatesSection";
import JoinAssociationModal from "../../components/ui/JoinAssociationModal";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const toArray = (val, fallbackKeys = []) => {
  if (Array.isArray(val)) return val;
  for (const key of fallbackKeys) {
    if (Array.isArray(val?.[key])) return val[key];
  }
  return [];
};
const getCategoryLabel = (c) => {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c.name || c.slug || "";
};

/* ─── Sub-components ───────────────────────────────────────────────────────── */

const SectionLabel = ({ eyebrow, title, action }) => (
  <div className="flex items-end justify-between mb-7">
    <div>
      <p className="m-0 mb-1 text-xs font-bold tracking-widest uppercase text-amber-600">
        {eyebrow}
      </p>
      <h2 className="m-0 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
    </div>
    {action}
  </div>
);

const Hairline = () => (
  <div className="h-px bg-gradient-to-r from-slate-200 to-transparent mb-11" />
);

/* ─── Join Association Widget ──────────────────────────────────────────────── */
const JoinAssociationWidget = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await associationAPI.joinAssociation(
        code.trim().toUpperCase(),
      );
      setResult({
        success: true,
        message:
          res?.message ||
          `Joined ${res?.associationName || "association"} successfully!`,
      });
      setCode("");
    } catch (err) {
      setResult({
        success: false,
        message: err.message || "Invalid or expired join code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 border border-slate-200 rounded-[20px] bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-[18px] bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-3xl flex-shrink-0 bg-blue-50 border border-blue-200 flex items-center justify-center text-lg">
            🔗
          </div>
          <div className="text-left">
            <p className="m-0 font-bold text-sm text-slate-900">
              Join an Association
            </p>
            <p className="m-0 mt-0.5 text-xs text-slate-500">
              Have a join code? Enter it here to link your account
            </p>
          </div>
        </div>
        <span
          className={`text-slate-500 text-sm inline-block transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-6 pb-5.5 border-t border-slate-200">
          <div className="pt-4.5">
            {result ? (
              <div
                className={`rounded-sm p-3.5 flex items-center gap-3 mb-2 ${
                  result.success
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <span className="text-lg flex-shrink-0">
                  {result.success ? "✓" : "⚠"}
                </span>
                <div className="flex-1">
                  <p
                    className={`m-0 font-bold text-sm ${
                      result.success ? "text-emerald-800" : "text-red-800"
                    }`}
                  >
                    {result.success ? "Success!" : "Failed"}
                  </p>
                  <p
                    className={`m-0 mt-0.5 text-xs ${
                      result.success ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    if (result.success) setOpen(false);
                  }}
                  className={`bg-transparent border-none cursor-pointer text-xs font-bold transition-colors ${
                    result.success
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-red-600 hover:text-red-700"
                  }`}
                >
                  {result.success ? "Done" : "Try again"}
                </button>
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">
                  Association Join Code
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    placeholder="e.g. NURSES-CI-A3F2"
                    maxLength={24}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-3xl text-sm font-mono tracking-widest uppercase text-slate-900 bg-slate-50 outline-none focus:border-[#1C4D8D] transition-colors"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={loading || !code.trim()}
                    className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-lg font-bold text-sm hover:bg-blue-900 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full inline-block animate-spin" />
                    ) : (
                      "Join"
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Ask your association admin for the join code to link your
                  account.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const MemberDashboardContent = () => {
  const userRef = useRef(getUser());
  const user = userRef.current;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const membershipActivated = searchParams.get("membership") === "activated";

  const [activeView, setActiveView] = useState(
    location.state?.openCertificates ? "certificates" : "dashboard",
  );
  const [memberProfile, setMemberProfile] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMembershipSuccess, setShowMembershipSuccess] =
    useState(membershipActivated);
  const [newDiscounts, setNewDiscounts] = useState([]);
  const [providerDirectory, setProviderDirectory] = useState([]);
  const [travelDeals, setTravelDeals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeCertCount, setActiveCertCount] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [associationName, setAssociationName] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user) return;
    const uid = user?.id || user?._id || "UNKNOWN";
    setQrCodeData(`DCC-MEMBER-${uid}-${Date.now()}`);
    const t = setInterval(
      () => setQrCodeData(`DCC-MEMBER-${uid}-${Date.now()}`),
      10 * 60 * 1000,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (membershipActivated) {
      hasFetched.current = false;
      const timer = setTimeout(() => setShowMembershipSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [membershipActivated]);

  const fetchDashboardData = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    try {
      const [
        profileRes,
        txnRes,
        discountsRes,
        businessesRes,
        travelRes,
        myPurchasesRes,
      ] = await Promise.allSettled([
        memberAPI.getProfile(),
        memberAPI.getTransactions({ limit: 5, page: 1 }),
        discountAPI.getAll({ limit: 6 }),
        businessAPI.getAll({ limit: 10 }),
        travelAPI.getAll({ limit: 3 }),
        certificateAPI.getMy(),
      ]);
      if (profileRes.status === "fulfilled" && profileRes.value) {
        const p = profileRes.value;
        setMemberProfile(p);
        if (p?.association?.name) setAssociationName(p.association.name);
        setQrCodeData(
          p?.qrCode || `DCC-MEMBER-${p?.userId || user?.id}-${Date.now()}`,
        );
      }
      if (txnRes.status === "fulfilled")
        setRecentTransactions(
          toArray(txnRes.value, ["transactions", "items"]).slice(0, 5),
        );
      if (discountsRes.status === "fulfilled")
        setNewDiscounts(
          toArray(discountsRes.value, ["discounts", "data", "items"]).slice(
            0,
            6,
          ),
        );
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
      if (myPurchasesRes.status === "fulfilled") {
        const list = toArray(myPurchasesRes.value, [
          "data",
          "certificates",
          "items",
        ]);
        setActiveCertCount(list.filter((p) => p.status === "PURCHASED").length);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const buildDisplayName = () => {
    const fn = (memberProfile?.firstName || "").trim();
    const ln = (memberProfile?.lastName || "").trim();
    if (fn || ln) {
      if (fn && ln && fn.toLowerCase() === ln.toLowerCase()) return fn;
      return [fn, ln].filter(Boolean).join(" ");
    }
    const fb =
      (user?.name || "").trim() || user?.email?.split("@")?.[0] || "Member";
    const parts = fb.split(/\s+/).filter(Boolean);
    if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase())
      return parts[0];
    return fb;
  };

  const displayName = buildDisplayName();
  const membershipStatusRaw = memberProfile?.membership?.status || "not active";
  const isMembershipActive = membershipStatusRaw.toLowerCase() === "active";
  const membershipStatus = membershipStatusRaw.toUpperCase();

  const getQrValue = () => {
    let v = qrCodeData || `DCC-MEMBER-${user?.id || "UNKNOWN"}-${Date.now()}`;
    if (typeof v !== "string") {
      try {
        v = JSON.stringify(v);
      } catch {
        v = `DCC-MEMBER-${user?.id}`;
      }
    }
    return v.length > 300 ? v.slice(0, 300) : v;
  };

  // First-letter avatar colour
  const avatarBg = `linear-gradient(135deg, #1C4D8D 0%, #2A6BC8 100%)`;

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (initialLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4.5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1C4D8D] animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-widest">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-10 py-6 lg:py-12">
        {/* ── Success Banner ─────────────────────────────────────────────── */}
        {showMembershipSuccess && (
          <div className="mb-6 rounded-xl px-6 py-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <Icon
                name="CheckCircleIcon"
                size={18}
                className="text-emerald-600"
              />
            </div>
            <div className="flex-1">
              <p className="m-0 font-bold text-sm text-emerald-800">
                Membership Activated!
              </p>
              <p className="m-0 mt-0.5 text-xs text-emerald-700">
                Welcome to Discount Club Cayman — exclusive access is now
                unlocked.
              </p>
            </div>
            <button
              onClick={() => setShowMembershipSuccess(false)}
              className="bg-transparent border-none cursor-pointer text-slate-400 flex hover:text-slate-600 transition-colors"
            >
              <Icon name="XMarkIcon" size={18} />
            </button>
          </div>
        )}

        {/* ── Inactive Warning ───────────────────────────────────────────── */}
        {!isMembershipActive && (
          <div className="mb-6 rounded-xl px-6 py-4 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 flex-wrap">
            <div>
              <p className="m-0 font-bold text-sm text-amber-900">
                Membership Inactive
              </p>
              <p className="m-0 mt-0.5 text-xs text-amber-800">
                Activate your membership to access all features.
              </p>
            </div>
            <Link
              to="/membership"
              className="px-4 py-2 bg-[#1C4D8D] text-white rounded-lg font-bold text-sm hover:bg-blue-900 transition-all whitespace-nowrap"
            >
              Activate Membership
            </Link>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MEMBERSHIP IDENTITY CARD — redesigned from flat blue bar
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-11">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0 rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-white">
            {/* Left — Identity */}
            <div className="p-6 md:p-10 border-r border-slate-200">
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5 mb-5.5">
                <span className="text-xs font-bold tracking-widest uppercase text-slate-500">
                  Discount Club Cayman
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-wider uppercase ${
                    isMembershipActive
                      ? "bg-emerald-100 border border-emerald-300 text-emerald-700"
                      : "bg-red-100 border border-red-300 text-red-700"
                  }`}
                >
                  {membershipStatus}
                </span>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-4.5 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg"
                  style={{
                    background: avatarBg,
                    boxShadow:
                      "0 0 0 4px #EEF4FF, 0 4px 16px rgba(28,77,141,0.22)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1
                    style={{
                      margin: "0 0 4px",
                      fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                      fontWeight: 700,
                      color: "#0D1117",
                      letterSpacing: "-0.025em",
                      lineHeight: 1.1,
                    }}
                  >
                    {displayName}
                  </h1>
                  <p className="m-0 text-sm font-semibold text-[#1C4D8D] tracking-widest">
                    {memberProfile?.membership?.tier || "Standard"} Member
                  </p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex gap-6 flex-wrap">
                {[
                  {
                    label: "Member Since",
                    value: memberProfile?.membership?.startDate
                      ? new Date(
                          memberProfile.membership.startDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "–",
                  },
                  {
                    label: "Expires",
                    value: memberProfile?.membership?.expiryDate
                      ? new Date(
                          memberProfile.membership.expiryDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "–",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="m-0 mb-0.5 text-xs font-bold tracking-widest uppercase text-slate-500">
                      {label}
                    </p>
                    <p className="m-0 text-base font-bold text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — QR panel */}
            <div className="p-6 md:p-10 flex flex-col items-center justify-center gap-3 bg-slate-50 min-w-40">
              <p className="m-0 text-xs font-bold tracking-widest uppercase text-slate-500 text-center">
                Member QR
              </p>
              <button
                onClick={() => setShowQRModal(true)}
                disabled={!isMembershipActive}
                className={`w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all flex-shrink-0 ${
                  isMembershipActive
                    ? "border-[#1C4D8D] bg-blue-50 cursor-pointer hover:bg-blue-100"
                    : "border-slate-200 bg-slate-100 cursor-not-allowed opacity-40"
                }`}
              >
                <Icon
                  name="QrCodeIcon"
                  size={36}
                  className={
                    isMembershipActive ? "text-[#1C4D8D]" : "text-slate-500"
                  }
                />
              </button>
              <p className="m-0 text-xs text-slate-500 text-center max-w-24 leading-relaxed">
                {isMembershipActive
                  ? "Tap to show at checkout"
                  : "Activate to unlock"}
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            STATS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-11">
          <MemberStatsBlock />
        </div>

        <Hairline />

        {/* ═══════════════════════════════════════════════════════════════
            RECENT ACTIVITY
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-16">
          <SectionLabel
            eyebrow="Your History"
            title="Recent Activity"
            action={
              <Link
                to="/browse-discounts"
                className="px-4 py-2 bg-transparent border border-slate-200 rounded-full text-sm font-bold text-[#1C4D8D] hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                View All →
              </Link>
            }
          />
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {recentTransactions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3.5">
                  <Icon name="ClockIcon" size={26} className="text-slate-500" />
                </div>
                <p className="m-0 font-semibold text-sm text-slate-500">
                  No transactions yet
                </p>
                <p className="m-0 mt-1 text-xs text-slate-500">
                  Your savings will show up here once you start redeeming
                  discounts.
                </p>
              </div>
            ) : (
              <ul className="list-none m-0 p-0">
                {recentTransactions.map((tx, i) => (
                  <li
                    key={tx.id || i}
                    className={`px-6 py-4 flex items-center gap-3.5 ${
                      i < recentTransactions.length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-3xl flex-shrink-0 bg-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden">
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
                      <p className="m-0 font-bold text-sm text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">
                        {tx.business?.name || "Business"}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-slate-500">
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
                      <p className="m-0 font-extrabold text-base text-emerald-600">
                        −${(tx.savingsAmount || 0).toFixed(2)}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-slate-500">
                        ${(tx.saleAmount || 0).toFixed(2)} spent
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            JOIN ASSOCIATION
        ═══════════════════════════════════════════════════════════════ */}
        <JoinAssociationWidget />

        {/* ═══════════════════════════════════════════════════════════════
            QUICK LINKS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-11">
          {/* Certificates tile */}
          <button
            onClick={() =>
              setActiveView(
                activeView === "certificates" ? "dashboard" : "certificates",
              )
            }
            className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
              activeView === "certificates"
                ? "border-[#1C4D8D] bg-blue-50 shadow-md"
                : "border-slate-200 bg-white hover:shadow-md"
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all ${
                activeView === "certificates"
                  ? "bg-gradient-to-r from-[#1C4D8D] to-blue-600"
                  : "transparent"
              }`}
            />
            <div className="relative inline-flex mb-3.5">
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
                  activeView === "certificates"
                    ? "bg-[#1C4D8D]"
                    : "bg-slate-50 border border-slate-200"
                }`}
              >
                <Icon
                  name="TicketIcon"
                  size={22}
                  className={
                    activeView === "certificates"
                      ? "text-white"
                      : "text-[#1C4D8D]"
                  }
                />
              </div>
              {activeCertCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1C4D8D] text-white text-xs font-extrabold flex items-center justify-center shadow-md"
                  style={{ boxShadow: "0 0 0 3px #fff" }}
                >
                  {activeCertCount}
                </span>
              )}
            </div>
            <h3 className="m-0 mb-0.5 font-bold text-sm text-slate-900">
              My Certificates
            </h3>
            <p className="m-0 text-xs text-slate-500">
              {activeView === "certificates"
                ? "← Back to dashboard"
                : "View & share codes"}
            </p>
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
              to: "/certification",
              icon: "ShoppingCartIcon",
              title: "Buy Certificates",
              sub: "High-value certs",
            },
          ].map(({ to, icon, title, sub }) => (
            <Link
              key={to}
              to={to}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:shadow-md hover:border-slate-300 text-decoration-none group"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#1C4D8D] to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-11 h-11 rounded-lg mb-3.5 bg-slate-50 border border-slate-200 flex items-center justify-center transition-all group-hover:bg-slate-100">
                <Icon name={icon} size={22} className="text-[#1C4D8D]" />
              </div>
              <h3 className="m-0 mb-0.5 font-bold text-sm text-slate-900">
                {title}
              </h3>
              <p className="m-0 text-xs text-slate-500">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Association banners */}
        {!associationName && (
          <div className="mb-7 rounded-2xl p-5 flex items-center justify-between gap-3.5 bg-blue-50 border border-blue-200 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-3xl bg-blue-200 flex items-center justify-center text-xl flex-shrink-0">
                🤝
              </div>
              <div>
                <p className="m-0 font-bold text-sm text-slate-900">
                  Have an association join code?
                </p>
                <p className="m-0 mt-0.5 text-xs text-slate-700">
                  Link your account to access group benefits.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-lg font-bold text-sm hover:bg-blue-900 transition-all whitespace-nowrap"
            >
              Enter Join Code
            </button>
          </div>
        )}

        {associationName && (
          <div className="mb-7 rounded-2xl p-3.5 flex items-center gap-3 bg-emerald-50 border border-emerald-200">
            <div className="w-8 h-8 rounded-2xl flex-shrink-0 bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
              ✓
            </div>
            <div>
              <p className="m-0 font-bold text-sm text-emerald-600">
                Linked to {associationName}
              </p>
              <p className="m-0 mt-0.5 text-xs text-emerald-700">
                You're receiving group benefits from your association.
              </p>
            </div>
          </div>
        )}

        {/* ── Certificates View ──────────────────────────────────────────── */}
        {activeView === "certificates" && (
          <div className="mb-20">
            <MyCertificatesSection key={Date.now()} />
          </div>
        )}

        {/* ── Dashboard View ─────────────────────────────────────────────── */}
        {activeView === "dashboard" && (
          <>
            <Hairline />

            {/* Travel Deals */}
            <div className="mb-16">
              <SectionLabel
                eyebrow="Exclusive Member Offers"
                title="Featured Travel Deals"
                action={
                  <Link
                    to="/travel"
                    className="px-4 py-2 bg-transparent border border-slate-200 rounded-full text-sm font-bold text-[#1C4D8D] hover:bg-slate-50 transition-all whitespace-nowrap"
                  >
                    View All →
                  </Link>
                }
              />
              {travelDeals.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3.5">
                    <Icon
                      name="GlobeAltIcon"
                      size={28}
                      className="text-slate-500"
                    />
                  </div>
                  <p className="m-0 text-sm font-semibold text-slate-500">
                    Travel deals will appear here once configured.
                  </p>
                  <Link
                    to="/travel"
                    className="text-[#1C4D8D] font-bold no-underline mt-1.5 inline-block text-sm hover:underline"
                  >
                    Browse travel →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {travelDeals.map((deal) => (
                    <div
                      key={deal.id || deal._id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-52 bg-slate-50 overflow-hidden">
                        {(deal.image_url || deal.imageUrl || deal.image) && (
                          <AppImage
                            src={deal.image_url || deal.imageUrl || deal.image}
                            alt={deal.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute bottom-3.5 left-4 right-4">
                          <h3
                            style={{
                              margin: 0,
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#fff",
                              letterSpacing: "-0.01em",
                              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                            }}
                          >
                            {deal.title || deal.name}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5 flex items-end justify-between">
                        <div>
                          <p className="m-0 mb-0.5 text-xs font-bold tracking-widest uppercase text-slate-500">
                            Member Price
                          </p>
                          <span
                            style={{
                              fontSize: 26,
                              fontWeight: 700,
                              color: "#0D1117",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            $
                            {deal.member_price ||
                              deal.memberPrice ||
                              deal.price ||
                              "–"}
                          </span>
                        </div>
                        <Link
                          to="/travel"
                          className="px-4 py-2 bg-[#1C4D8D] text-white rounded-lg font-bold text-xs hover:bg-blue-900 transition-all no-underline"
                        >
                          View Deal
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Hairline />

            {/* New Discounts */}
            <div className="mb-16">
              <SectionLabel
                eyebrow="Save Big Locally"
                title="New Local Discounts"
                action={
                  <Link
                    to="/discounts"
                    className="px-4 py-2 bg-transparent border border-slate-200 rounded-full text-sm font-bold text-[#1C4D8D] hover:bg-slate-50 transition-all whitespace-nowrap"
                  >
                    View All →
                  </Link>
                }
              />
              {newDiscounts.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <div className="w-14 h-14 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3.5">
                    <Icon name="TagIcon" size={28} className="text-slate-500" />
                  </div>
                  <p className="m-0 text-sm text-slate-500">
                    No discounts yet.{" "}
                    <Link
                      to="/browse-discounts"
                      className="text-[#1C4D8D] font-bold no-underline hover:underline"
                    >
                      Browse →
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
                  {newDiscounts.map((discount) => (
                    <div
                      key={discount.id || discount._id}
                      className="bg-white border border-slate-200 rounded-xl p-5.5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3.5 mb-4.5">
                        <div className="w-14 h-14 rounded-3xl flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 transition-colors hover:border-slate-300">
                          {discount.business?.logoUrl ? (
                            <AppImage
                              src={discount.business.logoUrl}
                              alt={discount.business?.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Icon
                              name="BuildingStorefrontIcon"
                              size={24}
                              className="text-slate-500"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="m-0 mb-1 font-bold text-sm text-slate-900 leading-tight tracking-tight">
                            {discount.business?.name || "Business"}
                          </h3>
                          <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                            {getCategoryLabel(discount.category) ||
                              getCategoryLabel(discount.business?.category) ||
                              "General"}
                          </span>
                        </div>
                      </div>

                      {/* Discount amount — editorial style */}
                      <div className="rounded-2xl p-4.5 mb-4 text-center bg-slate-50 border border-slate-200 relative overflow-hidden">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-0.5 bg-[#1C4D8D] rounded-full" />
                        <p className="m-0 text-2xl font-bold text-slate-900 tracking-tight">
                          {(discount.type || "DISCOUNT") === "DISCOUNT"
                            ? `${discount.discountValue || 0}% off`
                            : `$${discount.discountValue || 0} off`}
                        </p>
                      </div>

                      <Link
                        to={`/business-profile/${discount.business?.id || discount.businessId}`}
                        className="px-4 py-2.5 inline-block font-bold text-sm text-[#1C4D8D] hover:text-blue-900 transition-colors no-underline border-b border-[#1C4D8D] hover:border-blue-900"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Provider Directory */}
            {providerDirectory.length > 0 && (
              <>
                <Hairline />
                <div className="mb-16">
                  <SectionLabel
                    eyebrow="Partner Network"
                    title="Discount Provider Directory"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {providerDirectory.map((business) => (
                      <Link
                        key={business.id || business._id}
                        to={`/business-profile/${business.id || business._id}`}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col items-center text-center no-underline hover:shadow-md transition-shadow"
                      >
                        <div className="w-14 h-14 rounded-full mb-2.5 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 transition-colors hover:border-slate-300">
                          {business.logoUrl ? (
                            <AppImage
                              src={business.logoUrl}
                              alt={business.name}
                              className="w-full h-full object-contain rounded-full"
                            />
                          ) : (
                            <Icon
                              name="BuildingStorefrontIcon"
                              size={24}
                              className="text-slate-500"
                            />
                          )}
                        </div>
                        <h3 className="m-0 mb-0.5 font-bold text-xs text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                          {business.name}
                        </h3>
                        <p className="m-0 mb-0.5 text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                          {getCategoryLabel(business.category) || "General"}
                        </p>
                        <p className="m-0 text-xs text-slate-500 font-semibold tracking-widest uppercase">
                          {business.district || "Cayman Islands"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showJoinModal && (
        <JoinAssociationModal
          onClose={() => setShowJoinModal(false)}
          onJoined={() => {
            setAssociationName("your association");
            setShowJoinModal(false);
          }}
        />
      )}

      {showQRModal && (
        <div
          onClick={() => setShowQRModal(false)}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-lg flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-7 pt-5.5 flex items-center justify-between">
              <div>
                <p className="m-0 text-xs font-bold tracking-widest uppercase text-slate-500 mb-0.5">
                  Discount Club Cayman
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0D1117",
                  }}
                >
                  Member ID
                </h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 cursor-pointer flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>

            {/* QR area */}
            <div className="p-7">
              <div className="rounded-2xl px-5.5 py-5.5 bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center">
                <QRCodeSVG
                  value={getQrValue()}
                  size={196}
                  level="H"
                  className="mb-3.5"
                />
                <p className="m-0 font-mono text-xs font-black text-slate-900 tracking-widest">
                  {(user?.id || user?._id || "UNKNOWN")
                    .toString()
                    .substring(0, 8)
                    .toUpperCase()}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 pb-6.5 text-center">
              <p className="m-0 mb-1 text-sm font-bold text-slate-900">
                Show this code to redeem discounts
              </p>
              <p className="m-0 text-xs text-slate-500">
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
