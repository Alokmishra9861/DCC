// Frontend/src/user/pages/Pricing/PricingContent.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/AppIcon';
import { membershipAPI } from '../../../services/api';

const PricingContent = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // ROI Calculator states
  const [groceries, setGroceries] = useState(400);
  const [dining, setDining] = useState(200);
  const [services, setServices] = useState(150);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await membershipAPI.getPlans();
        const activePlans = Array.isArray(res) ? res : (res?.data ?? []);
        setPlans(activePlans);
        if (activePlans.length > 0) {
          // Pre-select Premium or the second plan by default
          const premium = activePlans.find(p => p.name.toUpperCase().includes('PREMIUM'));
          setSelectedPlanId(premium ? premium.id : activePlans[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load membership plans.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const calculateSavings = () => {
    const monthlySpend = groceries + dining + services;
    const avgDiscount = 0.25; // 25% average discount
    const monthlySavings = monthlySpend * avgDiscount;
    const annualSavings = monthlySavings * 12;
    // Use price of selected plan or fallback
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const membershipCost = selectedPlan ? selectedPlan.price : 89.00;
    const netSavings = annualSavings - membershipCost;
    return { monthlySavings, annualSavings, membershipCost, netSavings };
  };

  const savings = calculateSavings();

  const handleSelectPlanAndCheckout = (planId) => {
    navigate('/membership', { state: { selectedPlanId: planId } });
  };

  const faqs = [
    {
      id: 'faq_1',
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your membership at any time. No long-term commitment required.',
    },
    {
      id: 'faq_2',
      question: 'Is there a refund policy?',
      answer: 'We offer a 30-day money-back guarantee. If you are not satisfied within the first 30 days, we will refund your membership fee.',
    },
    {
      id: 'faq_3',
      question: 'What is the pricing for businesses with over 100 members?',
      answer: 'Business and Association plans start at competitive rates. Organizations with more than 100 members qualify for custom negotiable pricing. Contact us to discuss custom rates that fit your organization.',
    },
    {
      id: 'faq_4',
      question: 'How does Business and Association pricing work?',
      answer: 'Individual membership plans are dynamic and backed by custom comparison features. Organizations can purchase memberships in bulk for employees or members at negotiable rates. Contact support to set up an enterprise group.',
    },
    {
      id: 'faq_5',
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees. The membership price is all you pay. No transaction fees, no redemption fees.',
    },
  ];

  // Dynamic feature keys extraction for comparison table
  const allFeatureKeys = Array.from(
    new Set(plans.flatMap(p => p.features ? Object.keys(p.features) : []))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Page Header (Clean White / Blue Accent Theme) */}
      <div className="relative bg-white border-b border-slate-100 pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-100"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Plans That Pay for Themselves
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your lifestyle. Average members save <span className="text-[#1C4D8D] font-bold">$3,000+</span> per year.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200/60 rounded-full text-xs md:text-sm font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-[#1C4D8D] animate-pulse"></span>
            All plans are billed annually • Prices in KYD
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-10">
        {error && (
          <div className="max-w-3xl mx-auto mb-10 p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-sm text-red-600 font-semibold shadow-sm">
            {error}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="mb-24">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl animate-pulse h-[32rem]">
                  <div className="space-y-6">
                    <div className="h-6 bg-slate-100 rounded w-1/3 mx-auto" />
                    <div className="h-16 bg-slate-100 rounded w-1/2 mx-auto" />
                    <div className="h-32 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl max-w-2xl mx-auto">
              <p className="text-slate-400 text-sm">No active plans are currently available.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {plans.map((plan) => {
                const isPremium = plan.name.toUpperCase().includes('PREMIUM');
                const isVIP = plan.name.toUpperCase().includes('VIP');
                const isBasic = plan.name.toUpperCase().includes('BASIC');
                const isSelected = selectedPlanId === plan.id;

                // Border styles based on plan type
                let cardStyle = "bg-white border-slate-100 hover:shadow-2xl";
                let borderHighlight = "border border-slate-100";
                
                if (isBasic) {
                  borderHighlight = "border-2 border-blue-500/30";
                  if (isSelected) cardStyle = "bg-white border-2 border-blue-500 shadow-2xl scale-[1.02] z-10";
                } else if (isPremium) {
                  borderHighlight = "border-2 border-amber-400/30";
                  // Premium card has golden gradient background as requested
                  cardStyle = "bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-400/40 hover:shadow-2xl";
                  if (isSelected) cardStyle = "bg-gradient-to-br from-amber-50 to-amber-100/80 border-2 border-amber-400 shadow-2xl scale-[1.02] z-10";
                } else if (isVIP) {
                  borderHighlight = "border-2 border-purple-500/30";
                  if (isSelected) cardStyle = "bg-white border-2 border-purple-600 shadow-2xl scale-[1.02] z-10";
                }

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-[2.5rem] p-8 transition-all duration-300 flex flex-col justify-between cursor-pointer border ${cardStyle}`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#1C4D8D] text-white rounded-full text-[10px] font-bold shadow-md tracking-wider uppercase">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      {/* Top Header & Selector */}
                      <div className="flex items-center justify-between mb-6 pt-2">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? isPremium ? "border-amber-500 bg-amber-500" : isVIP ? "border-purple-600 bg-purple-600" : "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white animate-fade-in" />}
                        </span>
                        
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                          isPremium ? "bg-amber-100 text-amber-800" : isVIP ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {plan.name}
                        </span>
                      </div>

                      <div className="text-center mb-6">
                        <h3 
                          className="text-2xl font-bold text-slate-800 mb-2"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {plan.name}
                        </h3>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-[200px] mx-auto">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="text-center mb-6 pb-6 border-b border-slate-100/60">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-xs text-slate-400 font-bold self-start mt-2">
                            {plan.currency || "KYD"}
                          </span>
                          <span className="text-5xl font-bold text-slate-800 tracking-tight">
                            {(plan.currency || "").toUpperCase() === "KYD" ? "CI$" : "$"}{Math.floor(plan.price)}
                          </span>
                          <span className="text-lg font-bold text-slate-800">
                            .{(plan.price % 1).toFixed(2).substring(2)}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-semibold mt-1.5 block">
                          per {plan.billingCycle || "year"} (billed {plan.billingCycle === "year" ? "annually" : plan.billingCycle === "month" ? "monthly" : "one-time"})
                        </span>
                      </div>

                      {/* Feature Preview List */}
                      {plan.features && (
                        <ul className="space-y-3.5 mb-8">
                          {Object.entries(plan.features).slice(0, 5).map(([fKey, fVal]) => {
                            const isTrue = fVal === true;
                            const isFalse = fVal === false;
                            
                            return (
                              <li key={fKey} className="flex items-start gap-3">
                                <div className={`mt-0.5 shrink-0 ${
                                  isPremium ? "text-amber-600" : isVIP ? "text-purple-600" : "text-blue-600"
                                }`}>
                                  {isFalse ? (
                                    <span className="text-slate-300 font-bold text-sm shrink-0 leading-none">-</span>
                                  ) : (
                                    <Icon name="CheckCircleIcon" size={18} variant="solid" />
                                  )}
                                </div>
                                <span className="text-slate-600 text-xs font-medium leading-normal">
                                  <strong>{fKey}:</strong>{" "}
                                  {typeof fVal === "boolean" ? (fVal ? "Yes" : "No") : String(fVal)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlanAndCheckout(plan.id);
                      }}
                      className={`w-full py-4 rounded-2xl text-center font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-sm ${
                        isPremium
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/15'
                          : isVIP
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/15'
                            : 'bg-[#1C4D8D] hover:bg-[#163d71] text-white shadow-[#1C4D8D]/15'
                      }`}
                    >
                      Subscribe {plan.name}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              <strong className="text-slate-700 font-bold">Negotiable Pricing:</strong> Business and Association plans with 100+ members qualify for custom negotiable pricing.
              <Link to="/contact" className="text-[#1C4D8D] hover:underline font-semibold ml-1">
                Contact support
              </Link>
              {' '}to discuss your needs.
            </p>
          </div>
        </div>

        {/* Dynamic Comparison Matrix "Find the perfect plan for you" */}
        {!loading && plans.length > 0 && (
          <div className="max-w-5xl mx-auto mb-24 bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-xl overflow-hidden">
            <div className="text-center mb-10">
              <h2 
                className="text-2xl md:text-3xl font-bold text-slate-800 mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Find the perfect plan for you
              </h2>
              <p className="text-slate-500 text-sm">
                Compare features and choose the dynamic tier that perfectly fits your lifestyle
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-6 text-slate-400 text-xs font-bold uppercase tracking-wider">Features</th>
                    {plans.map(p => (
                      <th key={p.id} className="py-4 px-6 text-center">
                        <span className="text-slate-800 font-bold block text-sm">{p.name}</span>
                        <span className="text-slate-400 text-xs font-semibold">
                          {(p.currency || "").toUpperCase() === "KYD" ? "CI$" : "$"}{p.price}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allFeatureKeys.map((fKey) => (
                    <tr key={fKey} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-700 font-semibold text-xs md:text-sm">{fKey}</td>
                      {plans.map((p) => {
                        const val = p.features ? p.features[fKey] : undefined;
                        
                        return (
                          <td key={p.id} className="py-4 px-6 text-center">
                            {val === true ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">✓</span>
                            ) : val === false || val === undefined ? (
                              <span className="text-slate-300 font-bold text-sm shrink-0 leading-none">-</span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                {String(val)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROI Calculator */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h3 
                  className="text-2xl md:text-3xl font-bold text-slate-800 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Calculate Your Savings
                </h3>
                <p className="text-slate-500 text-sm">
                  See how much you could save with Discount Club Cayman
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-bold text-slate-600 text-sm">Monthly Groceries</label>
                      <span className="text-[#1C4D8D] font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">${groceries}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={groceries}
                      onChange={(e) => setGroceries(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1C4D8D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-bold text-slate-600 text-sm">Monthly Dining</label>
                      <span className="text-[#1C4D8D] font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">${dining}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="25"
                      value={dining}
                      onChange={(e) => setDining(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1C4D8D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-bold text-slate-600 text-sm">Monthly Services</label>
                      <span className="text-[#1C4D8D] font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">${services}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="25"
                      value={services}
                      onChange={(e) => setServices(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1C4D8D]"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[#1C4D8D] opacity-80"></div>
                  <div className="relative z-10">
                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/10">
                      <div>
                        <p className="text-slate-300 text-xs mb-1">Monthly Savings</p>
                        <p className="text-2xl font-bold text-white">
                          ${savings.monthlySavings.toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-300 text-xs mb-1">Annual Savings</p>
                        <p className="text-2xl font-bold text-[#4988C4]">
                          ${savings.annualSavings.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-300 text-xs mb-2">Net Annual Savings (after membership)</p>
                      <p 
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        ${savings.netSavings.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 
            className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#1C4D8D]/30 hover:shadow-md transition-all group"
              >
                <summary className="font-bold text-sm md:text-base text-slate-800 cursor-pointer flex items-center justify-between list-none">
                  {faq.question}
                  <span className="bg-slate-100 rounded-full p-2 text-slate-400 group-open:bg-amber-500 group-open:text-white transition-colors">
                    <Icon name="ChevronDownIcon" size={16} className="group-open:rotate-180 transition-transform duration-300" />
                  </span>
                </summary>
                <div className="mt-4 text-slate-500 text-xs md:text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingContent;