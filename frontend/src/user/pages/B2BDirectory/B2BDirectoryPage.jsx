// Frontend/src/user/pages/B2BDirectory/B2BDirectoryPage.jsx
// Premium redesign — luxury editorial aesthetic
// Deep navy hero, large logo showcase, animated cards, gold verified treatment

import React, { useState, useEffect, useCallback } from "react";
import { b2bAPI, getUser } from "../../../services/api";
import AppImage from "../../components/ui/AppImage";
import B2BEnquiryModal from "../../components/ui/B2BEnquiryModal";

// ─── Color palette for auto-assigned partner accent colors ────────────────────
const PARTNER_PALETTES = [
  { bg: "from-[#0f2952] to-[#1C4D8D]", ring: "#1C4D8D", text: "#ffffff" },
  { bg: "from-[#0d4f3c] to-[#0f7a5a]", ring: "#0f7a5a", text: "#ffffff" },
  { bg: "from-[#4a1942] to-[#8b2fc9]", ring: "#8b2fc9", text: "#ffffff" },
  { bg: "from-[#5c1f00] to-[#c2440e]", ring: "#c2440e", text: "#ffffff" },
  { bg: "from-[#1a1a2e] to-[#16213e]", ring: "#e94560", text: "#ffffff" },
  { bg: "from-[#003049] to-[#0077b6]", ring: "#0077b6", text: "#ffffff" },
];

const getPalette = (id = "") =>
  PARTNER_PALETTES[id.charCodeAt(0) % PARTNER_PALETTES.length] ||
  PARTNER_PALETTES[0];

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ i }) => (
  <div
    className="animate-pulse rounded-3xl overflow-hidden border border-slate-100 shadow-md"
    style={{ animationDelay: `${i * 80}ms` }}
  >
    <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200" />
    <div className="bg-white p-6 space-y-3">
      <div className="h-5 bg-slate-100 rounded-full w-3/5" />
      <div className="h-3.5 bg-slate-100 rounded-full w-full" />
      <div className="h-3.5 bg-slate-100 rounded-full w-4/5" />
      <div className="h-3 bg-slate-100 rounded-full w-2/3 mt-1" />
      <div className="h-11 bg-slate-100 rounded-2xl mt-4" />
    </div>
  </div>
);

// ─── Premium partner card ─────────────────────────────────────────────────────
const PartnerCard = ({ partner, onContact, index }) => {
  const initial = (partner.companyName || "B")[0].toUpperCase();
  const palette = getPalette(partner.id);
  const [imgErr, setImgErr] = useState(false);

  // Parse services from servicesOffered field (handles both JSON and plain text)
  const parseServices = () => {
    if (!partner.servicesOffered) return "";
    try {
      const parsed = JSON.parse(partner.servicesOffered);
      if (Array.isArray(parsed)) {
        return parsed
          .map((s) => (typeof s === "string" ? s : s.name || "Service"))
          .join(" • ");
      }
      if (typeof parsed === "object" && parsed.name) {
        return parsed.name;
      }
      return partner.servicesOffered;
    } catch {
      // Not JSON, return as-is
      return partner.servicesOffered;
    }
  };

  const displayServices = parseServices();

  return (
    <div
      className="group relative bg-white rounded-3xl border border-slate-100/80 shadow-md
                 hover:shadow-2xl hover:-translate-y-2 hover:border-slate-200
                 transition-all duration-500 ease-out overflow-hidden flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* ── Banner / logo showcase area ── */}
      <div
        className={`relative h-44 bg-gradient-to-br ${palette.bg} overflow-hidden flex-shrink-0`}
      >
        {/* Geometric mesh texture */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={`grid-${partner.id}`}
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${partner.id})`} />
        </svg>

        {/* Decorative orbs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/8 blur-lg" />

        {/* Verified badge top-right */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/15 backdrop-blur-md
                        border border-white/25 rounded-full px-3 py-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
            Verified
          </span>
        </div>

        {/* ── Logo — large, centered, prominent ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          {partner.logoUrl && !imgErr ? (
            <div
              className="w-24 h-24 rounded-2xl bg-white shadow-2xl overflow-hidden
                            ring-4 ring-white/30 group-hover:scale-105 transition-transform duration-500"
            >
              <AppImage
                src={partner.logoUrl}
                alt={partner.companyName}
                className="w-full h-full object-contain p-2"
                onError={() => setImgErr(true)}
              />
            </div>
          ) : (
            <div
              className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm shadow-2xl
                            border-2 border-white/40 flex items-center justify-center
                            ring-4 ring-white/20 group-hover:scale-105 transition-transform duration-500"
            >
              <span
                className="text-white font-black text-4xl tracking-tight select-none"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {initial}
              </span>
            </div>
          )}
        </div>

        {/* Company name overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-5 pt-8 pb-3">
          <h3
            className="text-white font-black text-lg leading-tight tracking-tight truncate capitalize"
            style={{
              fontFamily: "'Georgia', serif",
              textShadow: "0 1px 8px rgba(0,0,0,0.4)",
            }}
          >
            {partner.companyName}
          </h3>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
        {/* Services description or tags */}
        {displayServices ? (
          <div className="mb-4 flex-1">
            {/* Check if it looks like a list (contains bullet points) */}
            {displayServices.includes(" • ") ? (
              <div className="flex flex-wrap gap-1.5">
                {displayServices.split(" • ").map((service, idx) => (
                  <span
                    key={idx}
                    className="inline-block text-[10px] font-medium px-2.5 py-1 
                              rounded-full bg-[#1C4D8D]/8 text-[#1C4D8D] 
                              border border-[#1C4D8D]/15 whitespace-nowrap"
                  >
                    {service.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                {displayServices}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1 mb-4" />
        )}

        {/* Contact details row */}
        <div className="space-y-2 mb-4">
          {partner.phone && (
            <a
              href={`tel:${partner.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 group/item"
            >
              <span
                className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center
                              justify-center flex-shrink-0 group-hover/item:bg-[#1C4D8D]/8 transition-colors"
              >
                <svg
                  className="w-3 h-3 text-[#1C4D8D]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
              </span>
              <span className="text-[12px] text-slate-500 group-hover/item:text-[#1C4D8D] transition-colors truncate font-medium">
                {partner.phone}
              </span>
            </a>
          )}

          {partner.email && (
            <a
              href={`mailto:${partner.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 group/item"
            >
              <span
                className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center
                               justify-center flex-shrink-0 group-hover/item:bg-[#1C4D8D]/8 transition-colors"
              >
                <svg
                  className="w-3 h-3 text-[#1C4D8D]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </span>
              <span className="text-[12px] text-slate-500 group-hover/item:text-[#1C4D8D] transition-colors truncate font-medium">
                {partner.email}
              </span>
            </a>
          )}

          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 group/item"
            >
              <span
                className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center
                              justify-center flex-shrink-0 group-hover/item:bg-[#1C4D8D]/8 transition-colors"
              >
                <svg
                  className="w-3 h-3 text-[#1C4D8D]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                  />
                </svg>
              </span>
              <span className="text-[12px] text-slate-500 group-hover/item:text-[#1C4D8D] transition-colors truncate font-medium">
                {partner.website.replace(/^https?:\/\//, "")}
              </span>
            </a>
          )}
        </div>

        {/* ── CTA button ── */}
        <button
          onClick={() => onContact(partner)}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all duration-300
                     bg-[#0f2952] text-white hover:bg-[#1C4D8D]
                     flex items-center justify-center gap-2
                     shadow-lg shadow-[#0f2952]/20 hover:shadow-[#1C4D8D]/30
                     group-hover:scale-[1.02] mt-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
          Send Enquiry
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const B2BDirectoryPage = () => {
  const user = getUser();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [mounted, setMounted] = useState(false);

  const PAGE_SIZE = 12;

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async (pg = 1, q = "", append = false) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    setError("");
    try {
      const params = { limit: PAGE_SIZE, page: pg };
      if (q && q.trim()) params.search = q.trim();
      const res = await b2bAPI.getDirectory(params);
      const list = res?.partners ?? (Array.isArray(res) ? res : []);
      const tot = res?.pagination?.total ?? list.length;
      const pages = res?.pagination?.totalPages ?? 1;
      setTotal(tot);
      setHasMore(pg < pages);
      setPartners((prev) => (append ? [...prev, ...list] : list));
      setPage(pg);
    } catch (err) {
      setError(err.message || "Failed to load B2B directory");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1, search, false);
  }, [search, load]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleLoadMore = () => load(page + 1, search, true);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen" style={{ background: "#f8f9fc" }}>
        {/* ══════════════════════════════════════════════════════════════════
            HERO BANNER — deep navy with mesh grid and floating orbs
        ══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-white shadow-lg shadow-slate-200/40">
          {/* Subtle blue accent blob at bottom */}
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #1C4D8D 0%, transparent 70%)",
            }}
          />

          <div className="relative max-w-7xl mx-auto px-5 py-16 md:py-28">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 md:gap-12">
              <div
                className="flex-1 transition-all duration-700"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(24px)",
                }}
              >
                {/* Premium category pill */}
                <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#1C4D8D]/20 bg-[#1C4D8D]/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1C4D8D]" />
                  <span className="text-[#1C4D8D] text-[10px] font-semibold uppercase tracking-[0.15em]">
                    Premium Partners
                  </span>
                </div>

                {/* Main headline */}
                <div className="mb-6">
                  <h1
                    className="text-slate-900 leading-tight mb-0"
                    style={{
                      fontSize: "clamp(2rem, 5.5vw, 3.5rem)",
                      fontFamily: "'Georgia', serif",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    B2B Partner
                  </h1>
                  <h2
                    className="text-[#1C4D8D]"
                    style={{
                      fontSize: "clamp(2rem, 5.5vw, 3.5rem)",
                      fontFamily: "'Georgia', serif",
                      fontStyle: "italic",
                      fontWeight: 300,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Directory
                  </h2>
                </div>

                {/* Subtitle */}
                <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg font-medium">
                  {user?.role === "EMPLOYER"
                    ? "Discover vetted service providers exclusively for your business growth."
                    : user?.role === "ASSOCIATION"
                      ? "Connect your network with trusted B2B specialists across the Cayman Islands."
                      : "Access premium, vetted service providers and strategic business partners exclusively for DCC members."}
                </p>
              </div>

              {/* Hero stats with premium styling */}
              {!loading && total > 0 && (
                <div
                  className="flex gap-3 md:gap-4 transition-all duration-700 delay-200"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(24px)",
                  }}
                >
                  <div className="px-6 py-4 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div
                      className="text-3xl font-black text-[#1C4D8D] group-hover:text-slate-900 transition-colors"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {total}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.12em] mt-1 font-semibold">
                      Verified Partner{total !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="px-6 py-4 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-md hover:shadow-xl hover:bg-emerald-100 transition-all duration-300 group">
                    <div
                      className="text-3xl font-black text-emerald-600 group-hover:text-emerald-700 transition-colors"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      ★
                    </div>
                    <div className="text-[10px] text-emerald-700 uppercase tracking-[0.12em] mt-1 font-semibold">
                      All Approved
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Search bar — inside hero ── */}
            <div
              className="mt-10 max-w-2xl transition-all duration-700 delay-300"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <div className="relative bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200 shadow-xl shadow-slate-300/30 hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by company name or service…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 rounded-2xl text-sm text-slate-800 placeholder-slate-400
                             outline-none transition-all duration-200 bg-transparent
                             focus:border-[#1C4D8D]"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                               bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {searchInput && (
                <p className="text-slate-500 text-xs mt-2 ml-1">
                  {loading
                    ? "Searching…"
                    : `${total} result${total !== 1 ? "s" : ""} for "${searchInput}"`}
                </p>
              )}
            </div>
          </div>

          {/* Bottom fade to content area */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{
              background: "linear-gradient(to bottom, transparent, #f8f9fc)",
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CONTENT AREA
        ══════════════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-5 pb-16 pt-10">
          {/* Error */}
          {error && (
            <div
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600
                            flex items-center gap-3 shadow-md"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} i={i} />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-lg">
              <div
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#0f2952] to-[#1C4D8D]
                              flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#1C4D8D]/20"
              >
                <svg
                  className="w-12 h-12 text-white/70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                  />
                </svg>
              </div>
              <p
                className="font-black text-slate-800 text-xl mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {search ? "No partners found" : "No B2B partners yet"}
              </p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                {search
                  ? `No results for "${search}". Try different keywords.`
                  : "B2B partners are being reviewed and approved. Check back soon."}
              </p>
              {search && (
                <button
                  onClick={() => setSearchInput("")}
                  className="mt-6 px-7 py-3 bg-[#0f2952] text-white rounded-2xl text-sm font-bold
                             hover:bg-[#1C4D8D] transition-colors shadow-lg shadow-[#0f2952]/20"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Section label */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {search ? `Results for "${search}"` : "All verified partners"}
                </p>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {total} partner{total !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {partners.map((partner, i) => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    onContact={setSelectedPartner}
                    index={i}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group px-10 py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl
                               text-sm font-bold hover:border-[#1C4D8D] hover:text-[#1C4D8D]
                               transition-all disabled:opacity-60 flex items-center gap-2.5 shadow-md
                               hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-200 border-t-[#1C4D8D] rounded-full animate-spin" />
                        Loading more…
                      </>
                    ) : (
                      <>
                        Load more partners
                        <svg
                          className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}

              {!hasMore && partners.length > 0 && (
                <div className="flex items-center gap-4 mt-12">
                  <div className="flex-1 h-px bg-slate-100" />
                  <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider whitespace-nowrap">
                    All {total} partner{total !== 1 ? "s" : ""} shown
                  </p>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enquiry modal */}
      {selectedPartner && (
        <B2BEnquiryModal
          partner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}
    </>
  );
};

export default B2BDirectoryPage;
