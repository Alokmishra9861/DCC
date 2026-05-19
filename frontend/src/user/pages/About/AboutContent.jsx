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
    <div className="min-h-screen bg-[#0D1328]">
      {/* Hero Section */}
      <div className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4A62A]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#D4A62A]/10 border border-[#D4A62A]/20 px-4 py-1.5 text-sm font-semibold text-[#D4A62A]">
              <Icon name="SparklesIcon" size={16} />
              Our Mission
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              A Mission to Make Life <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A62A] to-[#E0B53A]">More Affordable</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#B8C0D4] max-w-2xl mx-auto font-medium">
              Discount Club Cayman was founded on a simple principle: to ease the financial pressures of living in paradise, creating a win-win for members, businesses, and the entire community.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="sticky top-32">
                <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-6">
                  Our Story
                </h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-[#D4A62A] to-transparent rounded-full mb-8"></div>
                <p className="text-xl font-semibold text-[#B8C0D4] leading-relaxed">
                  Discount Club Cayman was founded on lessons learned — some exciting, some painful.
                </p>
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8 space-y-10">
              <div className="relative pl-8 md:pl-12 border-l-2 border-white/10">
                <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-[#D4A62A] bg-[#0D1328] shadow-[0_0_10px_rgba(212,166,42,0.5)]"></span>
                <p className="text-lg text-[#8D95A8] leading-relaxed">
                  Our roots go back to 2013, when we first set out to help people manage the rising cost of living in the Cayman Islands. Like many early ventures, we were undercapitalized, and we learned firsthand what doesn't work — not just from our own experience, but by watching other discount programs launch, struggle, and ultimately fail.
                </p>
              </div>

              <div className="relative pl-8 md:pl-12 border-l-2 border-white/10">
                <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white/30 bg-[#0D1328]"></span>
                <p className="text-lg text-[#8D95A8] leading-relaxed">
                  We took those lessons seriously.
                </p>
              </div>

              <div className="glass-panel p-8 md:p-10 relative overflow-hidden group hover:border-[#D4A62A]/40 transition-colors">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon name="SparklesIcon" size={100} className="text-[#D4A62A]" />
                </div>
                <p className="font-heading text-xl md:text-2xl font-bold text-white relative z-10 leading-relaxed">
                  Discount Club Cayman today is not a fly-by-night program. It is a carefully built ecosystem designed to last.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A Different Purpose */}
      <div className="bg-[#111936] py-24 border-y border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Content */}
            <div className="space-y-8">
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white">
                A Different Purpose
              </h2>
              <p className="text-lg text-[#B8C0D4] leading-relaxed">
                While organizations like the Chamber of Commerce play a vital role in strengthening the local economy, connecting businesses, and influencing policy, that is not our core mission.
              </p>
              <div className="glass-panel border-l-4 border-l-[#D4A62A] p-6 shadow-lg">
                <p className="text-lg text-[#8D95A8] leading-relaxed">
                  When financial pressure eases, homes are calmer, families reconnect, vacations become possible again, and health outcomes improve. That benefit returns to the workplace through fewer sick days, stronger loyalty, and higher productivity.
                </p>
              </div>
            </div>

            {/* Right Column: Benefits */}
            <div className="space-y-8">
              <p className="text-xl font-bold text-white">
                Our purpose is simple and focused:
              </p>
              <div className="space-y-6">
                {benefits?.map((benefit) => (
                  <div key={benefit?.id} className="flex items-start gap-6 group">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#161F3D] border border-white/10 text-[#D4A62A] rounded-2xl flex items-center justify-center group-hover:bg-[#D4A62A]/10 group-hover:border-[#D4A62A]/30 transition-all shadow-lg">
                      <Icon name={benefit?.icon} size={32} />
                    </div>
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-white mb-2 group-hover:text-[#D4A62A] transition-colors">
                        {benefit?.title}
                      </h3>
                      <p className="text-lg text-[#8D95A8]">
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
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4A62A]/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Column: Visual Mockup */}
            <div className="relative flex items-center justify-center lg:justify-start">
              <div className="relative mx-auto border-[#161F3D] bg-[#161F3D] border-[14px] rounded-[2.5rem] h-[580px] w-[290px] shadow-2xl ring-1 ring-white/10">
                <div className="w-35 h-[18px] bg-[#161F3D] top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
                <div className="h-[46px] w-[3px] bg-[#161F3D] absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                <div className="h-[46px] w-[3px] bg-[#161F3D] absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                <div className="h-[64px] w-[3px] bg-[#161F3D] absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[#0D1328] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4A62A]/20 to-transparent"></div>
                  <div className="text-white p-6 flex flex-col h-full items-center justify-center text-center relative z-10">
                      <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(212,166,42,0.2)]">
                        <Icon name="DevicePhoneMobileIcon" size={48} className="text-[#D4A62A]" />
                      </div>
                      <h3 className="text-2xl font-bold">Discount Club Cayman</h3>
                      <p className="text-sm text-[#B8C0D4] mt-1">Swipe to Save</p>
                      <div className="mt-12 w-full space-y-3">
                        <div className="h-10 glass-panel border-white/5 rounded-lg"></div>
                        <div className="h-10 glass-panel border-white/5 rounded-lg"></div>
                        <div className="h-10 glass-panel border-white/5 rounded-lg"></div>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Differentiators */}
            <div className="relative z-10">
              <div className="mb-10">
                <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white mb-4">
                  Built for How People Live and Work Today
                </h2>
                <p className="text-xl text-[#B8C0D4]">
                  Discount Club Cayman has moved beyond cards.
                </p>
              </div>

              <div className="space-y-10">
                {differentiators?.map((item) => (
                  <div key={item?.id} className="flex items-start gap-5 group">
                    <div className={`flex-shrink-0 w-14 h-14 bg-[#111936] border border-white/10 rounded-xl flex items-center justify-center text-[#D4A62A] group-hover:bg-[#D4A62A]/10 group-hover:border-[#D4A62A]/30 transition-all shadow-lg`}>
                      <Icon name={item?.icon} size={28} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white mb-2 group-hover:text-[#D4A62A] transition-colors">{item?.title}</h3>
                      <p className="text-[#8D95A8] leading-relaxed">{item?.description}</p>
                    </div>
                  </div>
                )) || []}
              </div>

              <div className="mt-12 glass-panel border-l-4 border-l-[#D4A62A] p-6 shadow-lg">
                <p className="text-lg text-white font-medium leading-relaxed">This transforms discounts from a "nice idea" into a measurable business and HR tool.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Model */}
      <div className="relative py-24 bg-[#111936] overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mb-6">
                More Than Consumer Savings
              </h2>
              <div className="space-y-6 text-xl text-[#B8C0D4] leading-relaxed">
                <p>
                  Businesses and employers within Discount Club Cayman also gain access to our <span className="font-bold text-[#D4A62A]">EXCLUSIVE B2B Program</span>, helping them reduce the cost of doing business itself through negotiated business-to-business savings.
                </p>
              </div>
            </div>

            <div className="glass-panel p-8 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A62A]/10 rounded-full blur-[40px]"></div>
              <p className="font-bold text-white text-2xl mb-8 relative z-10">
                This is how the ecosystem works:
              </p>
              <ul className="space-y-4 relative z-10">
                {[
                  { icon: 'SparklesIcon', text: 'Members save at home' },
                  { icon: 'BuildingStorefrontIcon', text: 'Businesses save at work' },
                  { icon: 'UserGroupIcon', text: 'Employers strengthen their teams' },
                  { icon: 'ArrowTrendingUpIcon', text: 'Value compounds across the entire community' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 bg-[#161F3D]/50 rounded-xl p-4 border border-white/5 hover:bg-[#161F3D] hover:border-[#D4A62A]/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#0D1328] border border-white/5 flex items-center justify-center text-[#D4A62A] flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                      <Icon name={item.icon} size={24} />
                    </div>
                    <span className="text-lg font-semibold text-white group-hover:text-[#D4A62A] transition-colors">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Built to Last */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative glass-panel rounded-[2.5rem] p-10 md:p-20 border border-white/10 shadow-2xl overflow-hidden text-center group hover:border-[#D4A62A]/30 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#D4A62A] to-transparent"></div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-[#111936] rounded-2xl shadow-lg border border-white/10 mb-8 group-hover:scale-110 transition-transform">
                <Icon name="ArrowTrendingUpIcon" size={40} className="text-[#D4A62A]" />
              </div>
              
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight">
                Built to Last
              </h2>
              
              <div className="space-y-6 max-w-3xl mx-auto">
                <p className="text-2xl md:text-3xl font-bold text-[#D4A62A] leading-tight">
                  Discount Club Cayman is not about short-term promotions.
                </p>
                <p className="text-lg md:text-xl text-[#B8C0D4] leading-relaxed">
                  It is about creating an environment where everyone wins, supported by technology, data, and aligned incentives — built from experience, not theory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-[#111936] overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Join Our Ecosystem
          </h2>
          <p className="text-xl md:text-2xl text-[#B8C0D4] mb-12 max-w-2xl mx-auto leading-relaxed">
            Become part of a community where everyone wins.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/sign-up"
              className="btn-premium-gold px-10 py-4 text-lg font-bold flex items-center justify-center gap-2"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              to="/contact"
              className="btn-premium-outline px-10 py-4 text-lg font-bold flex items-center justify-center"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutContent