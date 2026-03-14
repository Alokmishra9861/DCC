import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const ForBusinessContent = () => {
    const ecosystemFeatures = [
    {
      id: 'eco_1',
      icon: 'UserGroupIcon',
      title: 'Market Size',
      description: 'Carefully managed member base'
    },
    {
      id: 'eco_2',
      icon: 'BuildingStorefrontIcon',
      title: 'Industry Density',
      description: 'Balanced category distribution'
    },
    {
      id: 'eco_3',
      icon: 'SparklesIcon',
      title: 'Member Choice',
      description: 'Multiple options per category'
    },
    {
      id: 'eco_4',
      icon: 'TrophyIcon',
      title: 'Business Opportunity',
      description: 'Real demand generation'
    }
  ];

  const demandSteps = [
    {
      id: 'step_1',
      number: '1',
      title: 'You Join as a Business Partner',
      description: 'Complete onboarding and set your offers'
    },
    {
      id: 'step_2',
      number: '2',
      title: 'Your Offer Goes Live',
      description: 'Visible on web and mobile platforms'
    },
    {
      id: 'step_3',
      number: '3',
      title: 'Members Are Notified Weekly',
      description: 'Featured in newsletters and updates'
    },
    {
      id: 'step_4',
      number: '4',
      title: 'Redemptions & Engagement Are Tracked',
      description: 'Real-time data in your dashboard'
    },
    {
      id: 'step_5',
      number: '5',
      title: 'Ongoing Promotion Throughout the Year',
      description: 'Continuous visibility and engagement'
    }
  ];

  const dashboardMetrics = [
    { id: 'metric_1', label: 'Member Redemptions', icon: 'TicketIcon' },
    { id: 'metric_2', label: 'Offer Engagement', icon: 'ChartBarIcon' },
    { id: 'metric_3', label: 'Seasonal Trends', icon: 'CalendarIcon' },
    { id: 'metric_4', label: 'Category Performance', icon: 'PresentationChartLineIcon' },
    { id: 'metric_5', label: 'Certificate Usage', icon: 'DocumentTextIcon' }
  ];

  const weeklyEngagement = [
    'Weekly newsletters',
    'New partner highlights',
    'Featured offers',
    'Seasonal promotions'
  ];

  const partnerEngagement = [
    'Solo Business Expos',
    'Member engagement games',
    'Spotlight campaigns',
    'In-store promotional activities'
  ];

  const communityPresence = [
    'Active local engagement',
    'Public partner promotion',
    'Long-term ecosystem development'
  ];

  const idealBusinessTraits = [
    'Value long-term partnerships',
    'Want measurable engagement',
    'Believe in offering real value',
    'Prefer sustainable growth over short bursts',
    'Understand ecosystem economics'
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-[#1C4D8D] to-[#4988C4] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-blue-100 font-semibold text-sm mb-6 shadow-sm">
              <Icon name="SparklesIcon" size={16} />
              Partner Program
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Built to Drive Demand. Not Sell Ads.
            </h1>
            <p className="text-xl md:text-2xl mb-10 leading-relaxed text-[#BDE8F5] max-w-3xl mx-auto">
              Discount Club Cayman is a membership-first platform designed to generate consistent, measurable sales for our Business Partners.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/sign-up"
                className="px-8 py-4 bg-white text-blue-900 rounded-full text-lg font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Apply to Become a Partner
                <Icon name="ArrowRightIcon" size={20} />
              </Link>
              <Link
                to="#how-it-works"
                className="px-8 py-4 bg-transparent text-white border border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                See How the Model Works
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Section 1 - Our Model Is Different */}
      <div className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              We Monetize Memberships — Not Businesses.
            </h2>
          </div>
          <div className="bg-[#BDE8F5]/70 rounded-3xl p-10 md:p-14 border border-blue-100 shadow-xl">
            <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
              <p className="text-xl font-semibold text-slate-900">
                Most platforms sell advertising. We sell memberships.
              </p>
              <p>
                Our primary revenue comes from members — not ad placements. Advertising represents less than 15% of our total revenue and is entirely optional.
              </p>
              <div className="bg-white rounded-2xl p-8 mt-8 space-y-6 shadow-sm border border-blue-50">
                <p className="font-semibold text-slate-900 text-xl mb-4">This means:</p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="CheckIcon" size={18} className="text-blue-700" />
                    </div>
                    <p className="text-slate-700">Our growth depends on member satisfaction.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="CheckIcon" size={18} className="text-blue-700" />
                    </div>
                    <p className="text-slate-700">Member satisfaction depends on strong Business Partners.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="CheckIcon" size={18} className="text-blue-700" />
                    </div>
                    <p className="text-slate-900 font-semibold">Your success is essential to our model.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section 2 - The DCC Ecosystem */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Balanced. Managed. Sustainable.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We do not oversaturate categories. We carefully balance market dynamics for long-term success.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {ecosystemFeatures?.map((feature) => (
              <div key={feature?.id} className="group bg-white rounded-2xl p-8 text-center border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Icon name={feature?.icon} size={28} className="text-blue-700" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{feature?.title}</h3>
                <p className="text-slate-600">{feature?.description}</p>
              </div>
            )) || []}
          </div>
          <div className="mt-12 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-4xl mx-auto">
            <p className="text-center text-lg text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900">Members should never feel locked into one option.</span> <span className="font-semibold text-slate-900">Businesses should never feel drowned in competition.</span> This balance is deliberate and long-term.
            </p>
          </div>
        </div>
      </div>
      {/* Section 3 - How the Demand Engine Works */}
      <div id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              How the Demand Engine Works
            </h2>
            <p className="text-xl text-slate-600">A simple, proven process to drive consistent customer engagement</p>
          </div>
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200" style={{top: '48px'}}></div>
            
            <div className="grid md:grid-cols-5 gap-6 relative">
              {demandSteps?.map((step, index) => (
                <div key={step?.id} className="relative">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all h-full group">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-[#1C4D8D] to-[#4988C4] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg relative z-10 group-hover:scale-105 transition-transform">
                      {step?.number}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-3 text-center leading-tight">
                      {step?.title}
                    </h3>
                    <p className="text-slate-600 text-center">{step?.description}</p>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        </div>
      </div>
      {/* Section 4 - Business Partner Dashboard */}
      <div className="relative py-24 bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 relative z-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              Measurable Participation. Not Logo Placement.
            </h2>
            <p className="text-xl text-slate-300">Track real engagement with transparent, data-driven insights</p>
          </div>
          
          {/* Dashboard Mock */}
          <div className="bg-white rounded-3xl p-8 md:p-10 text-slate-900 shadow-2xl relative z-10 border border-white/10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-2xl font-bold">Business Partner Dashboard</h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {dashboardMetrics?.slice(0, 3)?.map((metric) => (
                <div key={metric?.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                      <Icon name={metric?.icon} size={20} />
                    </div>
                    <p className="font-semibold text-slate-700">{metric?.label}</p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4988C4] to-[#BDE8F5] rounded-full" style={{width: `${Math.random() * 40 + 60}%`}}></div>
                  </div>
                  <p className="text-xl font-bold text-slate-900 mt-3">{Math.floor(Math.random() * 500 + 200)}</p>
                </div>
              )) || []}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {dashboardMetrics?.slice(3)?.map((metric) => (
                <div key={metric?.id} className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-700 text-white rounded-lg flex items-center justify-center">
                      <Icon name={metric?.icon} size={20} />
                    </div>
                    <p className="font-semibold text-slate-700">{metric?.label}</p>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3]?.map((bar) => (
                      <div key={bar} className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] rounded-full" style={{width: `${Math.random() * 50 + 30}%`}}></div>
                        </div>
                        <span className="text-sm text-slate-600 w-12 text-right">{Math.floor(Math.random() * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )) || []}
            </div>
          </div>
          
          <p className="text-center text-slate-300 mt-10 text-lg relative z-10">
            This dashboard reinforces transparency and accountability — you see exactly how your partnership performs.
          </p>
        </div>
      </div>
      {/* Section 5 - What to Expect Year Round */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              We Don't Launch and Disappear.
            </h2>
            <p className="text-xl text-slate-600">Ongoing engagement and promotion throughout the year</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Weekly Member Engagement */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#31326F] to-[#637AB9] text-white rounded-2xl flex items-center justify-center mb-6">
                <Icon name="EnvelopeIcon" size={28} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mb-6">Weekly Member Engagement</h3>
              <ul className="space-y-3">
                {weeklyEngagement?.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#637AB9] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="CheckIcon" size={14} />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                )) || []}
              </ul>
            </div>
            
            {/* Partner + Member Engagement */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4635B1] to-[#B771E5] text-white rounded-2xl flex items-center justify-center mb-6">
                <Icon name="SparklesIcon" size={28} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mb-6">Partner + Member Engagement</h3>
              <ul className="space-y-3">
                {partnerEngagement?.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#B771E5] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="CheckIcon" size={14} />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                )) || []}
              </ul>
            </div>
            
            {/* Community Presence */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4FB7B3] to-[#A8FBD3] text-white rounded-2xl flex items-center justify-center mb-6">
                <Icon name="GlobeAltIcon" size={28} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mb-6">Community Presence</h3>
              <ul className="space-y-3">
                {communityPresence?.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#4FB7B3] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="CheckIcon" size={14} />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                )) || []}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Section 6 - Optional Advertising */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Enhanced Exposure — If You Want It.
            </h2>
          </div>
          <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200 shadow-xl">
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Advertising options are available for businesses who wish to expand visibility.
            </p>
            <div className="bg-blue-50 rounded-2xl p-8 space-y-4 border border-blue-100">
              <p className="text-slate-900 font-semibold text-xl mb-4">However:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#4988C4] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="CheckIcon" size={14} />
                  </div>
                  <p className="text-slate-700 text-lg">Advertising is <span className="font-semibold">optional</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#4988C4] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="CheckIcon" size={14} />
                  </div>
                  <p className="text-slate-700 text-lg">It represents <span className="font-semibold">less than 15%</span> of our revenue.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#4988C4] text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="CheckIcon" size={14} />
                  </div>
                  <p className="text-slate-700 text-lg">It does <span className="font-semibold">not determine core visibility</span> within the program.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/advertise"
                className="inline-flex items-center gap-2 text-[#1C4D8D] font-bold hover:text-blue-800 transition-colors text-lg"
              >
                Learn more about advertising options
                <Icon name="ArrowRightIcon" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Section 7 - Who This Is For */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Is DCC Right for Your Business?
            </h2>
            <p className="text-lg text-slate-600">We partner with businesses that share our values</p>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-10 md:p-14 border border-slate-200">
            <p className="text-lg text-slate-700 mb-8 font-semibold">DCC is ideal for businesses that:</p>
            <div className="space-y-4">
              {idealBusinessTraits?.map((trait, index) => (
                <div key={index} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] text-white rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="CheckIcon" size={18} />
                  </div>
                  <p className="text-slate-800 text-lg font-medium">{trait}</p>
                </div>
              )) || []}
            </div>
          </div>
        </div>
      </div>
      {/* Final Section - Strong Positioning Close */}
      <div className="relative py-24 md:py-32 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1C4D8D] to-[#4988C4] opacity-90"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tight text-white">
              Discount Club Cayman is not built to sell advertising.
            </h2>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tight text-[#BDE8F5]">
              It is built to sell memberships that generate demand for our Business Partners.
            </h2>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/sign-up"
              className="group px-10 py-5 bg-white text-blue-900 rounded-full text-xl font-bold hover:bg-blue-50 transition-all shadow-2xl hover:shadow-xl inline-flex items-center gap-3 transform hover:-translate-y-1"
            >
              Become a Business Partner
              <Icon name="ArrowRightIcon" size={24} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="px-10 py-5 bg-transparent text-white border border-white/30 rounded-full text-xl font-bold hover:bg-white/10 transition-all inline-flex items-center gap-3 backdrop-blur-sm"
            >
              Schedule a 15-Minute Introduction
              <Icon name="CalendarIcon" size={24} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForBusinessContent