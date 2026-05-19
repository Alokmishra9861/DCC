import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const HeroSection = () => {
  const stats = [
    {
      value: "Up to 70%",
      label: "Travel savings on member-only hotel rates globally",
    },
    {
      value: "10–25%",
      label: "Everyday savings at premier local partners",
    },
    {
      value: "$2,000",
      label: "Worth of pre-paid redeemable certificates",
    },
  ];

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-b from-[#0D1328] via-[#111936] to-[#0D1328] sm:min-h-screen -mt-16 lg:-mt-20 grid-background">
      {/* Premium Luxury Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="glow-orb w-[500px] h-[500px] bg-[#D4A62A]/10 top-[-100px] left-[-100px]" />
        <div className="glow-orb w-[600px] h-[600px] bg-[#E0B53A]/8 bottom-[-150px] right-[-150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-12 text-center sm:px-6 md:pt-36 md:pb-20">
        <div className="space-y-8 animate-fade-up md:space-y-10">
          {/* Subtitle Banner with Gold Frames */}
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4A62A]" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase text-[#D4A62A]">
              Cayman Islands' Premier Savings Membership
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4A62A]" />
          </div>

          {/* Main Headline */}
          <h1
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white animate-fade-up drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            style={HEADING_FONT}
          >
            Save on Travel. <br />
            Save Locally. <br />
            Save <span className="gold-glow-text">Every Day</span>.
          </h1>

          {/* Subhead */}
          <p className="mx-auto max-w-3xl text-lg sm:text-xl leading-relaxed text-[#B8C0D4] animate-fade-up animation-delay-100 font-medium">
            One membership that delivers real savings on travel, everyday
            essentials, and redeemable certificates worth up to $2,000.
          </p>

          {/* Stats / Metrics Grid */}
          <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl py-6 animate-fade-up animation-delay-200">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#111936]/60 border border-white/8 backdrop-blur-md rounded-2xl p-6 text-center hover:border-[#D4A62A]/20 hover:bg-[#111936]/80 transition-all duration-300 shadow-lg"
              >
                <p
                  className="text-3xl sm:text-4xl font-extrabold text-[#D4A62A] drop-shadow-[0_2px_8px_rgba(212,166,42,0.15)] mb-2"
                  style={HEADING_FONT}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[#B8C0D4]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Swipe Card Highlight */}
          <div className="relative py-2 animate-fade-up animation-delay-300">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/0 p-[1px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="rounded-[1.4rem] bg-[#111936]/80 px-6 py-5 backdrop-blur-md border border-white/5">
                <div className="flex flex-row items-center justify-center gap-4 text-white">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A62A] to-[#E0B53A] text-[#0D1328] shadow-md shadow-[#D4A62A]/10">
                    <Icon name="DevicePhoneMobileIcon" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold leading-tight text-white">
                      No physical card required — open the app and{" "}
                      <span className="font-black text-[#D4A62A]">SWIPE</span> to
                      redeem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 pt-4 animate-fade-up animation-delay-400 sm:flex-row items-center">
            <Link
              to="/sign-up"
              className="btn-premium-gold w-full sm:w-auto text-lg py-4 px-10 gap-2 flex items-center justify-center shadow-[#D4A62A]/15 hover:shadow-[#D4A62A]/30"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              to="/login"
              className="btn-premium-outline w-full sm:w-auto text-lg py-4 px-10 flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-sm text-[#8D95A8] pt-2 animate-fade-up animation-delay-500 font-bold">
            All savings are member-only. Full details visible after sign-in.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;