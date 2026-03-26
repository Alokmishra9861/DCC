import React, { useState, useEffect } from "react";
import { advertisementAPI } from "../../../services/api";

const BannerApprovalPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState({});

  // Fetch pending banners
  useEffect(() => {
    fetchPendingBanners();
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

  // Empty state
  if (loading) {
    return (
      <div className="p-8">
        <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-600">Loading pending banners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl">
        <h2 className="text-lg font-bold text-red-900 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchPendingBanners}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Banner Approvals
          </h1>
          <p className="text-slate-500">
            Review and approve banner advertisements from businesses
          </p>
        </div>

        <div className="text-center p-8">
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
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Banner Approvals
        </h1>
        <p className="text-slate-500">
          Review and approve banner advertisements from businesses
        </p>
      </div>

      <div className="grid gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
              {/* Banner Image */}
              <div className="md:col-span-1">
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
    </div>
  );
};

export default BannerApprovalPage;
