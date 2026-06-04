import React, { useState, useEffect } from "react";
import { advertisementAPI } from "../../../services/api";

const isVideoUrl = (url) => {
  if (!url) return false;
  return (
    url.endsWith(".mp4") ||
    url.endsWith(".mov") ||
    url.endsWith(".webm") ||
    url.includes("/video/upload/") ||
    url.includes(".mp4?") ||
    url.includes(".mov?")
  );
};

const BannerApprovalPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState({});
  const [activeSubTab, setActiveSubTab] = useState("pending"); // "pending" | "prices"
  const [prices, setPrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceSaving, setPriceSaving] = useState({});

  // Fetch pending banners & prices
  useEffect(() => {
    fetchPendingBanners();
    fetchPrices();
  }, []);

  const fetchPendingBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await advertisementAPI.getPendingBanners();
      console.log("[BannerApproval] Pending banners response:", response);
      setBanners(response || []);
    } catch (err) {
      setError(err.message || "Failed to load pending banners");
      console.error("Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      setPricesLoading(true);
      const res = await advertisementAPI.getPrices();
      setPrices(res || []);
    } catch (err) {
      console.error("Error fetching prices:", err);
    } finally {
      setPricesLoading(false);
    }
  };

  const handleSavePrice = async (position, daily, weekly, monthly) => {
    setPriceSaving((prev) => ({ ...prev, [position]: true }));
    try {
      await advertisementAPI.updatePrice({
        position,
        daily: parseFloat(daily) || 0,
        weekly: parseFloat(weekly) || 0,
        monthly: parseFloat(monthly) || 0,
      });
      alert(`Pricing for ${position} position updated successfully!`);
      fetchPrices();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setPriceSaving((prev) => ({ ...prev, [position]: false }));
    }
  };

  const handleApprove = async (bannerId) => {
    setActionInProgress((prev) => ({ ...prev, [bannerId]: "approving" }));
    try {
      await advertisementAPI.setStatus(bannerId, "ACTIVE");
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      alert("Banner approved and activated!");
    } catch (err) {
      alert(`Failed to approve: ${err.message}`);
    } finally {
      setActionInProgress((prev) => {
        const updated = { ...prev };
        delete updated[bannerId];
        return updated;
      });
    }
  };

  const handleReject = async (bannerId) => {
    setActionInProgress((prev) => ({ ...prev, [bannerId]: "rejecting" }));
    try {
      await advertisementAPI.setStatus(bannerId, "REJECTED");
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      alert("Banner rejected!");
    } catch (err) {
      alert(`Failed to reject: ${err.message}`);
    } finally {
      setActionInProgress((prev) => {
        const updated = { ...prev };
        delete updated[bannerId];
        return updated;
      });
    }
  };

  // Empty state for initial load loading / errors
  if (loading && banners.length === 0 && prices.length === 0) {
    return (
      <div className="p-8">
        <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-600">Loading details...</p>
      </div>
    );
  }

  if (error && banners.length === 0) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl">
        <h2 className="text-lg font-bold text-red-900 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => {
            fetchPendingBanners();
            fetchPrices();
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Banner Ads Management
          </h1>
          <p className="text-slate-500">
            Manage approvals and configure pricing for banner placements
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-6">
        <button
          onClick={() => setActiveSubTab("pending")}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeSubTab === "pending"
              ? "border-[#1C4D8D] text-[#1C4D8D]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Pending Approvals ({banners.length})
        </button>
        <button
          onClick={() => setActiveSubTab("prices")}
          className={`pb-3 font-bold text-sm transition-all border-b-2 ${
            activeSubTab === "prices"
              ? "border-[#1C4D8D] text-[#1C4D8D]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Placement Pricing
        </button>
      </div>

      {activeSubTab === "pending" ? (
        banners.length === 0 ? (
          <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              All Caught Up!
            </h2>
            <p className="text-slate-500">
              No pending banners to approve right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                  {/* Banner Image */}
                  <div className="md:col-span-1">
                    {isVideoUrl(banner.image) ? (
                      <video
                        src={banner.image}
                        controls
                        muted
                        className="w-full h-40 object-cover rounded-xl border border-slate-200"
                      />
                    ) : (
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-40 object-cover rounded-xl border border-slate-200"
                        onError={(e) => {
                          if (e.target.src !== "data:image/svg+xml,...") {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23e2e8f0' width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Banner Details */}
                  <div className="md:col-span-2 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {banner.title}
                      </h3>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-900">
                            Business:
                          </span>{" "}
                          {banner.business?.name || "Unknown"}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-900">
                            Position:
                          </span>{" "}
                          <span className="capitalize">{banner.position}</span>
                        </p>
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-900">
                            Duration:
                          </span>{" "}
                          <span className="capitalize">{banner.duration}</span>
                        </p>
                        {banner.link && (
                          <p className="text-slate-600 truncate">
                            <span className="font-semibold text-slate-900">
                              Link:
                            </span>{" "}
                            <a
                              href={banner.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1C4D8D] hover:underline"
                            >
                              {banner.link}
                            </a>
                          </p>
                        )}
                        <p className="text-slate-500 text-xs">
                          Submitted{" "}
                          {new Date(banner.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-xs text-slate-500 mb-1">Amount Paid</p>
                      <p className="text-2xl font-bold text-[#1C4D8D]">
                        ${banner.pricePaid?.toFixed(2) || "0.00"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleApprove(banner.id)}
                        disabled={actionInProgress[banner.id] === "approving"}
                        className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {actionInProgress[banner.id] === "approving" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>✓ Approve</>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(banner.id)}
                        disabled={actionInProgress[banner.id] === "rejecting"}
                        className="w-full py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {actionInProgress[banner.id] === "rejecting" ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>✕ Reject</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Configure Placement Rates (USD)
          </h2>
          <div className="grid gap-6">
            {["top", "middle", "bottom"].map((pos) => {
              const rec = prices.find((p) => p.position === pos) || {
                position: pos,
                daily: pos === "top" ? 50 : pos === "middle" ? 40 : 30,
                weekly: pos === "top" ? 250 : pos === "middle" ? 200 : 150,
                monthly: pos === "top" ? 800 : pos === "middle" ? 600 : 450,
              };

              return (
                <div
                  key={pos}
                  className="bg-slate-50/60 border border-slate-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="min-w-[150px]">
                    <h3 className="font-bold text-slate-900 capitalize text-lg">
                      {pos} Placement
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {pos === "top"
                        ? "Header location"
                        : pos === "middle"
                          ? "Mid-feed scroll"
                          : "Footer placement"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 flex-1">
                    {["daily", "weekly", "monthly"].map((dur) => (
                      <div key={dur}>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                          {dur} Rate
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            defaultValue={rec[dur]}
                            id={`price-${pos}-${dur}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const daily = document.getElementById(`price-${pos}-daily`).value;
                      const weekly = document.getElementById(`price-${pos}-weekly`).value;
                      const monthly = document.getElementById(`price-${pos}-monthly`).value;
                      handleSavePrice(pos, daily, weekly, monthly);
                    }}
                    disabled={priceSaving[pos]}
                    className="px-6 py-2.5 bg-[#1C4D8D] text-white text-sm font-bold rounded-xl hover:bg-[#163d71] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {priceSaving[pos] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Rates"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerApprovalPage;
