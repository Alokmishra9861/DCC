import React from 'react'
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/AppIcon';

const AboutContent = () => {
    const differentiators = [
    {
      id: 'purpose_1',
      icon: 'UserIcon',
      title: 'For Members',
      description: 'Easing financial pressure through substantial, everyday savings.'
    },
    {
      id: 'purpose_2',
      icon: 'BuildingStorefrontIcon',
      title: 'For Businesses',
      description: 'Driving sustainable demand and offering measurable engagement.'
    },
    {
      id: 'diff_1',
      icon: 'DevicePhoneMobileIcon',
      title: 'App-Based Platform',
      description: 'No cards to carry or lose. Members simply swipe the app to receive discounts or redeem certificates — instantly and clearly.',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'diff_2',
      icon: 'ChartBarIcon',
      title: 'Data-Driven Insights',
      description: 'Clear insight into how offers are used, not just if. Industry-level and business-specific data with employer reporting that shows real employee engagement.',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'diff_3',
      icon: 'BuildingOfficeIcon',
      title: 'Exclusive B2B Program',
      description: 'Businesses and employers gain access to negotiated business-to-business savings, reducing the cost of doing business itself.',
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'diff_4',
      icon: 'ArrowTrendingUpIcon',
      title: 'Built to Last',
      description: 'Not a short-term promotion. An ecosystem where value compounds across the entire community through aligned incentives.',
      color: 'bg-orange-100 text-orange-700'
    }
  ];

  const benefits = [
    { id: 'purpose_1', icon: 'UserIcon', title: 'For Members', description: 'Easing financial pressure through substantial, everyday savings.' },
    { id: 'purpose_2', icon: 'BuildingStorefrontIcon', title: 'For Businesses', description: 'Driving sustainable demand and offering measurable engagement.' },
    { id: 'purpose_3', icon: 'UserGroupIcon', title: 'For The Community', description: 'Strengthening the local economy by keeping value within the islands.' },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-100 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-[#1C4D8D]">
              <Icon name="SparklesIcon" size={16} />
              Our Mission
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              A Mission to Make Life More Affordable
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discount Club Cayman was founded on a simple principle: to ease the financial pressures of living in paradise, creating a win-win for members, businesses, and the entire community.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-[#4988C4]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="sticky top-32">
                <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Our Story
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-[#0F2854] to-[#1C4D8D]/20 rounded-full mb-8"></div>
                <p className="text-xl font-medium text-foreground/80 leading-relaxed">
                  Discount Club Cayman was founded on lessons learned — some exciting, some painful.
                </p>
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8 space-y-10">
              <div className="relative pl-8 md:pl-12 border-l-2 border-[#0F2854]/30">
                <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-[#0F2854] bg-background"></span>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our roots go back to 2013, when we first set out to help people manage the rising cost of living in the Cayman Islands. Like many early ventures, we were undercapitalized, and we learned firsthand what doesn't work — not just from our own experience, but by watching other discount programs launch, struggle, and ultimately fail.
                </p>
              </div>

              <div className="relative pl-8 md:pl-12 border-l-2 border-[#0F2854]/10">
                <span className="absolute-left-[9px] top-0 h-4 w-4 rounded-full border-2 border-[#0F2854]/40 bg-background"></span>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We took those lessons seriously.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0F2854]/20 to-secondary/5 rounded-2xl p-8 md:p-10 border border-primary/10 relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon name="SparklesIcon" size={100} />
                </div>
                <p className="font-heading text-xl md:text-xl font-bold text-foreground relative z-10 leading-relaxed">
                  Discount Club Cayman today is not a fly-by-night program. It is a carefully built ecosystem designed to last.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A Different Purpose */}
      <div className="bg-muted/40 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Content */}
            <div className="space-y-8">
              <h2 className="font-heading text-4xl md:text-4xl font-bold text-foreground">
                A Different Purpose
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                While organizations like the Chamber of Commerce play a vital role in strengthening the local economy, connecting businesses, and influencing policy, that is not our core mission.
              </p>
              <div className="bg-background border-l-4 border-[#1C4D8D] rounded-r-lg p-6 shadow-sm">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  When financial pressure eases, homes are calmer, families reconnect, vacations become possible again, and health outcomes improve. That benefit returns to the workplace through fewer sick days, stronger loyalty, and higher productivity.
                </p>
              </div>
            </div>

            {/* Right Column: Benefits */}
            <div className="space-y-8">
              <p className="text-xl font-semibold text-foreground">
                Our purpose is simple and focused:
              </p>
              <div className="space-y-6">
                {benefits?.map((benefit) => (
                  <div key={benefit?.id} className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#4988C4] to-[#BDE8F5] text-[#1C4D8D] rounded-2xl flex items-center justify-center">
                      <Icon name={benefit?.icon} size={32} />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                        {benefit?.title}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {benefit?.description}
                      </p>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How We're Different */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Column: Visual Mockup */}
            <div className="relative flex items-center justify-center lg:justify-start">
              <div className="absolute w-72 h-72 bg-purple-100 rounded-full -top-10 -left-10 blur-3xl opacity-50"></div>
              <div className="absolute w-72 h-72 bg-blue-100 rounded-full -bottom-10 -right-10 blur-3xl opacity-50"></div>
              <div className="relative mx-auto border-[#0F2854] bg-[#0F2854] border-[14px] rounded-[2.5rem] h-[580px] w-[290px] shadow-2xl">
                <div className="w-35 h-[18px] bg-[#0F2854] top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[46px] w-[3px] bg-[#0F2854] absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-[#0F2854] absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-[#0F2854] absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-gradient-to-br from-[#BDE8F5] to-[#CFAB8D]">
                  <div className="text-white p-6 flex flex-col h-full items-center justify-center text-center">
                      <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center mb-6">
                        <Icon name="DevicePhoneMobileIcon" size={48} className="opacity-80" />
                      </div>
                      <h3 className="text-2xl font-bold">Discount Club Cayman</h3>
                      <p className="text-sm opacity-80 mt-1">Swipe to Save</p>
                      <div className="mt-12 w-full space-y-3">
                        <div className="h-10 bg-white/30 rounded-lg"></div>
                        <div className="h-10 bg-white/30 rounded-lg"></div>
                        <div className="h-10 bg-white/30 rounded-lg"></div>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Differentiators */}
            <div className="relative z-10">
              <div className="mb-10">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Built for How People Live and Work Today
                </h2>
                <p className="text-xl text-muted-foreground">
                  Discount Club Cayman has moved beyond cards
                </p>
              </div>

              <div className="space-y-10">
                {differentiators?.map((item) => (
                  <div key={item?.id} className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-14 h-14 ${item?.color} rounded-xl flex items-center justify-center`}>
                      <Icon name={item?.icon} size={28} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-foreground mb-2">{item?.title}</h3>
                      <p className="text-lg text-muted-foreground leading-relaxed">{item?.description}</p>
                    </div>
                  </div>
                )) || []}
              </div>

              <div className="mt-12 bg-muted/50 rounded-xl p-6 border-l-4 border-[#0F2854]">
                <p className="text-lg text-foreground font-medium leading-relaxed">This transforms discounts from a "nice idea" into a measurable business and HR tool.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Model */}
      <div className="relative py-24 bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
                More Than Consumer Savings
              </h2>
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  Businesses and employers within Discount Club Cayman also gain access to our <span className="font-semibold text-white">EXCLUSIVE B2B Program</span>, helping them reduce the cost of doing business itself through negotiated business-to-business savings.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <p className="font-semibold text-white text-xl mb-6">
                This is how the ecosystem works:
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Icon name="SparklesIcon" size={20} />
                  </div>
                  <span className="text-lg text-slate-200">Members save at home</span>
                </li>
                <li className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <Icon name="BuildingStorefrontIcon" size={20} />
                  </div>
                  <span className="text-lg text-slate-200">Businesses save at work</span>
                </li>
                <li className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                    <Icon name="UserGroupIcon" size={20} />
                  </div>
                  <span className="text-lg text-slate-200">Employers strengthen their teams</span>
                </li>
                <li className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                    <Icon name="ArrowTrendingUpIcon" size={20} />
                  </div>
                  <span className="text-lg text-slate-200">Value compounds across the entire community</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Built to Last */}
      <div className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative bg-gradient-to-b from-slate-200 to-slate-50 rounded-[2.5rem] p-10 md:p-20 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0F2854]/20 via-[#0F2854] to-[#0F2854]/20"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0F2854]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 mb-8">
                <Icon name="ArrowTrendingUpIcon" size={32} className="text-[#0F2854]" />
              </div>
              
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-8 tracking-tight">
                Built to Last
              </h2>
              
              <div className="space-y-6 max-w-3xl mx-auto">
                <p className="text-2xl md:text-3xl font-medium text-foreground/90 leading-tight">
                  Discount Club Cayman is not about short-term promotions.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  It is about creating an environment where everyone wins, supported by technology, data, and aligned incentives — built from experience, not theory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#696FC7]/50 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#9B5DE0]/50 rounded-full blur-3xl -translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Join Our Ecosystem
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Become part of a community where everyone wins.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/sign-up"
              className="px-8 py-4 bg-white text-slate-900 rounded-full text-lg font-bold hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-flex items-center gap-2 transform hover:-translate-y-1"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent text-white border border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutContent