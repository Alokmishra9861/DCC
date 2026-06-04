import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

// Sub-component for individual banner slots to manage their own interval and transitions
const BannerSlot = ({ position, bannerList, label, sublabel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const progressIntervalRef = useRef(null);

  const ROTATION_TIME = 6000; // 6 seconds rotation
  const UPDATE_INTERVAL = 30; // Update progress bar every 30ms

  const currentBanner = bannerList && bannerList.length > 0 
    ? bannerList[currentIndex % bannerList.length] 
    : null;

  // Handle manual next/prev
  const handleNext = () => {
    if (bannerList.length <= 1) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerList.length);
      setProgress(0);
      setFade(true);
    }, 300);
  };

  const handlePrev = () => {
    if (bannerList.length <= 1) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + bannerList.length) % bannerList.length);
      setProgress(0);
      setFade(true);
    }, 300);
  };

  // Rotation and progress bar timers
  useEffect(() => {
    if (!bannerList || bannerList.length <= 1) {
      setProgress(100);
      return;
    }

    if (isHovered) {
      // Pause progress when hovered
      return;
    }

    const startProgressTime = Date.now() - (progress / 100) * ROTATION_TIME;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startProgressTime;
      const pct = Math.min((elapsed / ROTATION_TIME) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressIntervalRef.current);
        handleNext();
      }
    }, UPDATE_INTERVAL);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isHovered, bannerList, progress]);

  if (!currentBanner) return null;

  const handleBannerClick = async (e) => {
    // Prevent clicking manual navigation buttons from triggering banner click
    if (e.target.closest('.nav-btn')) return;

    try {
      await advertisementAPI.click(currentBanner.id);
      if (currentBanner.link) {
        window.open(currentBanner.link, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Error tracking banner click:", err);
    }
  };

  const isVideo = isVideoUrl(currentBanner.image);

  // Position-specific heights
  const slotHeights = {
    top: "h-32 md:h-44",
    middle: "h-48 md:h-64",
    bottom: "h-32 md:h-40"
  };

  return (
    <div
      className={`relative w-full ${slotHeights[position] || slotHeights.middle} rounded-[2rem] overflow-hidden shadow-xl border border-white/10 transition-all duration-500 transform hover:scale-[1.005] bg-gradient-to-r from-[#0d1326] to-[#172245] group cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBannerClick}
    >
      {/* Media Element */}
      <div 
        className="w-full h-full relative"
        style={{
          transition: "opacity 300ms ease-in-out",
          opacity: fade ? 1 : 0,
        }}
      >
        {isVideo ? (
          <video
            src={currentBanner.image}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={currentBanner.image}
            alt={currentBanner.title || "Advertisement"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
            }}
          />
        )}

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
      </div>

      {/* Floating Info Badges & Title */}
      <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between pointer-events-none select-none">
        {/* Top row */}
        <div className="flex justify-between items-start w-full">
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] md:text-xs font-black uppercase tracking-wider text-[#D4A62A] rounded-full border border-[#D4A62A]/20 shadow-md">
            Sponsored
          </span>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[9px] md:text-[10px] font-semibold text-slate-300 rounded-full border border-white/10">
            {label}
          </span>
        </div>

        {/* Bottom row */}
        <div className="space-y-1">
          <h4 className="text-white text-base md:text-xl font-bold tracking-tight drop-shadow-md truncate">
            {currentBanner.title}
          </h4>
          {currentBanner.business?.name && (
            <p className="text-[#D4A62A] text-xs md:text-sm font-semibold flex items-center gap-1 drop-shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A62A] inline-block animate-pulse"></span>
              {currentBanner.business.name}
            </p>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {bannerList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="nav-btn absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 duration-300 focus:outline-none z-10 hover:scale-105"
            aria-label="Previous ad"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="nav-btn absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 duration-300 focus:outline-none z-10 hover:scale-105"
            aria-label="Next ad"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom Rotation Progress Bar Indicator */}
      {bannerList.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4A62A] to-yellow-400 transition-all duration-30"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Progress Dots Indicator in corner */}
      {bannerList.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
          {bannerList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (idx === currentIndex) return;
                setFade(false);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setProgress(0);
                  setFade(true);
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-4 bg-[#D4A62A]"
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component for empty states/placements
const BannerPlaceholder = ({ position, label, sublabel }) => {
  const slotHeights = {
    top: "h-32 md:h-44",
    middle: "h-48 md:h-64",
    bottom: "h-32 md:h-40"
  };

  return (
    <Link
      to="/advertise"
      className={`relative w-full ${slotHeights[position] || slotHeights.middle} rounded-[2rem] overflow-hidden border-2 border-dashed border-[#1C4D8D]/30 hover:border-[#D4A62A]/50 bg-gradient-to-br from-slate-50 via-slate-100/50 to-blue-50/20 hover:from-white hover:to-blue-50/40 p-6 flex flex-col justify-between transition-all duration-500 transform hover:scale-[1.005] hover:shadow-xl group cursor-pointer`}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1C4D8D]/40 group-hover:bg-[#D4A62A] transition-colors duration-300"></span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-[#D4A62A] transition-colors duration-300">
            Ad Space Available
          </span>
        </div>
        <span className="px-3 py-1 bg-[#1C4D8D]/5 text-[10px] md:text-xs font-semibold text-[#1C4D8D]/70 group-hover:bg-[#D4A62A]/10 group-hover:text-[#D4A62A] rounded-full transition-colors duration-300">
          {label}
        </span>
      </div>

      <div className="max-w-md my-auto flex flex-col justify-center py-2">
        <h3 className="font-heading text-lg md:text-2xl font-black text-slate-800 tracking-tight mb-1.5 group-hover:text-[#1C4D8D] transition-colors">
          {label} Position
        </h3>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
          {sublabel} • Reach thousands of active members in Cayman daily with video or image banners.
        </p>
      </div>

      <div className="flex items-center justify-between w-full pt-2">
        <div className="flex gap-2 items-center">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#1C4D8D]/10 text-[#1C4D8D] group-hover:bg-[#D4A62A]/20 group-hover:text-[#D4A62A] flex items-center justify-center transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 md:w-4 md:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-600 group-hover:text-[#1C4D8D] transition-colors">
            Reserve Placement
          </span>
        </div>
        
        <span className="text-[10px] md:text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
          Learn More →
        </span>
      </div>

      {/* Decorative subtle background icon */}
      <div className="absolute right-6 bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-slate-900">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.357.205a.75.75 0 01-1.006-.293l-.707-1.226a6.012 6.012 0 01-1.182-3.18H7.5m3.001-9.18c-.253-.962-.584-1.892-.985-2.783a1.125 1.125 0 01.463-1.511l.357-.205a.75.75 0 011.006.293l.707 1.226a6.012 6.012 0 011.182 3.18H7.5m3.001 0c1.074.084 2.13.253 3.16.503a12.006 12.006 0 016.537 5.23.75.75 0 010 .852 12.006 12.006 0 01-6.537 5.23 12.083 12.083 0 01-3.16.503M10.34 7.5h3.16m-3.16 9.18h3.16m-3.16-9.18v9.18" />
        </svg>
      </div>
    </Link>
  );
};

const BannerCarousel = () => {
  const [banners, setBanners] = useState({
    top: [],
    middle: [],
    bottom: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch active banners
  useEffect(() => {
    fetchActiveBanners();
  }, []);

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

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-8 animate-pulse py-2">
        <div className="w-full h-32 md:h-44 bg-slate-200 rounded-[2rem]"></div>
        <div className="w-full h-48 md:h-64 bg-slate-200 rounded-[2rem]"></div>
        <div className="w-full h-32 md:h-40 bg-slate-200 rounded-[2rem]"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 py-2">
      {/* Top Banner Slot */}
      {banners.top.length > 0 ? (
        <BannerSlot
          position="top"
          bannerList={banners.top}
          label="Top Position"
          sublabel="Highest visibility"
        />
      ) : (
        <BannerPlaceholder
          position="top"
          label="Top Position"
          sublabel="Highest visibility"
        />
      )}

      {/* Middle Banner Slot */}
      {banners.middle.length > 0 ? (
        <BannerSlot
          position="middle"
          bannerList={banners.middle}
          label="Middle Position"
          sublabel="Mid-page scroll"
        />
      ) : (
        <BannerPlaceholder
          position="middle"
          label="Middle Position"
          sublabel="Mid-page scroll"
        />
      )}

      {/* Bottom Banner Slot */}
      {banners.bottom.length > 0 ? (
        <BannerSlot
          position="bottom"
          bannerList={banners.bottom}
          label="Bottom Position"
          sublabel="Footer placement"
        />
      ) : (
        <BannerPlaceholder
          position="bottom"
          label="Bottom Position"
          sublabel="Footer placement"
        />
      )}
    </div>
  );
};

export default BannerCarousel;
