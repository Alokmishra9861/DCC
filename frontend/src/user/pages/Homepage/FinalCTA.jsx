import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const FinalCTA = () => {
  const highlights = [
    { text: "Secure membership", icon: "ShieldCheckIcon" },
    { text: "Digital access — no card needed", icon: "DevicePhoneMobileIcon" },
    { text: "Pays for itself in one trip", icon: "CheckCircleIcon" },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-[#0D1328] to-[#111936] border-t border-white/8 grid-background">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[500px] bg-[#D4A62A]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="space-y-12 animate-fade-up">
          {/* Subtitle Label */}
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#D4A62A]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase text-[#D4A62A]">
              Member-Only Access
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#D4A62A]" />
          </div>

          {/* Heading */}
          <h2
            className="text-3xl md:text-5xl text-white font-extrabold leading-tight tracking-tight drop-shadow-md"
            style={HEADING_FONT}
          >
            All savings are <span className="gold-glow-text">member-only</span>.
            <br />
            See everything once you're inside.
          </h2>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#B8C0D4] max-w-2xl mx-auto font-medium">
            Join today for $119.99/year and start saving immediately. One hotel
            stay covers your entire membership cost.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Link
              to="/sign-up"
              className="btn-premium-gold w-full sm:w-auto px-10 py-4 text-base font-extrabold gap-2 flex items-center justify-center shadow-[#D4A62A]/10 hover:shadow-[#D4A62A]/30 transform hover:-translate-y-0.5 transition-transform"
            >
              Join Now — $119.99/year
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              to="/login"
              className="btn-premium-outline w-full sm:w-auto px-10 py-4 text-base font-extrabold flex items-center justify-center transform hover:-translate-y-0.5 transition-transform"
            >
              Sign In
            </Link>
          </div>

          {/* Highlights Checklist Row */}
          <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Icon name={item.icon} size={18} className="text-[#D4A62A]" />
                <span className="text-sm font-semibold text-[#B8C0D4]">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;