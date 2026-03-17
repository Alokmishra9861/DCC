// Frontend/src/user/components/ui/MyCertificatesSection.jsx
// Standalone component used in MemberDashboardContent.
// Re-fetches every time it mounts so newly purchased certs always appear.
// Handles both flat CertificatePurchase shape AND nested { certificate: {...} } shape.

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Icon from "./AppIcon";
import { certificateAPI } from "../../../services/api";

const MyCertificatesSection = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQR, setExpandedQR] = useState(null);
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState("all");

  // ── Fetch — runs every time component mounts ────────────────────────────
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await certificateAPI.getMy();
      // Handle all possible response shapes from the backend:
      // { success, data: [...] }  OR  [...] directly
      const raw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];

      // Normalize each record so the UI always reads the same fields
      const normalized = raw.map((p) => {
        const nested = p.certificate || {};
        const nestedOffer = nested.offer || {};
        const nestedBiz = nestedOffer.business || {};
        return {
          id: p.id || p._id,
          type: p.type || nestedOffer.type || "PREPAID_CERTIFICATE",
          status: p.status || "PURCHASED",
          uniqueCode: p.uniqueCode || null,
          faceValue: p.faceValue ?? nested.faceValue ?? 0,
          memberPrice: p.amountPaid ?? nested.memberPrice ?? 0,
          discountValue: p.discountValue ?? nestedOffer.discountValue ?? null,
          minSpend: p.minSpend ?? nestedOffer.minSpend ?? null,
          businessName:
            p.businessName || nestedBiz.name || nestedOffer.title || "Business",
          businessLogoUrl: nestedBiz.logoUrl || null,
          title: p.title || nestedOffer.title || "Certificate",
          expiryDate: p.expiryDate ?? nested.expiryDate ?? null,
          purchasedAt: p.purchasedAt || p.createdAt,
          redeemedAt: p.redeemedAt || null,
        };
      });

      setPurchases(normalized);
    } catch (err) {
      setError(err.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleCopy = (cert) => {
    navigator.clipboard.writeText(cert.uniqueCode || "").then(() => {
      setCopied(cert.id);
      setTimeout(() => setCopied(null), 2500);
    });
  };

  const handleShare = (cert, platform) => {
    const code = cert.uniqueCode || "";
    const bizName = cert.businessName || "the business";
    const expiry = cert.expiryDate
      ? new Date(cert.expiryDate).toLocaleDateString()
      : "—";
    const msg = [
      `🎁 Gift certificate for ${bizName}!`,
      `💰 Value: $${cert.faceValue}`,
      `🔑 Code: ${code}`,
      `📅 Valid until: ${expiry}`,
      `Show this code at ${bizName} to redeem.`,
    ].join("\n");

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      window.open(
        `mailto:?subject=Your $${cert.faceValue} Gift Certificate&body=${encodeURIComponent(msg)}`,
        "_blank",
      );
    }
  };

  const filtered = purchases.filter((p) =>
    filter === "all" ? true : p.status === filter,
  );

  const activeCnt = purchases.filter((p) => p.status === "PURCHASED").length;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading your certificates…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon
          name="ExclamationCircleIcon"
          size={40}
          className="text-red-400 mx-auto mb-3"
        />
        <p className="text-red-500 font-medium mb-3">{error}</p>
        <button
          onClick={fetchPurchases}
          className="px-4 py-2 bg-[#1C4D8D] text-white rounded-xl text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">
            My Certificates
            {activeCnt > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-[#1C4D8D] text-white text-xs font-black rounded-full">
                {activeCnt}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Show the code or QR at the business to redeem
          </p>
        </div>
        <div className="flex items-center gap-2">
          {["all", "PURCHASED", "REDEEMED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? "bg-[#1C4D8D] text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-[#1C4D8D]"
              }`}
            >
              {f === "all" ? "All" : f === "PURCHASED" ? "Active" : "Redeemed"}
            </button>
          ))}
          <button
            onClick={fetchPurchases}
            title="Refresh"
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-400"
          >
            <Icon name="ArrowPathIcon" size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Icon
            name="TicketIcon"
            size={48}
            className="text-slate-200 mx-auto mb-4"
          />
          <p className="text-slate-500 font-medium">
            {filter === "all"
              ? "No certificates purchased yet."
              : `No ${filter === "PURCHASED" ? "active" : "redeemed"} certificates.`}
          </p>
          {filter === "all" && (
            <Link
              to="/certifications"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all"
            >
              <Icon name="ShoppingCartIcon" size={16} />
              Browse Certificates
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cert) => {
            const isPrepaid = cert.type === "PREPAID_CERTIFICATE" || !cert.type;
            const isRedeemed = cert.status === "REDEEMED";
            const isQROpen = expandedQR === cert.id;

            return (
              <div
                key={cert.id}
                className={`bg-white rounded-3xl overflow-hidden border-2 shadow-sm transition-all ${
                  isRedeemed
                    ? "border-slate-100 opacity-70"
                    : "border-slate-100 hover:border-[#1C4D8D] hover:shadow-lg"
                }`}
              >
                {/* Ticket header */}
                <div
                  className={`px-5 pt-5 pb-4 text-white ${
                    isRedeemed
                      ? "bg-slate-400"
                      : isPrepaid
                        ? "bg-gradient-to-r from-[#1C4D8D] to-[#2563eb]"
                        : "bg-gradient-to-r from-emerald-600 to-teal-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-0.5">
                        {isPrepaid ? "Prepaid Gift" : "Value-Added"}
                      </p>
                      <p className="font-bold text-base leading-tight truncate">
                        {cert.businessName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black">${cert.faceValue}</p>
                    </div>
                  </div>
                </div>

                {/* Perforation */}
                <div className="relative flex items-center bg-white">
                  <div className="absolute -left-2.5 w-5 h-5 bg-slate-50 rounded-full border border-slate-100 z-10" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-5" />
                  <div className="absolute -right-2.5 w-5 h-5 bg-slate-50 rounded-full border border-slate-100 z-10" />
                </div>

                <div className="px-5 pt-4 pb-5 space-y-3">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isRedeemed
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isRedeemed
                            ? "bg-slate-400"
                            : "bg-emerald-500 animate-pulse"
                        }`}
                      />
                      {isRedeemed ? "Redeemed" : "Active"}
                    </span>
                    {cert.expiryDate && (
                      <p className="text-xs text-slate-400">
                        Exp. {new Date(cert.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Unique code (PREPAID + not redeemed) */}
                  {isPrepaid && cert.uniqueCode && (
                    <button
                      onClick={() => !isRedeemed && handleCopy(cert)}
                      disabled={isRedeemed}
                      className={`w-full rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                        isRedeemed
                          ? "border-slate-200 cursor-default"
                          : "border-slate-200 hover:border-[#1C4D8D] hover:bg-blue-50 cursor-pointer group"
                      }`}
                    >
                      <p className="font-mono text-sm font-black tracking-widest text-slate-700 group-hover:text-[#1C4D8D] transition-colors">
                        {cert.uniqueCode}
                      </p>
                      {!isRedeemed && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                          {copied === cert.id ? (
                            <>
                              <Icon
                                name="CheckIcon"
                                size={11}
                                className="text-green-500"
                              />
                              <span className="text-green-500">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Icon name="ClipboardDocumentIcon" size={11} />
                              Tap to copy
                            </>
                          )}
                        </p>
                      )}
                    </button>
                  )}

                  {/* Value-Added: show at counter message */}
                  {!isPrepaid && !isRedeemed && (
                    <p className="text-xs text-slate-500 text-center bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                      Show this screen at <strong>{cert.businessName}</strong>
                    </p>
                  )}

                  {/* QR toggle */}
                  {!isRedeemed && (
                    <button
                      onClick={() => setExpandedQR(isQROpen ? null : cert.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
                    >
                      <Icon name="QrCodeIcon" size={14} />
                      {isQROpen ? "Hide QR" : "Show QR Code"}
                    </button>
                  )}

                  {/* QR code */}
                  {isQROpen && !isRedeemed && (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                      <QRCodeSVG
                        value={cert.uniqueCode || cert.id}
                        size={150}
                        level="H"
                        includeMargin
                      />
                      <p className="text-xs text-slate-400 mt-2 text-center">
                        Show to staff at {cert.businessName}
                      </p>
                    </div>
                  )}

                  {/* Share (PREPAID only) */}
                  {isPrepaid && !isRedeemed && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleShare(cert, "whatsapp")}
                        className="flex items-center justify-center gap-1 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#1ebe5d] transition-all"
                      >
                        <Icon name="ChatBubbleLeftIcon" size={13} />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare(cert, "email")}
                        className="flex items-center justify-center gap-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all"
                      >
                        <Icon name="EnvelopeIcon" size={13} />
                        Email
                      </button>
                    </div>
                  )}

                  {/* Redeemed stamp */}
                  {isRedeemed && cert.redeemedAt && (
                    <p className="text-xs text-slate-400 text-center">
                      Redeemed on{" "}
                      {new Date(cert.redeemedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCertificatesSection;
