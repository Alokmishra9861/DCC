// Frontend/src/user/pages/Dashboard/MemberDashboardContent.jsx
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

// ─── Premium UI Tokens ──────────────────────────────────────────────────────
const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

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
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
    <div>
      <p className="text-[10px] font-black tracking-widest uppercase text-[#1C4D8D] mb-2">
        {eyebrow}
      </p>
      <h2
        className="text-3xl font-bold text-slate-900 tracking-tight"
        style={HEADING_FONT}
      >
        {title}
      </h2>
    </div>
    {action && <div>{action}</div>}
  </div>
);

const Hairline = () => (
  <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent mb-12 mt-4" />
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
    <div className="mb-12 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-8 py-6 bg-transparent border-none cursor-pointer transition-colors hover:bg-slate-50/50 group"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
            <Icon name="LinkIcon" size={24} />
          </div>
          <div className="text-left">
            <p className="m-0 font-bold text-lg text-slate-900 tracking-tight">
              Join an Association
            </p>
            <p className="m-0 mt-1 text-sm font-medium text-slate-500">
              Have a join code? Enter it here to link your account
            </p>
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 transition-transform duration-300 ${open ? "bg-blue-50 text-[#1C4D8D]" : ""}`}
        >
          <Icon name="ChevronDownIcon" size={20} />
        </div>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-8 pb-8 pt-2">
          <div className="pt-6 border-t border-slate-100">
            {result ? (
              <div
                className={`rounded-2xl p-5 flex items-start gap-4 mb-2 ${result.success ? "bg-emerald-50/50 border border-emerald-200" : "bg-rose-50/50 border border-rose-200"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${result.success ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                >
                  <Icon
                    name={result.success ? "CheckIcon" : "XMarkIcon"}
                    size={20}
                  />
                </div>
                <div className="flex-1 pt-0.5">
                  <p
                    className={`m-0 font-bold text-base ${result.success ? "text-emerald-900" : "text-rose-900"}`}
                  >
                    {result.success ? "Success!" : "Verification Failed"}
                  </p>
                  <p
                    className={`m-0 mt-1 text-sm font-medium ${result.success ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {result.message}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    if (result.success) setOpen(false);
                  }}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {result.success ? "Done" : "Try again"}
                </button>
              </div>
            ) : (
              <>
                <label className="block text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">
                  Association Join Code
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Icon
                      name="KeyIcon"
                      size={20}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      placeholder="e.g. NURSES-CI-A3F2"
                      maxLength={24}
                      className="w-full pl-12 pr-6 py-4 border border-slate-200 rounded-2xl text-base font-mono tracking-widest uppercase text-slate-900 bg-slate-50 outline-none focus:border-[#1C4D8D] focus:ring-2 focus:ring-[#1C4D8D]/20 focus:bg-white transition-all placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    onClick={handleJoin}
                    disabled={loading || !code.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-[#1C4D8D] to-[#153a6b] text-white rounded-2xl font-bold text-base hover:shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 sm:w-auto w-full"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block animate-spin" />{" "}
                        Verifying...
                      </>
                    ) : (
                      "Join Association"
                    )}
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-4">
                  Ask your association admin for the secure join code to link
                  your account.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
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
  }, [user]);

  useEffect(() => {
    if (membershipActivated) {
      hasFetched.current = false;
      const timer = setTimeout(() => setShowMembershipSuccess(false), 5000);
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
  }, [user]);

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

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (initialLoading)
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-4 pt-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin shadow-sm" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#1C4D8D]/20 relative overflow-hidden pt-5">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-60 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50/40 to-teal-50/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-6 lg:pb-12">
        {/* ── Success Banner ─────────────────────────────────────────────── */}
        {showMembershipSuccess && (
          <div className="mb-6 rounded-2xl px-6 py-5 flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <Icon name="CheckIcon" size={24} />
            </div>
            <div className="flex-1">
              <p className="m-0 font-bold text-lg text-emerald-900 tracking-tight">
                Membership Activated!
              </p>
              <p className="m-0 mt-0.5 text-sm font-medium text-emerald-700">
                Welcome to Discount Club Cayman — your exclusive access is now
                unlocked.
              </p>
            </div>
            <button
              onClick={() => setShowMembershipSuccess(false)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200 transition-colors"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>
        )}

        {/* ── Inactive Warning ───────────────────────────────────────────── */}
        {!isMembershipActive && (
          <div className="mb-6 rounded-2xl px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-amber-50 to-yellow-50/50 border border-amber-200 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name="ExclamationTriangleIcon" size={24} />
              </div>
              <div>
                <p className="m-0 font-bold text-lg text-amber-900 tracking-tight">
                  Membership Inactive
                </p>
                <p className="m-0 mt-0.5 text-sm font-medium text-amber-700/80">
                  Activate your membership to access your digital card and
                  exclusive deals.
                </p>
              </div>
            </div>
            <Link
              to="/membership"
              className="px-8 py-4 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all whitespace-nowrap shadow-md text-center"
            >
              Activate Membership
            </Link>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            MEMBERSHIP IDENTITY CARD (COMPACT HERO)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0A1628] via-[#1C4D8D] to-[#4988C4] shadow-xl shadow-blue-900/10 mb-8 lg:mb-12">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            {/* Left — Identity Info */}
            <div className="p-6 md:p-8 lg:w-2/3 flex flex-col justify-center w-full border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-blue-200">
                  Discount Club Cayman
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] font-black tracking-widest uppercase ${
                    isMembershipActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {membershipStatus}
                </span>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white text-[#1C4D8D] flex items-center justify-center flex-shrink-0 shadow-xl">
                  <span
                    className="text-2xl md:text-3xl font-black"
                    style={HEADING_FONT}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1
                    className="m-0 mb-1 text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-md"
                    style={HEADING_FONT}
                  >
                    {displayName}
                  </h1>
                  <p className="m-0 text-sm md:text-base font-medium text-blue-200">
                    {memberProfile?.membership?.tier || "Standard"} Member
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm w-fit min-w-[280px]">
                <div>
                  <p className="m-0 mb-1 text-[9px] font-black tracking-widest uppercase text-blue-300/80">
                    Member Since
                  </p>
                  <p className="m-0 text-sm md:text-base font-bold text-white">
                    {memberProfile?.membership?.startDate
                      ? new Date(
                          memberProfile.membership.startDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="m-0 mb-1 text-[9px] font-black tracking-widest uppercase text-blue-300/80">
                    Expires
                  </p>
                  <p className="m-0 text-sm md:text-base font-bold text-white">
                    {memberProfile?.membership?.expiryDate
                      ? new Date(
                          memberProfile.membership.expiryDate,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right — QR Code */}
            <div className="p-6 md:p-8 lg:w-1/3 flex flex-row lg:flex-col items-center justify-center gap-4 w-full">
              <div className="flex flex-col items-center justify-center">
                <p className="text-[10px] font-black tracking-widest uppercase text-blue-200 mb-3 text-center hidden lg:block">
                  Digital ID
                </p>
                <button
                  onClick={() => setShowQRModal(true)}
                  disabled={!isMembershipActive}
                  className={`relative group rounded-2xl p-3 transition-all duration-300 ${
                    isMembershipActive
                      ? "bg-white cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                      : "bg-white/20 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isMembershipActive ? (
                    <QRCodeSVG
                      value={getQrValue()}
                      size={86}
                      level="H"
                      className="relative z-10"
                    />
                  ) : (
                    <div className="w-[86px] h-[86px] flex items-center justify-center">
                      <Icon
                        name="LockClosedIcon"
                        size={32}
                        className="text-white/50"
                      />
                    </div>
                  )}
                  {isMembershipActive && (
                    <div className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <Icon
                        name="ArrowsPointingOutIcon"
                        size={24}
                        className="text-white drop-shadow-md"
                      />
                    </div>
                  )}
                </button>
              </div>
              <div className="text-left lg:text-center flex-1 lg:flex-none">
                <p className="m-0 text-xs sm:text-sm font-medium text-blue-200 max-w-[160px]">
                  {isMembershipActive
                    ? "Tap QR code to enlarge for scanning."
                    : "Activate your membership to unlock."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            STATS BLOCK
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <MemberStatsBlock />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            QUICK LINKS
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Certificates Tile (Special Toggle) */}
          <button
            onClick={() =>
              setActiveView(
                activeView === "certificates" ? "dashboard" : "certificates",
              )
            }
            className={`relative rounded-[2rem] p-8 text-left transition-all duration-300 border ${
              activeView === "certificates"
                ? "border-[#1C4D8D] bg-blue-50 shadow-xl -translate-y-1"
                : "border-slate-200/60 bg-white hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${activeView === "certificates" ? "bg-[#1C4D8D] text-white shadow-md" : "bg-blue-50 text-blue-600"}`}
              >
                <Icon name="TicketIcon" size={28} />
              </div>
              {activeCertCount > 0 && (
                <span className="px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-full shadow-sm">
                  {activeCertCount} Active
                </span>
              )}
            </div>
            <h3
              className="m-0 mb-2 font-bold text-xl text-slate-900 tracking-tight"
              style={HEADING_FONT}
            >
              My Certificates
            </h3>
            <p className="m-0 text-sm font-medium text-slate-500 line-clamp-2">
              {activeView === "certificates"
                ? "Close certificates view"
                : "View your purchased pre-paid vouchers"}
            </p>
          </button>

          {/* Other Links */}
          {[
            {
              to: "/travel",
              icon: "GlobeAltIcon",
              title: "Travel Deals",
              sub: "Hotels, flights & rentals",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              to: "/browse-discounts",
              icon: "TagIcon",
              title: "Local Discounts",
              sub: "Find savings nearby",
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              to: "/certification",
              icon: "ShoppingCartIcon",
              title: "Buy Certificates",
              sub: "Pre-paid high value deals",
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map(({ to, icon, title, sub, color, bg }) => (
            <Link
              key={to}
              to={to}
              className="relative rounded-[2rem] border border-slate-200/60 bg-white p-8 text-left transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 text-decoration-none group"
            >
              <div
                className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 ${bg} ${color}`}
              >
                <Icon name={icon} size={28} />
              </div>
              <h3
                className="m-0 mb-2 font-bold text-xl text-slate-900 tracking-tight group-hover:text-[#1C4D8D] transition-colors"
                style={HEADING_FONT}
              >
                {title}
              </h3>
              <p className="m-0 text-sm font-medium text-slate-500 line-clamp-2">
                {sub}
              </p>
            </Link>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ASSOCIATION BANNER & JOIN WIDGET
        ═══════════════════════════════════════════════════════════════ */}
        {!associationName ? (
          <div className="mb-12 rounded-[2rem] p-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                <Icon name="UserGroupIcon" size={28} />
              </div>
              <div>
                <p
                  className="m-0 font-bold text-lg text-slate-900 tracking-tight"
                  style={HEADING_FONT}
                >
                  Have an association join code?
                </p>
                <p className="m-0 mt-1 text-sm font-medium text-slate-600">
                  Link your account to access exclusive group benefits.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-[#1C4D8D] transition-all whitespace-nowrap shadow-md hover:-translate-y-0.5"
            >
              Enter Join Code
            </button>
          </div>
        ) : (
          <div className="mb-12 rounded-[2rem] p-6 flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="CheckBadgeIcon" size={24} />
            </div>
            <div>
              <p
                className="m-0 font-bold text-lg text-emerald-900 tracking-tight"
                style={HEADING_FONT}
              >
                Linked to {associationName}
              </p>
              <p className="m-0 mt-0.5 text-sm font-medium text-emerald-700">
                You are actively receiving group benefits from your association.
              </p>
            </div>
          </div>
        )}

        <JoinAssociationWidget />

        {/* ═══════════════════════════════════════════════════════════════
            DYNAMIC VIEWS
        ═══════════════════════════════════════════════════════════════ */}
        {activeView === "certificates" && (
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MyCertificatesSection key={Date.now()} />
          </div>
        )}

        {activeView === "dashboard" && (
          <div className="animate-in fade-in duration-500">
            <Hairline />

            {/* ── Recent Activity ── */}
            <div className="mb-12">
              <SectionLabel
                eyebrow="Your History"
                title="Recent Transactions"
                action={
                  <Link
                    to="/browse-discounts"
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1C4D8D] transition-all whitespace-nowrap shadow-sm"
                  >
                    View All Offers
                  </Link>
                }
              />
              <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm p-2">
                {recentTransactions.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                      <Icon
                        name="ClockIcon"
                        size={32}
                        className="text-slate-400"
                      />
                    </div>
                    <p
                      className="m-0 font-bold text-lg text-slate-900 mb-1 tracking-tight"
                      style={HEADING_FONT}
                    >
                      No transactions yet
                    </p>
                    <p className="m-0 text-sm font-medium text-slate-500">
                      Your savings history will appear here once you redeem
                      offers.
                    </p>
                  </div>
                ) : (
                  <ul className="list-none m-0 p-0">
                    {recentTransactions.map((tx, i) => (
                      <li
                        key={tx.id || i}
                        className="px-6 py-5 flex items-center gap-5 hover:bg-slate-50/50 rounded-2xl transition-colors group"
                      >
                        <div className="w-14 h-14 rounded-[1rem] flex-shrink-0 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-slate-300 transition-colors p-2">
                          {tx.business?.logoUrl ? (
                            <AppImage
                              src={tx.business.logoUrl}
                              alt={tx.business.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Icon
                              name="BuildingStorefrontIcon"
                              size={24}
                              className="text-slate-400"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 font-bold text-base text-slate-900 truncate group-hover:text-[#1C4D8D] transition-colors">
                            {tx.business?.name || "Business"}
                          </p>
                          <p className="m-0 mt-1 text-xs font-medium text-slate-500">
                            {tx.offer?.title || tx.type || "Discount"}{" "}
                            <span className="mx-1 opacity-50">•</span>
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
                          <p className="m-0 font-black text-lg text-emerald-600">
                            −${(tx.savingsAmount || 0).toFixed(2)}
                          </p>
                          <p className="m-0 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ${(tx.saleAmount || 0).toFixed(2)} Spent
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Hairline />

            {/* ── New Discounts ── */}
            <div className="mb-12">
              <SectionLabel
                eyebrow="Save Big Locally"
                title="Fresh Local Deals"
                action={
                  <Link
                    to="/discounts"
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-[#1C4D8D] transition-all whitespace-nowrap shadow-md"
                  >
                    Explore All Deals
                  </Link>
                }
              />
              {newDiscounts.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                    <Icon name="TagIcon" size={32} className="text-slate-400" />
                  </div>
                  <p
                    className="m-0 font-bold text-lg text-slate-900 mb-1 tracking-tight"
                    style={HEADING_FONT}
                  >
                    No new discounts
                  </p>
                  <Link
                    to="/browse-discounts"
                    className="text-[#1C4D8D] font-bold text-sm hover:underline"
                  >
                    Browse directory →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newDiscounts.map((discount) => (
                    <div
                      key={discount.id || discount._id}
                      className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
                    >
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl flex-shrink-0 bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-sm group-hover:border-blue-300 transition-colors overflow-hidden">
                          {discount.business?.logoUrl ? (
                            <AppImage
                              src={discount.business.logoUrl}
                              alt={discount.business?.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Icon
                              name="BuildingStorefrontIcon"
                              size={28}
                              className="text-slate-400 group-hover:text-blue-500 transition-colors"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="m-0 mb-1.5 font-bold text-lg text-slate-900 leading-tight tracking-tight truncate group-hover:text-[#1C4D8D] transition-colors">
                            {discount.business?.name || "Business"}
                          </h3>
                          <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {getCategoryLabel(discount.category) ||
                              getCategoryLabel(discount.business?.category) ||
                              "General"}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl p-5 mb-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/60 relative overflow-hidden mt-auto group-hover:bg-blue-50 transition-colors">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/40 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none" />
                        <p
                          className="m-0 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1C4D8D] to-indigo-600 tracking-tight relative z-10"
                          style={HEADING_FONT}
                        >
                          {(discount.type || "DISCOUNT") === "DISCOUNT"
                            ? `${discount.discountValue || 0}% off`
                            : `$${discount.discountValue || 0} off`}
                        </p>
                      </div>

                      <Link
                        to={`/business-profile/${discount.business?.id || discount.businessId}`}
                        className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all text-center block"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Hairline />

            {/* ── Travel Deals ── */}
            <div className="mb-12">
              <SectionLabel
                eyebrow="Exclusive Member Offers"
                title="Featured Travel Deals"
                action={
                  <Link
                    to="/travel"
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1C4D8D] transition-all whitespace-nowrap shadow-sm"
                  >
                    View All Destinations
                  </Link>
                }
              />
              {travelDeals.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200/60 rounded-[2rem] shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                    <Icon
                      name="GlobeAltIcon"
                      size={32}
                      className="text-slate-400"
                    />
                  </div>
                  <p
                    className="m-0 font-bold text-lg text-slate-900 mb-1 tracking-tight"
                    style={HEADING_FONT}
                  >
                    Checking for deals...
                  </p>
                  <p className="text-sm font-medium text-slate-500 mb-4">
                    Travel deals will appear here once configured.
                  </p>
                  <Link
                    to="/travel"
                    className="text-[#1C4D8D] font-bold text-sm hover:underline"
                  >
                    Go to Travel Portal →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {travelDeals.map((deal) => (
                    <Link
                      key={deal.id || deal._id}
                      to="/travel"
                      className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group block text-decoration-none"
                    >
                      <div className="relative h-56 bg-slate-100 overflow-hidden">
                        {(deal.image_url || deal.imageUrl || deal.image) && (
                          <AppImage
                            src={deal.image_url || deal.imageUrl || deal.image}
                            alt={deal.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-5 left-6 right-6">
                          <h3
                            className="m-0 text-xl font-bold text-white tracking-tight drop-shadow-md line-clamp-2"
                            style={HEADING_FONT}
                          >
                            {deal.title || deal.name}
                          </h3>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-between bg-white">
                        <div>
                          <p className="m-0 mb-1 text-[10px] font-black tracking-widest uppercase text-slate-400">
                            Member Price
                          </p>
                          <span
                            className="text-2xl font-black text-slate-900 tracking-tight"
                            style={HEADING_FONT}
                          >
                            $
                            {deal.member_price ||
                              deal.memberPrice ||
                              deal.price ||
                              "–"}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-[#1C4D8D] group-hover:text-white transition-colors">
                          <Icon name="ArrowRightIcon" size={18} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Hairline />

            {/* ── Provider Directory ── */}
            {providerDirectory.length > 0 && (
              <div className="mb-12">
                <SectionLabel
                  eyebrow="Partner Network"
                  title="Featured Businesses"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {providerDirectory.map((business) => (
                    <Link
                      key={business.id || business._id}
                      to={`/business-profile/${business.id || business._id}`}
                      className="bg-white border border-slate-200/60 rounded-[1.5rem] p-5 flex flex-col items-center text-center no-underline hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="w-16 h-16 rounded-2xl mb-4 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden p-1 shadow-sm group-hover:border-blue-200 transition-colors">
                        {business.logoUrl ? (
                          <AppImage
                            src={business.logoUrl}
                            alt={business.name}
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <Icon
                            name="BuildingStorefrontIcon"
                            size={28}
                            className="text-slate-400 group-hover:text-blue-500 transition-colors"
                          />
                        )}
                      </div>
                      <h3 className="m-0 mb-1 font-bold text-sm text-slate-900 truncate w-full group-hover:text-[#1C4D8D] transition-colors">
                        {business.name}
                      </h3>
                      <p className="m-0 mb-2 text-xs font-medium text-slate-500 truncate w-full">
                        {getCategoryLabel(business.category) || "General"}
                      </p>
                      <span className="mt-auto px-2.5 py-1 bg-slate-100 rounded-md text-[9px] font-black tracking-widest uppercase text-slate-500 truncate w-full">
                        {business.district || "Cayman Islands"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
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
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
          >
            <div className="px-8 pt-8 pb-6 flex items-start justify-between bg-slate-50/50 border-b border-slate-100">
              <div>
                <p className="m-0 text-[10px] font-black tracking-widest uppercase text-blue-600 mb-1.5">
                  Discount Club Cayman
                </p>
                <h3
                  className="m-0 text-2xl font-bold text-slate-900 tracking-tight"
                  style={HEADING_FONT}
                >
                  Member ID
                </h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 cursor-pointer flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center bg-white">
              <div className="rounded-[2rem] p-6 bg-white border-2 border-dashed border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <QRCodeSVG
                  value={getQrValue()}
                  size={220}
                  level="H"
                  className="relative z-10"
                />
              </div>
              <p className="m-0 mt-6 font-mono text-sm font-black tracking-[0.2em] text-slate-800 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                {(user?.id || user?._id || "UNKNOWN")
                  .toString()
                  .substring(0, 8)
                  .toUpperCase()}
              </p>
            </div>

            <div className="px-8 pb-8 text-center bg-white">
              <p className="m-0 mb-1.5 text-base font-bold text-slate-900">
                Show this code at checkout
              </p>
              <p className="m-0 text-xs font-medium text-slate-500">
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
