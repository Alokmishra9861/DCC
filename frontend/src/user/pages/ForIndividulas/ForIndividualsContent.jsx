import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const ForIndividualsContent = () => {
  const benefits = [
    {
      id: "benefit_1",
      icon: "GlobeAmericasIcon",
      title: "Save Up to 70% on Travel",
      description:
        "Access member-only hotel rates worldwide. Save hundreds on your next vacation with exclusive travel discounts.",
      color: "bg-[#D4A62A]/10 text-[#D4A62A]",
    },
    {
      id: "benefit_2",
      icon: "BuildingStorefrontIcon",
      title: "Up to 25% off Local businesses",
      description:
        "Save on groceries, dining, auto services, wellness, and more at 150+ trusted local businesses across Cayman.",
      color: "bg-[#D4A62A]/10 text-[#D4A62A]",
    },
    {
      id: "benefit_3",
      icon: "TicketIcon",
      title: "Redeem Pre-paid Certificates",
      description:
        "Redeem valuable pre-paid certificates at premier local partners. Your membership pays for itself instantly.",
      color: "bg-[#D4A62A]/10 text-[#D4A62A]",
    },
    {
      id: "benefit_4",
      icon: "CurrencyDollarIcon",
      title: "Beat Rising Costs",
      description:
        "Combat the high cost of living in Cayman. Keep more money in your pocket with everyday compound savings.",
      color: "bg-[#D4A62A]/10 text-[#D4A62A]",
    },
  ];

  const savingsExamples = [
    { category: "Groceries", monthly: 32, annual: 384 },
    { category: "Dining Out", monthly: 55, annual: 660 },
    { category: "Auto Services", monthly: 8, annual: 96 },
    { category: "Wellness & Spa", monthly: 25, annual: 300 },
    { category: "Travel (Annual)", monthly: 0, annual: 750 },
    { category: "Misc", monthly: 35, annual: 420 },
  ];

  const totalMonthlySavings = savingsExamples.reduce(
    (sum, item) => sum + item.monthly,
    0
  );
  const totalAnnualSavings = savingsExamples.reduce(
    (sum, item) => sum + item.annual,
    0
  );

  return (
    <div className="min-h-screen bg-[#0D1328] text-white">
      {/* Hero Section - Warm Cream */}
      <div className="relative bg-white/5 backdrop-blur-md py-24 md:py-32 overflow-hidden border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#D4A62A_1px,transparent_0)] opacity-[0.04] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-[#D4A62A]/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-[#E0B53A]/5 rounded-full blur-3xl opacity-50" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md/80 border border-[#D4A62A]/20 rounded-full text-[#D4A62A] font-bold text-xs mb-6 shadow-sm uppercase tracking-wider">
              <Icon name="SparklesIcon" size={14} />
              Start Saving Today
            </div>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight"
              style={HEADING_FONT}
            >
              Membership That Pays for Itself
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-semibold">
              Join thousands of Cayman residents saving money every day on
              travel, groceries, dining, and more. Your membership investment
              returns to you in real savings.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/sign-up"
                className="btn-premium-gold px-8 py-4 text-base font-bold shadow-[#D4A62A]/10 hover:shadow-[#D4A62A]/30 flex items-center gap-2"
              >
                Join Now
                <Icon name="ArrowRightIcon" size={18} />
              </Link>
              <Link
                to="/pricing"
                className="btn-premium-outline px-8 py-4 text-base font-bold border-slate-300 text-slate-300 bg-white/5 backdrop-blur-md hover:bg-slate-50"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid - White */}
      <div className="py-24 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
              <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
                Benefits
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={HEADING_FONT}
            >
              Why Join Discount Club Cayman?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="group bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-inner`}
                >
                  <Icon name={benefit.icon} size={26} />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3 group-hover:text-[#D4A62A] transition-colors"
                  style={HEADING_FONT}
                >
                  {benefit.title}
                </h3>
                <p className="text-sm font-semibold text-slate-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Calculator - Cream */}
      <div className="py-24 bg-white/5 backdrop-blur-md border-t border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-extrabold text-white mb-4"
              style={HEADING_FONT}
            >
              Your Potential Savings
            </h2>
            <p className="text-base font-semibold text-slate-300 max-w-2xl mx-auto">
              See how much you could save with a typical family membership
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            <div className="space-y-4 mb-8">
              {savingsExamples.map((example, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-4"
                >
                  <span className="font-bold text-lg text-white">
                    {example.category}
                  </span>
                  <div className="flex justify-between sm:justify-end gap-12 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                        Monthly
                      </p>
                      <p className="font-extrabold text-lg text-white">
                        ${example.monthly}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                        Annual
                      </p>
                      <p className="font-extrabold text-lg text-[#10B981]">
                        ${example.annual}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="bg-[#111936] text-white rounded-2xl p-6 border border-white/8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <span
                  className="text-2xl font-bold text-[#D4A62A]"
                  style={HEADING_FONT}
                >
                  Total Savings
                </span>
                <div className="flex justify-between w-full md:w-auto gap-12">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#8D95A8] uppercase tracking-widest mb-1">
                      Monthly
                    </p>
                    <p
                      className="text-2xl font-black text-white"
                      style={HEADING_FONT}
                    >
                      ${totalMonthlySavings}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#8D95A8] uppercase tracking-widest mb-1">
                      Annual
                    </p>
                    <p
                      className="text-2xl font-black text-[#D4A62A]"
                      style={HEADING_FONT}
                    >
                      ${totalAnnualSavings}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-300 mt-6 text-xs font-semibold">
              *Savings based on average member usage. Your actual savings may
              vary.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works - White */}
      <div className="py-24 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2
              className="text-4xl font-extrabold text-white mb-4"
              style={HEADING_FONT}
            >
              How It Works
            </h2>
            <p className="text-base font-semibold text-slate-300 max-w-2xl mx-auto">
              Start saving in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md border border-[#D4A62A]/30 text-[#D4A62A] rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-inner">
                1
              </div>
              <h3
                className="text-xl font-bold text-white mb-3"
                style={HEADING_FONT}
              >
                Join Today
              </h3>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed max-w-xs mx-auto">
                Choose your membership tier and complete registration in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md border border-[#D4A62A]/30 text-[#D4A62A] rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-inner">
                2
              </div>
              <h3
                className="text-xl font-bold text-white mb-3"
                style={HEADING_FONT}
              >
                Browse Discounts
              </h3>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed max-w-xs mx-auto">
                Access 150+ exclusive discounts and travel rates immediately.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-md border border-[#D4A62A]/30 text-[#D4A62A] rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-inner">
                3
              </div>
              <h3
                className="text-xl font-bold text-white mb-3"
                style={HEADING_FONT}
              >
                Start Saving
              </h3>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed max-w-xs mx-auto">
                Show your membership at partnered merchants and save compoundly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gold Final CTA Section */}
      <div className="relative py-24 bg-gradient-to-r from-[#D4A62A] to-[#E0B53A] text-[#0D1328] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
          <h2
            className="text-4xl md:text-5xl font-black text-[#0D1328] tracking-tight leading-none"
            style={HEADING_FONT}
          >
            Ready to Start Saving?
          </h2>
          <p className="text-lg text-[#0D1328]/90 max-w-2xl mx-auto font-bold leading-relaxed">
            Join Discount Club Cayman today and start keeping more money in your
            pocket.
          </p>
          <div className="pt-4">
            <Link
              to="/sign-up"
              className="px-10 py-5 bg-white/5 backdrop-blur-md text-[#0D1328] rounded-full text-lg font-black shadow-2xl hover:bg-slate-50 inline-flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForIndividualsContent;