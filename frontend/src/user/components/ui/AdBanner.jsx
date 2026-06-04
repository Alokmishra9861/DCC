import React, { useEffect, useState } from "react";
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

const AdBanner = ({ position }) => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const activeAds = await advertisementAPI.getActive(position);
        if (Array.isArray(activeAds)) {
          setAds(activeAds);
        }
      } catch (err) {
        console.error(`Failed to load ads for ${position}:`, err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [position]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false); // Trigger fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        setFade(true); // Trigger fade in
      }, 300); // Wait for fade out animation to finish (duration matching CSS transition)
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [ads]);

  if (loading || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  const handleClick = async () => {
    try {
      await advertisementAPI.click(currentAd.id);
    } catch (err) {
      console.error("Failed to track ad click:", err.message);
    }
  };

  // Premium CSS styles mapping for top/middle/bottom banners
  const bannerStyles = {
    top: "w-full max-h-[140px] mb-8",
    middle: "w-full max-h-[120px] mb-8",
    bottom: "w-full max-h-[100px] mt-8 mb-4",
  };

  const adContent = (
    <div
      onClick={handleClick}
      className={`relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 transform hover:scale-[1.01] hover:border-[#D4A62A]/40 group cursor-pointer bg-gradient-to-r from-[#111936] to-[#0D1328]`}
    >
      {isVideoUrl(currentAd.image) ? (
        <video
          src={currentAd.image}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover min-h-[80px]"
          style={{
            transition: "opacity 300ms ease-in-out",
            opacity: fade ? 1 : 0,
          }}
        />
      ) : (
        <img
          src={currentAd.image}
          alt={currentAd.title || "Advertisement"}
          className="w-full h-full object-cover min-h-[80px]"
          style={{
            transition: "opacity 300ms ease-in-out",
            opacity: fade ? 1 : 0,
          }}
        />
      )}
      {/* sponsored badge */}
      <span className="absolute top-3 right-4 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-slate-300 rounded border border-white/10 select-none">
        Sponsored
      </span>
      {/* Title overlay on hover */}
      {currentAd.title && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-xs font-bold truncate m-0">
            {currentAd.title}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${bannerStyles[position] || bannerStyles.middle}`}>
      {currentAd.link ? (
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          {adContent}
        </a>
      ) : (
        adContent
      )}
    </div>
  );
};

export default AdBanner;
