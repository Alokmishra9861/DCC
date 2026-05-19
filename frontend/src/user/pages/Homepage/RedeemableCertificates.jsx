import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const RedeemableCertificates = () => {
  const cards = [
    {
      tier: "STANDARD",
      value: "$25",
      sub: "Certificate Value",
      footer: "Dining & everyday services",
      highlight: false,
    },
    {
      tier: "PREMIUM",
      value: "$50",
      sub: "Certificate Value",
      footer: "Popular local businesses",
      highlight: true,
    },
    {
      tier: "ELITE",
      value: "$100",
      sub: "Certificate Value",
      footer: "Premium services & experiences",
      highlight: false,
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
              Redeemable Certificates
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 tracking-tight"
            style={HEADING_FONT}
          >
            Real Spending Power at Local Businesses
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-semibold max-w-3xl">
            Straight-dollar value you can actually use — not gimmicks, actual
            purchasing power.
          </p>
        </div>

        {/* Value Tiers Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                card.highlight
                  ? "border-2 border-[#D4A62A] scale-[1.02]"
                  : "border border-slate-200/60"
              }`}
            >
              {/* Card Header Info */}
              <div className="p-8 text-center border-b border-slate-100 flex-1 flex flex-col justify-center">
                <span
                  className={`text-xs font-black tracking-[0.2em] uppercase mb-4 block ${
                    card.highlight ? "text-[#D4A62A]" : "text-slate-400"
                  }`}
                >
                  {card.tier}
                </span>
                <p
                  className="text-6xl font-black text-slate-900 leading-none mb-3"
                  style={HEADING_FONT}
                >
                  {card.value}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {card.sub}
                </p>
              </div>

              {/* Card Footer Info */}
              <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 text-center">
                <p className="m-0 text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  {card.footer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Split Value Summary Banner */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm mb-12">
          <div className="grid lg:grid-cols-2">
            {/* Left Box - Dark Background */}
            <div className="bg-[#111936] p-10 md:p-12 text-center flex flex-col items-center justify-center text-white border-r border-white/8 relative">
              <div className="absolute inset-0 bg-[#D4A62A]/5 rounded-full blur-3xl pointer-events-none" />
              <p className="text-[10px] font-black tracking-widest uppercase text-[#8D95A8] mb-3">
                Estimated Annual Certificate Value
              </p>
              <p
                className="text-4xl sm:text-5xl font-extrabold text-[#D4A62A] tracking-tight leading-none mb-3"
                style={HEADING_FONT}
              >
                ~US$1,000
              </p>
              <p className="text-sm font-semibold text-[#B8C0D4]">per year</p>
            </div>

            {/* Right Box - Light Background explaining how it works */}
            <div className="p-10 md:p-12 flex flex-col justify-center">
              <h4
                className="text-xl font-bold text-slate-900 mb-4"
                style={HEADING_FONT}
              >
                How it works
              </h4>
              <ul className="list-none m-0 p-0 space-y-3.5">
                {[
                  "Certificates are issued directly inside your digital member portal",
                  "Redeemable for real face-value purchases at partnered local merchants",
                  "Offers premium coverage and simple check-out integration",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 mt-0.5 border border-[#10B981]/25">
                      <Icon name="CheckIcon" size={12} className="stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            to="/certification"
            className="inline-flex items-center gap-2 text-[#D4A62A] font-extrabold text-sm hover:underline"
          >
            Browse certificates
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RedeemableCertificates;