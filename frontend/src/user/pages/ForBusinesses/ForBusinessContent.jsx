import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const ForBusinessContent = () => {
  const offerTypes = [
    {
      title: "1. Discounts",
      desc: "Everyday retail/dining discounts (e.g., 10% off meals, special weekday offers) to keep members coming back regularly.",
      badge: "Everyday Retail",
    },
    {
      title: "2. Redeemable Certificates",
      desc: "Pre-paid vouchers (e.g., pay $90 for $100 face value) to secure planned high-value purchases and group experiences.",
      badge: "Planned Purchases",
    },
    {
      title: "3. Gift & Promotional",
      desc: "Event prizes, seasonal corporate gifts, and giveaways to elevate local community branding.",
      badge: "Promotions",
    },
    {
      title: "4. B2B Partner Offers",
      desc: "Exclusive partner-to-partner deals on office supplies, corporate catering, and professional consulting.",
      badge: "B2B Supply",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D1328] text-white">
      {/* Hero Section */}
      <div className="relative py-24 md:py-32 bg-gradient-to-b from-[#0D1328] via-[#111936] to-[#0D1328] overflow-hidden border-b border-white/8 grid-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="glow-orb w-[500px] h-[500px] bg-[#D4A62A]/10 top-[-100px] left-[-100px]" />
          <div className="glow-orb w-[600px] h-[600px] bg-[#E0B53A]/8 bottom-[-150px] right-[-150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4A62A]/15 border border-[#D4A62A]/30 rounded-full text-[#D4A62A] font-bold text-xs uppercase tracking-wider">
                🏪 For Business Partners
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
                style={HEADING_FONT}
              >
                Drive Real Demand. Not Clicks.
              </h1>
              <p className="text-base sm:text-lg text-[#B8C0D4] font-medium leading-relaxed">
                Connect your business directly to a captive audience of active,
                local Cayman members motivated to spend. DCC is not an ad network
                — it is a direct customer acquisition engine.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/sign-up"
                  className="btn-premium-gold px-8 py-4 text-base font-bold shadow-[#D4A62A]/15 hover:shadow-[#D4A62A]/30 flex items-center gap-2"
                >
                  Become a Business Partner
                  <Icon name="ArrowRightIcon" size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="btn-premium-outline px-8 py-4 text-base font-bold"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            {/* Right Mockup Dashboard */}
            <div className="glass-panel bg-[#111936]/80 p-8 rounded-3xl border border-white/8 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/8">
                <div>
                  <h3 className="font-bold text-lg text-white">Merchant Dashboard</h3>
                  <p className="text-xs text-[#8D95A8]">Real-Time Redemption Analytics</p>
                </div>
                <span className="px-3 py-1 bg-[#D4A62A]/15 text-[#D4A62A] rounded-full text-xs font-bold border border-[#D4A62A]/25">
                  Partner View
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#161F3D] rounded-2xl p-4 text-center border border-white/5">
                  <p className="text-3xl font-extrabold text-[#D4A62A]">1,204</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Total Redemptions</p>
                </div>
                <div className="bg-[#161F3D] rounded-2xl p-4 text-center border border-white/5">
                  <p className="text-3xl font-extrabold text-white">68%</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Repeat Activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exhaustive Offers Grid - Light Theme Background */}
      <div className="py-24 bg-[#F9FAFB] text-[#111827]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
              <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
                Value Channels
              </span>
            </div>
            <h2
              className="text-4xl font-extrabold text-slate-900 mb-4"
              style={HEADING_FONT}
            >
              How You Can Offer Value
            </h2>
            <p className="text-base font-semibold text-slate-500 max-w-3xl">
              DCC offers multiple distinct structural pathways to market and distribute your services directly to members.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerTypes.map((type, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <span className="px-2 py-0.5 bg-[#D4A62A]/10 text-[#D4A62A] border border-[#D4A62A]/20 rounded text-[9px] font-black uppercase tracking-wider mb-4 inline-block">
                    {type.badge}
                  </span>
                  <h3
                    className="text-lg font-bold text-slate-900 mb-3 group-hover:text-[#D4A62A] transition-colors"
                    style={HEADING_FONT}
                  >
                    {type.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {type.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates Paths Flow - Light Background */}
      <div className="py-24 bg-white text-[#111827] border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <h3
            className="text-3xl font-bold text-slate-900 text-center mb-16"
            style={HEADING_FONT}
          >
            How Certificates Flow Through DCC
          </h3>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Direct Path */}
            <div className="bg-[#F5F2EB] border border-[#D4A62A]/30 rounded-3xl p-8 relative space-y-6">
              <span className="px-3 py-1 bg-[#D4A62A]/10 text-[#D4A62A] border border-[#D4A62A]/20 rounded-full text-xs font-black uppercase tracking-wider inline-block">
                Path 1: Member Redeemable
              </span>
              <p className="text-sm font-semibold text-slate-600">
                A customer pre-purchases a dollar-value certificate at a minor discount directly from their portal, securing their commitment to purchase at your business.
              </p>
            </div>

            {/* Corporate Path */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 relative space-y-6">
              <span className="px-3 py-1 bg-slate-200 text-slate-600 border border-slate-300 rounded-full text-xs font-black uppercase tracking-wider inline-block">
                Path 2: Gift & Corporate
              </span>
              <p className="text-sm font-semibold text-slate-600">
                DCC distributes event rewards, corporate gifts, and giveaways that introduce brand-new high-value customers directly to your storefront.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Point of Sale & Scanning - Light Background */}
      <div className="py-24 bg-[#F9FAFB] text-[#111827] border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <h3
                className="text-3xl font-bold text-slate-900 mb-6"
                style={HEADING_FONT}
              >
                Frictionless Staff Integrations
              </h3>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-4">
                Redeem offers instantly without complex checkout training or legacy POS upgrades.
              </p>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                Staff simply scan the customer's unique digital QR code on any smartphone, or enter the ID manually inside the partner dashboard to verify and process discounts.
              </p>
            </div>
            {/* Right POS Mockup */}
            <div className="bg-[#111936] text-white rounded-[2rem] p-8 border border-white/8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A62A]/5 rounded-full blur-2xl pointer-events-none" />
              <h4 className="font-bold text-base text-[#D4A62A] uppercase tracking-wider mb-6">Staff Scanning View</h4>
              <div className="bg-[#161F3D] border border-white/8 rounded-2xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-[#D4A62A]/10 border border-[#D4A62A]/25 rounded-2xl flex items-center justify-center mx-auto text-[#D4A62A]">
                  <Icon name="QrCodeIcon" size={32} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Tap to Scan QR Code</p>
                  <p className="text-xs text-[#8D95A8] mt-1">Ready for redemption check</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForBusinessContent;