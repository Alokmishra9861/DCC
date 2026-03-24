// Frontend/src/user/components/ui/B2BEnquiryModal.jsx
// Opens when a user clicks "Contact this business" on a B2B partner card.
// Calls POST /api/b2b/enquire/:partnerId → lands in B2B dashboard Enquiries tab.

import React, { useState, useEffect } from "react";
import { b2bAPI, getUser } from "../../../services/api";
import AppImage from "./AppImage";

const B2BEnquiryModal = ({ partner, onClose }) => {
  const user = getUser();

  const [form, setForm] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!partner) return null;

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

  const field = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const initial = (partner.companyName || "B")[0].toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Name, email, and message are required.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await b2bAPI.submitEnquiry(partner.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || "General Enquiry",
        message: form.message.trim(),
      });
      setStatus("success");
    } catch (err) {
      setError(err.message || "Failed to send enquiry. Please try again.");
      setStatus("idle");
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D] transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-screen flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header band */}
        <div className="bg-gradient-to-br from-[#1C4D8D] to-[#163d71] px-6 pt-6 pb-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              className="w-4 h-4 text-white"
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

          {/* Partner info */}
          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-lg overflow-hidden flex-shrink-0 border-2 border-white/20">
              {partner.logoUrl ? (
                <AppImage
                  src={partner.logoUrl}
                  alt={partner.companyName}
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1C4D8D]/10 to-[#4988C4]/15">
                  <span className="text-[#1C4D8D] font-black text-2xl">
                    {initial}
                  </span>
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-0.5">
                B2B Partner
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                {partner.companyName}
              </h2>
              {displayServices && (
                <p className="text-blue-200 text-xs mt-0.5 line-clamp-1">
                  {displayServices}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Success state */}
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Enquiry sent!
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Your message has been delivered to{" "}
                <strong>{partner.companyName}</strong>. They'll be in touch at{" "}
                <strong>{form.email}</strong>.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-[#1C4D8D] text-white rounded-xl text-sm font-bold hover:bg-[#163d71] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-500 mb-5">
                Send a message directly to{" "}
                <strong className="text-slate-700">
                  {partner.companyName}
                </strong>
                . They'll receive it in their partner dashboard and respond to
                your email.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={field("name")}
                    className={inputCls}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={field("email")}
                    className={inputCls}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Phone{" "}
                    <span className="text-slate-300 normal-case tracking-normal text-[11px]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={field("phone")}
                    className={inputCls}
                    placeholder="+1 (345) 555-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Subject{" "}
                    <span className="text-slate-300 normal-case tracking-normal text-[11px]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={field("subject")}
                    className={inputCls}
                    placeholder="e.g. Marketing services"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={field("message")}
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder={`Hi ${partner.companyName}, I'm interested in your services…`}
                />
              </div>

              {/* Partner contact info (read-only reference) */}
              {(partner.phone || partner.email || partner.website) && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Their contact details
                  </p>
                  <div className="space-y-1.5">
                    {partner.phone && (
                      <a
                        href={`tel:${partner.phone}`}
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#1C4D8D] transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[#1C4D8D] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        {partner.phone}
                      </a>
                    )}
                    {partner.email && (
                      <a
                        href={`mailto:${partner.email}`}
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#1C4D8D] transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[#1C4D8D] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                        {partner.email}
                      </a>
                    )}
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#1C4D8D] transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[#1C4D8D] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                          />
                        </svg>
                        {partner.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl text-sm font-semibold hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex-1 py-3 bg-[#1C4D8D] text-white rounded-2xl text-sm font-bold hover:bg-[#163d71] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Enquiry
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
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default B2BEnquiryModal;
