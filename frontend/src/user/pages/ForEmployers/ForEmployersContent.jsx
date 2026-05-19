import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const ForEmployersContent = () => {
  const hiddenCosts = [
    {
      title: "Focus",
      desc: "Employees spending hours at work worrying about bills and cost-of-living constraints.",
    },
    {
      title: "Morale",
      desc: "Stress from financial pressure spilling over into workplace energy and teamwork.",
    },
    {
      title: "Retention",
      desc: "Good workers forced to shop around for minor wage bumps just to balance their home budgets.",
    },
    {
      title: "Wellbeing",
      desc: "Cutting back on healthcare, active wellness, and fresh foods to manage monthly cashflow.",
    },
    {
      title: "Productivity",
      desc: "The invisible drag of constant, low-grade financial stress on daily business performance.",
    },
  ];

  const steps = [
    { title: "Plan Selection", desc: "Select the employer seats package that fits your organization size." },
    { title: "Simple Invoicing", desc: "One clean annual company invoice — no individual card details needed." },
    { title: "Direct Invites", desc: "Upload employee emails to send automated digital portal invites." },
    { title: "Digital Activation", desc: "Employees click the link, create their accounts, and instantly log in." },
    { title: "No Cards Needed", desc: "Completely digital member portal, secure and always accessible." },
    { title: "QR Redemptions", desc: "Open the DCC app at partnered local businesses and swipe to save." },
    { title: "Travel Portal", desc: "Access the private travel search engine for up to 70% off hotel rates." },
    { title: "Aggregate Reporting", desc: "Monitor company-wide total dollars saved to verify direct ROI." },
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
            {/* Left Column - Hero Content */}
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4A62A]/15 border border-[#D4A62A]/30 rounded-full text-[#D4A62A] font-bold text-xs uppercase tracking-wider">
                🏢 For Employers
              </div>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight"
                style={HEADING_FONT}
              >
                A Benefit Your Employees Will Actually Use
              </h1>
              <p className="text-base sm:text-lg text-[#B8C0D4] font-medium leading-relaxed">
                Provide real cost-of-living relief directly to your team. Mapped
                to exclusive travel, local groceries, gas, dining, and
                certificates that make every paycheck go further.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/contact"
                  className="btn-premium-gold px-8 py-4 text-base font-bold shadow-[#D4A62A]/15 hover:shadow-[#D4A62A]/30 flex items-center gap-2"
                >
                  Request Employer Pricing
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

            {/* Right Column - Employer Mockup Dashboard */}
            <div className="glass-panel bg-[#111936]/80 p-8 rounded-3xl border border-white/8 shadow-2xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/8">
                <div>
                  <h3 className="font-bold text-lg text-white">Employer Control Panel</h3>
                  <p className="text-xs text-[#8D95A8]">Enterprise Seat Management & Savings Dashboard</p>
                </div>
                <span className="px-3 py-1 bg-[#10B981]/15 text-[#10B981] rounded-full text-xs font-bold border border-[#10B981]/25">
                  Active System
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#161F3D] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-white">247</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Active Members</p>
                </div>
                <div className="bg-[#161F3D] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-[#10B981]">$28,640</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Total Dollars Saved</p>
                </div>
                <div className="bg-[#161F3D] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-white">1,842</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Redemptions</p>
                </div>
                <div className="bg-[#161F3D] border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-[#D4A62A]">76%</p>
                  <p className="text-xs font-bold text-[#8D95A8] uppercase tracking-wider mt-1">Engagement Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost-of-Living Statistics Grid */}
      <div className="py-24 bg-[#111936] border-b border-white/8 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-extrabold text-white mb-4"
              style={HEADING_FONT}
            >
              The Reality of Cayman Cost-of-Living
            </h2>
            <p className="text-sm font-bold text-[#8D95A8] uppercase tracking-wider">
              Household pressures impacting employees daily
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { val: "+14.2%", lbl: "Grocery & Food Index Increase", col: "text-[#D4A62A]" },
              { val: "CI$2,200+", lbl: "Average Monthly Housing / Rent Cost", col: "text-white" },
              { val: "78%", lbl: "Of Employees Report Financial Anxiety", col: "text-rose-400" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#161F3D]/50 border border-white/8 rounded-2xl p-6 text-center">
                <p className={`text-4xl font-extrabold ${stat.col} mb-2`} style={HEADING_FONT}>
                  {stat.val}
                </p>
                <p className="text-xs font-bold text-[#B8C0D4] uppercase tracking-wider">
                  {stat.lbl}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Costs Cards Section - Light Theme Background */}
      <div className="py-24 bg-[#F9FAFB] text-[#111827]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
              <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
                Hidden Business Costs
              </span>
            </div>
            <h2
              className="text-4xl font-extrabold text-slate-900 mb-4"
              style={HEADING_FONT}
            >
              The Hidden Drag of Financial Stress
            </h2>
            <p className="text-base font-semibold text-slate-500 max-w-3xl">
              Anxious employees cost businesses thousands of dollars in lost concentration, health problems, and staff turnover.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {hiddenCosts.map((cost, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3
                    className="text-lg font-bold text-slate-900 mb-3"
                    style={HEADING_FONT}
                  >
                    {cost.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    {cost.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Statement Quote Box - Light background */}
      <div className="py-24 bg-white text-[#111827] border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <h3
                className="text-3xl font-bold text-slate-900 mb-6"
                style={HEADING_FONT}
              >
                A Meaningful Way to Support Your Team
              </h3>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-4">
                Traditional benefits often cover catastrophic outcomes but fail to help with standard, daily grocery bills, gas fill-ups, and home expenses. DCC fills the gap.
              </p>
              <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                By purchasing DCC seats, you give employees hundreds of dollars in direct spending power and travel discounts to help them breathe easier.
              </p>
            </div>
            {/* Right Quote Card */}
            <div className="bg-[#F5F2EB] border border-[#D4A62A]/30 rounded-3xl p-8 relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4A62A]/10 text-[#D4A62A] flex items-center justify-center shrink-0 shadow-inner">
                <Icon name="LightBulbIcon" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-relaxed italic mb-4">
                  "DCC is not a replacement for fair wages. It is a powerful, low-cost supplementary tool that shows employees you care about their quality of life outside the office."
                </p>
                <p className="text-xs font-black text-[#D4A62A] tracking-wider uppercase">
                  — Discount Club Cayman
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Sequence - Light background */}
      <div className="py-24 bg-[#F9FAFB] text-[#111827] border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-extrabold text-slate-900 mb-4"
              style={HEADING_FONT}
            >
              8-Step Rollout Process
            </h2>
            <p className="text-base font-semibold text-slate-500 max-w-2xl mx-auto">
              How simple DCC makes employee enrollment
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black text-[#D4A62A] uppercase tracking-widest block mb-3">
                  Step {idx + 1}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mb-2" style={HEADING_FONT}>
                  {step.title}
                </h4>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing comparison - Dark Theme */}
      <div className="py-24 bg-[#111936] text-white border-t border-white/8 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-[#D4A62A] mb-4"
              style={HEADING_FONT}
            >
              Transparent Seat Pricing
            </h2>
            <p className="text-sm font-bold text-[#8D95A8] uppercase tracking-widest">
              Save more when enrolling your entire workforce
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
            <div className="bg-[#161F3D]/50 border border-white/8 rounded-3xl p-8 text-center flex flex-col justify-between">
              <div>
                <p className="text-xs font-black text-[#8D95A8] uppercase tracking-wider mb-2">Public Retail Rate</p>
                <p className="text-5xl font-black text-white mb-4" style={HEADING_FONT}>$119.99</p>
                <p className="text-xs text-[#B8C0D4] font-medium leading-relaxed">
                  The standard annual price paid by individual residents joining DCC.
                </p>
              </div>
            </div>

            <div className="bg-[#161F3D] border-2 border-[#D4A62A] rounded-3xl p-8 text-center flex flex-col justify-between shadow-2xl relative">
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-[#D4A62A]/10 text-[#D4A62A] border border-[#D4A62A]/20 rounded text-[9px] font-black uppercase tracking-wider">
                Corporate Rate
              </span>
              <div>
                <p className="text-xs font-black text-[#D4A62A] uppercase tracking-wider mb-2">Employer Rate</p>
                <p className="text-5xl font-black text-[#D4A62A] mb-4" style={HEADING_FONT}>$94.99</p>
                <p className="text-xs text-[#B8C0D4] font-medium leading-relaxed">
                  Special discounted price per seat for bulk corporate enrollment packages.
                </p>
              </div>
            </div>
          </div>

          {/* Value box for 100 employees */}
          <div className="bg-[#161F3D]/50 border border-white/8 rounded-2xl p-6 max-w-2xl mx-auto text-center">
            <p className="text-[#D4A62A] font-bold text-lg">
              Example: 100 Employees
            </p>
            <p className="text-sm text-[#B8C0D4] mt-2 font-medium">
              Enroll 100 employees for <span className="font-bold text-white">$9,499/year</span>. They receive up to <span className="font-bold text-white">$250,000</span> in combined potential spending power and savings. That's a massive direct ROI for your team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForEmployersContent;