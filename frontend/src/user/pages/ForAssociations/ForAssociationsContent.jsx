import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const ForAssociationsContent = () => {
  const structurePaths = [
    {
      title: "Path 1: Direct to Individual Members",
      desc: "Perfect for professional associations, non-profit clubs, and alumni groups who want to deliver value straight to single individuals.",
      badge: "Direct Members",
    },
    {
      title: "Path 2: Through Employer / Business Members",
      desc: "Ideal for Chambers of Commerce, trade associations, and B2B alliances looking to bundle corporate seats for group workforces.",
      badge: "Bundled Corporate",
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
                👥 For Associations
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
                style={HEADING_FONT}
              >
                Supercharge Your Association Value
              </h1>
              <p className="text-base sm:text-lg text-[#B8C0D4] font-medium leading-relaxed">
                Partner with DCC to distribute negotiated preferred rates that
                instantly pay back your members' dues. Drive organizational retention
                and unlock new recurring revenue channels.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/sign-up"
                  className="btn-premium-gold px-8 py-4 text-base font-bold shadow-[#D4A62A]/15 hover:shadow-[#D4A62A]/30 flex items-center gap-2"
                >
                  Become an Association Partner
                  <Icon name="ArrowRightIcon" size={18} />
                </Link>
                <Link
                  to="/contact"
                  className="btn-premium-outline px-8 py-4 text-base font-bold"
                >
                  See Preferred Pricing
                </Link>
              </div>
            </div>

            {/* Right Mockup Dashboard */}
            <div className="glass-panel bg-[#111936]/80 p-8 rounded-3xl border border-white/8 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/8">
                <div>
                  <h3 className="font-bold text-lg text-white">Association Dashboard</h3>
                  <p className="text-xs text-[#8D95A8]">Enterprise Membership Integration Panel</p>
                </div>
                <span className="px-3 py-1 bg-[#10B981]/15 text-[#10B981] rounded-full text-xs font-bold border border-[#10B981]/25">
                  Active Partner
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#161F3D] rounded-2xl p-4 text-center border border-white/5">
                  <p className="text-3xl font-extrabold text-white">984</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Active Members</p>
                </div>
                <div className="bg-[#161F3D] rounded-2xl p-4 text-center border border-white/5">
                  <p className="text-3xl font-extrabold text-[#D4A62A]">79%</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Engagement Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structure Paths - Light Theme Background */}
      <div className="py-24 bg-[#F9FAFB] text-[#111827]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
              <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
                Structure Paths
              </span>
            </div>
            <h2
              className="text-4xl font-extrabold text-slate-900 mb-4"
              style={HEADING_FONT}
            >
              Choose Your Distribution Structure
            </h2>
            <p className="text-base font-semibold text-slate-500 max-w-3xl">
              We configure DCC around your unique organizational architecture, whether distributing directly or bundling with corporate entities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {structurePaths.map((path, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <span className="px-3 py-1 bg-[#D4A62A]/10 text-[#D4A62A] border border-[#D4A62A]/20 rounded-full text-[10px] font-black uppercase tracking-wider mb-6 inline-block">
                    {path.badge}
                  </span>
                  <h3
                    className="text-xl font-bold text-slate-900 mb-4 group-hover:text-[#D4A62A] transition-colors"
                    style={HEADING_FONT}
                  >
                    {path.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                    {path.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reseller / Margin Pricing Box - Dark Theme */}
      <div className="py-24 bg-[#111936] text-white border-t border-white/8 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[#D4A62A] mb-4"
              style={HEADING_FONT}
            >
              Unlock Direct Member Pricing & Revenue
            </h2>
            <p className="text-sm font-bold text-[#8D95A8] uppercase tracking-widest">
              Preferred organizational rates that leave margin for your association
            </p>
          </div>

          <div className="bg-[#161F3D] border border-white/8 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white text-center pb-4 border-b border-white/8" style={HEADING_FONT}>
              Step-Down Preferred Reseller Tier
            </h3>

            <div className="space-y-4">
              {[
                { label: "Public Retail Price", value: "$119.99 / year" },
                { label: "Employer Rate (Corporate)", value: "$94.99 / year" },
                { label: "Association Wholesale Cost", value: "$84.99 / year", highlight: true },
                { label: "Suggested Member Resale Price", value: "$89.99 / year" },
                { label: "Your Association Profit Margin", value: "$5.00 / seat", highlight: true },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center py-3 px-4 rounded-xl ${
                    row.highlight ? "bg-[#D4A62A]/10 border border-[#D4A62A]/25" : "border-b border-white/5"
                  }`}
                >
                  <span className={`text-sm font-semibold ${row.highlight ? "text-[#D4A62A]" : "text-[#B8C0D4]"}`}>
                    {row.label}
                  </span>
                  <span className={`text-sm font-bold ${row.highlight ? "text-[#D4A62A] text-base" : "text-white"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Total value demonstration */}
            <div className="bg-[#0D1328] rounded-2xl p-6 text-center border border-white/5">
              <p className="text-white text-sm font-medium">
                Example: Reselling <span className="font-bold text-[#D4A62A]">1,000 seats</span> to your members returns a direct, recurring <span className="font-bold text-[#D4A62A]">$5,000/year</span> in association funding, while saving your collective members up to <span className="font-bold text-[#D4A62A]">$2.5 Million</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForAssociationsContent;