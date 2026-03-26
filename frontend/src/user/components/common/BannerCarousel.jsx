import React, { useState, useEffect } from "react";
import { advertisementAPI } from "../../../services/api";

const BannerCarousel = () => {
  const [banners, setBanners] = useState({
    top: [],
    middle: [],
    bottom: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState({
    top: 0,
    middle: 0,
    bottom: 0,
  });

  // Fetch active banners
  useEffect(() => {
    fetchActiveBanners();
  }, []);

  // Rotate banners every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => ({
        top: (prev.top + 1) % (banners.top.length || 1),
        middle: (prev.middle + 1) % (banners.middle.length || 1),
        bottom: (prev.bottom + 1) % (banners.bottom.length || 1),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const fetchActiveBanners = async () => {
    try {
      setLoading(true);
      const response = await advertisementAPI.getActive();
      console.log("[BannerCarousel] Fetched banners:", response);

      if (Array.isArray(response)) {
        const grouped = {
          top: response.filter((b) => b.position === "top"),
          middle: response.filter((b) => b.position === "middle"),
          bottom: response.filter((b) => b.position === "bottom"),
        };
        console.log("[BannerCarousel] Grouped banners:", grouped);
        setBanners(grouped);
      } else {
        console.warn("[BannerCarousel] Response is not an array:", response);
      }
    } catch (err) {
      console.error("[BannerCarousel] Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = async (bannerId) => {
    try {
      await advertisementAPI.click(bannerId);
    } catch (err) {
      console.error("Error tracking banner click:", err);
    }
  };

  const BannerSlot = ({ position, bannerList }) => {
    if (!bannerList || bannerList.length === 0) return null;

    const currentBanner =
      bannerList[currentBannerIndex[position] % bannerList.length];

    return (
      <div
        key={position}
        className={`banner-slot banner-${position} w-full ${
          position === "top"
            ? "h-32 md:h-40"
            : position === "middle"
              ? "h-48 md:h-56"
              : "h-32 md:h-40"
        } overflow-hidden bg-slate-100 rounded-xl relative group cursor-pointer`}
        onClick={() => {
          if (currentBanner.link) {
            handleBannerClick(currentBanner.id);
            window.open(currentBanner.link, "_blank");
          } else {
            handleBannerClick(currentBanner.id);
          }
        }}
      >
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/728x200?text=Banner";
          }}
        />

        {/* Banner title overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

        {/* Banner info on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-bold truncate">
            {currentBanner.title}
          </p>
          <p className="text-white/80 text-xs">
            {currentBanner.business?.name}
          </p>
        </div>

        {/* Carousel indicators */}
        {bannerList.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {bannerList.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentBannerIndex[position] % bannerList.length
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      {banners.top.length > 0 && (
        <BannerSlot position="top" bannerList={banners.top} />
      )}

      {/* Middle Banner */}
      {banners.middle.length > 0 && (
        <BannerSlot position="middle" bannerList={banners.middle} />
      )}

      {/* Bottom Banner */}
      {banners.bottom.length > 0 && (
        <BannerSlot position="bottom" bannerList={banners.bottom} />
      )}
    </div>
  );
};

export default BannerCarousel;
