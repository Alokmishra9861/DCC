import React from "react";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const RollUpSection = () => {
  const breakdown = [
    {
      title: "Travel Savings",
      desc: "Save on member-only hotel rates globally",
      value: "Hundreds to thousands per trip",
      icon: "GlobeAmericasIcon",
    },
    {
      title: "Local Discounts",
      desc: "Save on dining, groceries, gas, retail, and more",
      value: "US$1,000 – US$1,500 / year",
      icon: "BuildingStorefrontIcon",
    },
    {
      title: "Redeemable Certificates",
      desc: "Get straight-dollar value from local partners",
      value: "~US$1,000 / year",
      icon: "BanknotesIcon",
    },
  ];

  return (
    <section className="relative py-24 bg-[#F9FAFB] text-[#111827] border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
              The Full Picture
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight"
            style={HEADING_FONT}
          >
            One Membership. Whole-Life Savings.
          </h2>
        </div>

        {/* Breakdown Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-[#D4A62A] rounded-2xl flex items-center justify-center mb-6 shadow-inner shrink-0">
                <Icon name={item.icon} size={22} />
              </div>
              <h3
                className="text-xl font-bold text-slate-900 mb-2"
                style={HEADING_FONT}
              >
                {item.title}
              </h3>
              <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                {item.desc}
              </p>
              <p className="text-base font-extrabold text-slate-900 mt-auto">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Dark Value Summary Panel */}
        <div className="bg-[#111936] text-white border border-white/8 rounded-[2rem] p-10 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[#D4A62A]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <p className="text-base sm:text-lg font-medium text-[#B8C0D4]">
              A <span className="font-bold text-white">US$119.99 membership</span> can realistically return
            </p>
            <p
              className="text-5xl sm:text-6xl font-black text-[#D4A62A] tracking-tight leading-none"
              style={HEADING_FONT}
            >
              US$2,600 – US$3,900+
            </p>
            <p className="text-sm font-semibold text-[#8D95A8] uppercase tracking-widest">
              per year in combined savings
            </p>
            <div className="pt-6 border-t border-white/8">
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                That's <span className="text-[#D4A62A] font-extrabold">20x–30x</span> the cost of membership.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RollUpSection;