import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/AppIcon';

const PricingContent = () => {
     const [groceries, setGroceries] = useState(400);
  const [dining, setDining] = useState(200);
  const [services, setServices] = useState(150);

  const plans = [
    {
      id: 'plan_individual',
      name: 'Individual',
      description: 'Fixed annual membership for individuals',
      annualPrice: 'TBD',
      priceNote: 'Fixed rate',
      features: [
        'Access to all discounts',
        'Digital membership card',
        'Mobile app access',
        'Unlimited savings',
        'Certificate purchases',
        'Email support',
      ],
      cta: 'Get Started',
      href: '/membership',
      icon: 'UserIcon',
      color: 'primary',
    },
    {
      id: 'plan_business',
      name: 'Business',
      description: 'Annual membership per employee',
      annualPrice: 'TBD',
      priceNote: 'Starting at',
      features: [
        'All Individual features',
        'Employee benefit program',
        'Bulk member management',
        'Negotiable pricing for 100+ members',
        'Dedicated account support',
        'Usage analytics',
      ],
      cta: 'Contact Us',
      href: '/membership',
      icon: 'BuildingOfficeIcon',
      color: 'blue',
    },
    {
      id: 'plan_association',
      name: 'Association',
      description: 'Annual membership per member',
      annualPrice: 'TBD',
      priceNote: 'Starting at',
      features: [
        'All Individual features',
        'Member value program',
        'Bulk member management',
        'Negotiable pricing for 100+ members',
        'Priority support',
        'Co-branding options',
      ],
      cta: 'Contact Us',
      href: '/membership',
      icon: 'UserGroupIcon',
      color: 'green',
      badge: 'Best Value',
    },
  ];

  const calculateSavings = () => {
    const monthlySpend = groceries + dining + services;
    const avgDiscount = 0.25; // 25% average discount
    const monthlySavings = monthlySpend * avgDiscount;
    const annualSavings = monthlySavings * 12;
    const membershipCost = 119.99;
    const netSavings = annualSavings - membershipCost;
    return { monthlySavings, annualSavings, membershipCost, netSavings };
  };

  const savings = calculateSavings();

  const faqs = [
    {
      id: 'faq_1',
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your membership at any time. No long-term commitment required.',
    },
    {
      id: 'faq_2',
      question: 'Is there a refund policy?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied within the first 30 days, we\'ll refund your membership fee.',
    },
    {
      id: 'faq_3',
      question: 'What is the pricing for businesses with over 100 members?',
      answer: 'Business plans start at $99.99 per member/year and Association plans start at $89.99 per member/year. Organizations with more than 100 members qualify for negotiable pricing. Contact us to discuss custom rates that fit your organization.',
    },
    {
      id: 'faq_4',
      question: 'How does Business and Association pricing work?',
      answer: 'Business pricing starts at $99.99 USD per member/year and Association pricing starts at $89.99 USD per member/year. Individual membership is fixed at $119.99 USD per year. Organizations can purchase memberships for their employees or members, with negotiable rates available for 100+ members.',
    },
    {
      id: 'faq_5',
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees. The membership price is all you pay. No transaction fees, no redemption fees.',
    },
  ];
  return (
   <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-[#1C4D8D] to-[#4988C4] pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 animate-fade-up">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Plans That Pay for Themselves
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Average member saves <span className="text-white font-bold">$3,000+</span> per year
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium text-blue-50">
            <Icon name="CheckCircleIcon" size={16} className="text-[#4988C4]" />
            All plans are annual only • Pricing in USD
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 -mt-24">
        {/* Membership Plans */}
        <div className="mb-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans?.map((plan) => (
              <div
                key={plan?.id}
                className={`relative bg-white rounded-[2rem] p-8 border ${
                  plan?.color === 'primary' ? 'border-[#1C4D8D]/20 shadow-2xl scale-105 z-10' 
                  : 'border-slate-200 shadow-xl'
                } hover:shadow-2xl transition-all duration-300 flex flex-col`}
              >
                {plan?.badge && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg tracking-wide uppercase">
                    {plan?.badge}
                  </div>
                )}

                <div className="text-center mb-8 pt-4">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
                    plan?.color === 'primary' ? 'bg-[#1C4D8D]/10 text-[#1C4D8D]' :
                    plan?.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    <Icon name={plan?.icon} size={32} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                    {plan?.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">{plan?.description}</p>
                </div>

                <div className="text-center mb-8 pb-8 border-b border-slate-100">
                  {plan?.priceNote && (
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">
                      {plan?.priceNote}
                    </p>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-heading font-bold text-slate-900 tracking-tight">
                      $ TBD
                      {/* {Math.floor(plan?.annualPrice)} */}
                    </span>
                    {/* <span className="text-2xl font-heading font-bold text-slate-900">
                      .{(plan?.annualPrice % 1).toFixed(2).substring(2)}
                    </span> */}
                  </div>
                  <span className="text-slate-500 font-medium mt-2 block">
                    /member/year
                  </span>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan?.features?.map((feature, index) => (
                    <li key={`${plan?.id}_feature_${index}`} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 ${
                        plan?.color === 'primary' ? 'text-[#1C4D8D]' :
                        plan?.color === 'blue' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        <Icon name="CheckCircleIcon" size={20} variant="solid" />
                      </div>
                      <span className="text-slate-600 text-sm font-medium leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan?.href}
                  className={`block w-full px-6 py-4 rounded-xl text-center font-bold text-lg transition-all transform hover:-translate-y-1 ${
                    plan?.color === 'primary' 
                      ? 'bg-[#1C4D8D] text-white hover:bg-[#0F2854] shadow-lg shadow-blue-900/20'
                      : plan?.color === 'blue' 
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  {plan?.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center animate-fade-up animation-delay-200">
            <p className="text-slate-500">
              <strong className="text-slate-700">Negotiable Pricing:</strong> Business and Association plans with 100+ members qualify for custom negotiable pricing.
              <Link to="/contact" className="text-[#1C4D8D] hover:underline font-semibold ml-1">
                Contact us
              </Link>
              {' '}to discuss your needs.
            </p>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-4xl mx-auto mb-24 animate-fade-up">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h3 className="font-heading text-3xl font-bold text-slate-900 mb-3">
                  Calculate Your Savings
                </h3>
                <p className="text-slate-500 text-lg">
                  See how much you could save with Discount Club Cayman
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-bold text-slate-700">Monthly Groceries</label>
                      <span className="text-[#1C4D8D] font-bold bg-blue-50 px-3 py-1 rounded-lg">${groceries}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="50"
                      value={groceries}
                      onChange={(e) => setGroceries(Number(e?.target?.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1C4D8D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-bold text-slate-700">Monthly Dining</label>
                      <span className="text-[#1C4D8D] font-bold bg-blue-50 px-3 py-1 rounded-lg">${dining}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="25"
                      value={dining}
                      onChange={(e) => setDining(Number(e?.target?.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1C4D8D]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="font-bold text-slate-700">Monthly Services</label>
                      <span className="text-[#1C4D8D] font-bold bg-blue-50 px-3 py-1 rounded-lg">${services}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="25"
                      value={services}
                      onChange={(e) => setServices(Number(e?.target?.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1C4D8D]"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[#1C4D8D] opacity-50"></div>
                  <div className="relative z-10">
                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-white/10">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Monthly Savings</p>
                        <p className="text-2xl font-bold text-white">
                          ${savings?.monthlySavings?.toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Annual Savings</p>
                        <p className="text-2xl font-bold text-[#4988C4]">
                          ${savings?.annualSavings?.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm mb-2">Net Annual Savings (after membership)</p>
                      <p className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">
                        ${savings?.netSavings?.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto pb-24">
          <h3 className="font-heading text-3xl font-bold text-slate-900 mb-10 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs?.map((faq) => (
              <details
                key={faq?.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#1C4D8D]/30 hover:shadow-md transition-all group"
              >
                <summary className="font-bold text-lg text-slate-800 cursor-pointer flex items-center justify-between list-none">
                  {faq?.question}
                  <span className="bg-slate-100 rounded-full p-2 text-slate-500 group-open:bg-[#1C4D8D] group-open:text-white transition-colors">
                    <Icon name="ChevronDownIcon" size={20} className="group-open:rotate-180 transition-transform duration-300" />
                  </span>
                </summary>
                <div className="mt-4 text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out">
                  {faq?.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingContent