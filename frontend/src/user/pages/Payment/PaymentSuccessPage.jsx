// Frontend/src/user/pages/Account/Payment/PaymentSuccessPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Icon from "../../../../src/user/components/ui/AppIcon";
import {
  verifyPaymentSession,
  redeemCertificate,
  generateUniqueCode,
} from "../../../../src/services/stripeService";

// ─── Step indicator ───────────────────────────────────────────────────────────
const Steps = ({ current }) => {
  const steps = [
    { id: 1, label: "Payment", icon: "CreditCardIcon" },
    { id: 2, label: "Certificate Ready", icon: "TicketIcon" },
    { id: 3, label: "Redeem at Store", icon: "CheckBadgeIcon" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                current >= step.id
                  ? "bg-[#1C4D8D] text-white shadow-lg shadow-blue-200"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Icon name={step.icon} size={18} />
            </div>
            <span
              className={`text-xs font-semibold whitespace-nowrap ${
                current >= step.id ? "text-[#1C4D8D]" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mb-5 mx-1 transition-all ${
                current > step.id ? "bg-[#1C4D8D]" : "bg-slate-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── PREPAID ticket — shows unique code + QR + share + instructions ───────────
const PrepaidTicket = ({ cert, copied, onCopy, onShare }) => {
  const [showQR, setShowQR] = useState(false);
  return (
    <div className="max-w-lg mx-auto">
      {/* Instruction banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-[#1C4D8D] rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Icon name="InformationCircleIcon" size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[#1C4D8D] text-sm">How to redeem</p>
          <p className="text-slate-600 text-sm mt-0.5">
            Show the code or QR below to a staff member at{" "}
            <strong>{cert.businessName || "the business"}</strong>. They will
            enter it in their dashboard to confirm redemption.
          </p>
        </div>
      </div>

      {/* Ticket card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1C4D8D] to-[#2563eb] px-7 pt-7 pb-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                Prepaid Gift Certificate
              </p>
              <p className="font-bold text-xl leading-tight">
                {cert.businessName || cert.title}
              </p>
              {cert.title && cert.title !== cert.businessName && (
                <p className="text-xs opacity-70 mt-0.5">{cert.title}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-5xl font-black">${cert.faceValue}</p>
              <p className="text-xs opacity-70">face value</p>
            </div>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative flex items-center bg-white">
          <div className="absolute -left-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100 z-10" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-6" />
          <div className="absolute -right-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100 z-10" />
        </div>

        <div className="px-7 pt-5 pb-7">
          {/* Unique code */}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-2">
            Redemption Code
          </p>
          <button
            onClick={onCopy}
            className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-[#1C4D8D] hover:bg-blue-50 transition-all group mb-3"
          >
            <p className="font-mono text-2xl font-black tracking-widest text-slate-800 group-hover:text-[#1C4D8D] transition-colors select-all">
              {cert.uniqueCode}
            </p>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1">
              {copied ? (
                <>
                  <Icon name="CheckIcon" size={13} className="text-green-500" />
                  <span className="text-green-500 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Icon name="ClipboardDocumentIcon" size={13} />
                  Tap to copy code
                </>
              )}
            </p>
          </button>

          {/* QR toggle */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all mb-3"
          >
            <Icon name="QrCodeIcon" size={16} />
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </button>

          {showQR && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center mb-3">
              <QRCodeSVG
                value={cert.uniqueCode || cert.id}
                size={180}
                level="H"
                includeMargin
              />
              <p className="text-xs text-slate-400 mt-2 text-center">
                Business staff scans this to confirm redemption
              </p>
            </div>
          )}

          {cert.expiryDate && (
            <p className="text-xs text-slate-400 text-center mb-4 flex items-center justify-center gap-1">
              <Icon name="CalendarIcon" size={13} />
              Valid until{" "}
              {new Date(cert.expiryDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {/* Share buttons */}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-2">
            Send to someone as a gift
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => onShare("whatsapp")}
              className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#1ebe5d] transition-all shadow-md"
            >
              <Icon name="ChatBubbleLeftIcon" size={16} />
              WhatsApp
            </button>
            <button
              onClick={() => onShare("email")}
              className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md"
            >
              <Icon name="EnvelopeIcon" size={16} />
              Email
            </button>
          </div>
          <button
            onClick={onCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
          >
            <Icon name="LinkIcon" size={15} />
            Copy Code to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── VALUE_ADDED ticket — member shows at counter + Mark as Redeemed ─────────
const ValueAddedTicket = ({
  cert,
  redeemed,
  redeeming,
  onRedeem,
  redeemError,
}) => (
  <div className="max-w-lg mx-auto">
    {/* Instruction banner */}
    <div
      className={`border rounded-2xl p-4 mb-4 flex items-start gap-3 ${
        redeemed
          ? "bg-slate-50 border-slate-200"
          : "bg-emerald-50 border-emerald-200"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          redeemed ? "bg-slate-400" : "bg-emerald-600"
        }`}
      >
        <Icon
          name={redeemed ? "CheckCircleIcon" : "InformationCircleIcon"}
          size={16}
          className="text-white"
        />
      </div>
      <div>
        <p
          className={`font-bold text-sm ${redeemed ? "text-slate-600" : "text-emerald-800"}`}
        >
          {redeemed ? "Certificate used" : "How to redeem"}
        </p>
        <p
          className={`text-sm mt-0.5 ${redeemed ? "text-slate-500" : "text-slate-600"}`}
        >
          {redeemed
            ? "This certificate has been redeemed. Check your dashboard for your history."
            : `Show this screen to staff at ${cert.businessName || "the business"}, then tap "Mark as Redeemed" once they have confirmed.`}
        </p>
      </div>
    </div>

    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div
        className={`px-7 pt-7 pb-5 text-white ${
          redeemed
            ? "bg-slate-400"
            : "bg-gradient-to-r from-emerald-600 to-teal-500"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
              Value-Added Certificate
            </p>
            <p className="font-bold text-xl leading-tight">
              {cert.businessName || cert.title}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-5xl font-black">
              ${cert.discountValue || cert.faceValue}
            </p>
            <p className="text-xs opacity-70">discount</p>
            {cert.minSpend && (
              <p className="text-xs opacity-60">min. ${cert.minSpend}</p>
            )}
          </div>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative flex items-center bg-white">
        <div className="absolute -left-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100 z-10" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-6" />
        <div className="absolute -right-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100 z-10" />
      </div>

      <div className="px-7 pt-5 pb-7">
        {/* Status */}
        <div
          className={`rounded-2xl p-5 text-center mb-5 ${
            redeemed
              ? "bg-slate-100"
              : "bg-emerald-50 border border-emerald-100"
          }`}
        >
          {redeemed ? (
            <div className="flex items-center justify-center gap-2">
              <Icon
                name="CheckCircleIcon"
                size={28}
                className="text-slate-400"
              />
              <span className="text-xl font-bold text-slate-500">Redeemed</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xl font-bold text-emerald-700">
                Active — Ready to Use
              </span>
            </div>
          )}
        </div>

        {cert.expiryDate && (
          <p className="text-xs text-slate-400 text-center mb-5 flex items-center justify-center gap-1">
            <Icon name="CalendarIcon" size={13} />
            Valid until{" "}
            {new Date(cert.expiryDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        {redeemError && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            {redeemError}
          </p>
        )}

        {redeemed ? (
          <div className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold text-base text-center flex items-center justify-center gap-2">
            <Icon name="CheckCircleIcon" size={20} />
            Certificate Used
          </div>
        ) : (
          <button
            onClick={onRedeem}
            disabled={redeeming}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {redeeming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Marking as Redeemed…
              </>
            ) : (
              <>
                <Icon name="CheckBadgeIcon" size={22} />
                Mark as Redeemed
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── Main PaymentSuccessPage ──────────────────────────────────────────────────
const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");

  const [status, setStatus] = useState("loading"); // loading | pending | success | error
  const [pendingMsg, setPendingMsg] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }
      try {
        const data = await verifyPaymentSession(sessionId);
        if (data.pending) {
          setPendingMsg(data.message || "Your certificate is being processed…");
          setStatus("pending");
          return;
        }
        const cert = data.certificate || data;
        if (cert.status === "REDEEMED") setRedeemed(true);
        setCertificate(cert);
        setStatus("success");
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
      }
    };
    verify();
  }, [sessionId, pollCount]);

  const handleCopy = useCallback(() => {
    if (!certificate?.uniqueCode) return;
    navigator.clipboard.writeText(certificate.uniqueCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [certificate]);

  const handleShare = useCallback(
    (platform) => {
      const code = certificate?.uniqueCode || "";
      const bizName = certificate?.businessName || "the business";
      const expiry = certificate?.expiryDate
        ? new Date(certificate.expiryDate).toLocaleDateString()
        : "—";
      const msg = [
        `🎁 Here's your gift certificate for ${bizName}!`,
        ``,
        `💰 Value: $${certificate?.faceValue}`,
        `🔑 Code: ${code}`,
        `📅 Valid until: ${expiry}`,
        ``,
        `Show this code at ${bizName} to redeem.`,
      ].join("\n");

      if (platform === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
      } else {
        window.open(
          `mailto:?subject=Your $${certificate?.faceValue} Gift Certificate for ${bizName}&body=${encodeURIComponent(msg)}`,
          "_blank",
        );
      }
    },
    [certificate],
  );

  const handleRedeem = useCallback(async () => {
    setRedeeming(true);
    setRedeemError("");
    try {
      await redeemCertificate({
        purchaseId: certificate?._id || certificate?.id,
      });
      setRedeemed(true);
    } catch (err) {
      setRedeemError(err.message || "Redemption failed. Please try again.");
    } finally {
      setRedeeming(false);
    }
  }, [certificate]);

  const isPrepaid =
    (certificate?.type || type || "PREPAID_CERTIFICATE") ===
    "PREPAID_CERTIFICATE";

  // ── Loading ─────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-slate-600 font-semibold text-lg">
            Confirming your payment…
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Please don't close this page
          </p>
        </div>
      </div>
    );
  }

  // ── Pending ──────────────────────────────────────────────────────────────
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="ClockIcon" size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Payment Received!
          </h2>
          <p className="text-slate-500 mb-8">{pendingMsg}</p>
          <button
            onClick={() => {
              setStatus("loading");
              setPollCount((c) => c + 1);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-semibold hover:bg-blue-800 transition-all"
          >
            <Icon name="ArrowPathIcon" size={18} />
            Check Again
          </button>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="XCircleIcon" size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Verification Failed
          </h2>
          <p className="text-slate-500 mb-2">
            We couldn't confirm your payment. If you were charged, contact
            support with:
          </p>
          <p className="font-mono text-xs text-slate-400 bg-slate-100 rounded-lg p-2 mb-8 break-all">
            {sessionId || "No session ID"}
          </p>
          <Link
            to="/certifications"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-semibold hover:bg-blue-800 transition-all"
          >
            <Icon name="ArrowLeftIcon" size={18} />
            Back to Certificates
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
            <Icon name="CheckCircleIcon" size={44} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            {isPrepaid
              ? "Your gift certificate is ready. Share the code with anyone or use it yourself."
              : "Your discount certificate is active. Show it at the business and tap 'Mark as Redeemed'."}
          </p>
        </div>

        {/* Step indicator — show step 2 (cert ready) or step 3 (redeemed) */}
        <Steps current={redeemed ? 3 : 2} />

        {/* Certificate ticket */}
        {isPrepaid ? (
          <PrepaidTicket
            cert={certificate}
            copied={copied}
            onCopy={handleCopy}
            onShare={handleShare}
          />
        ) : (
          <ValueAddedTicket
            cert={certificate}
            redeemed={redeemed}
            redeeming={redeeming}
            onRedeem={handleRedeem}
            redeemError={redeemError}
          />
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            to="/member-dashboard"
            state={{ openCertificates: true }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1C4D8D] text-white rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-md"
          >
            <Icon name="TicketIcon" size={18} />
            View in My Certificates
          </Link>
          <Link
            to="/certifications"
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all"
          >
            <Icon name="ShoppingCartIcon" size={18} />
            Buy More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
