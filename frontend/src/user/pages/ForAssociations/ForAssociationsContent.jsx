import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const ForAssociationsContent = () => {
     const benefits = [
    {
      id: 'assoc_1',
      icon: 'UserGroupIcon',
      title: 'Add Value to Membership',
      description: 'Enhance your association membership with tangible savings that members use every day.',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'assoc_2',
      icon: 'HeartIcon',
      title: 'Increase Member Retention',
      description: 'Give members another reason to renew with a benefit that delivers real financial value.',
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'assoc_3',
      icon: 'ChartBarIcon',
      title: 'Attract New Members',
      description: 'Stand out from other associations by offering exclusive savings on travel and local services.',
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'assoc_4',
      icon: 'CurrencyDollarIcon',
      title: 'Revenue Opportunity',
      description: 'Generate additional revenue for your association through our partnership program.',
      color: 'bg-purple-100 text-purple-700'
    }
  ];
  return (
     <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-emerald-100 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
              <Icon name="SparklesIcon" size={16} />
              Preferred Pricing Tier - Better Than Employer Rates
            </div>
            <h1 className="font-heading text-5xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              Enhance Your Association Membership
            </h1>
            <p className="text-xl md:text-1xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Partner with Discount Club Cayman to provide your members with exclusive savings on travel, dining, groceries, and everyday expenses across the Cayman Islands.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/sign-up"
                className="px-7 py-3 bg-[#1C4D8D] text-white rounded-full text-lg font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Partner with Us
                <Icon name="ArrowRightIcon" size={20} />
              </Link>
              <Link
                to="/contact"
                className="px-7 py-3 bg-white text-foreground border border-border rounded-full text-lg font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] hover:bg-emerald-50 transition-all shadow-sm"
              >
                Schedule a Call
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Pricing Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
              Association Preferred Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Exclusive negotiated rates for your association members
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Public Rate */}
            <div className="md:col-span-5">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center opacity-75 scale-95 hover:opacity-100 hover:scale-100 transition-all">
                <h3 className="font-heading text-2xl font-bold text-slate-700 mb-2">
                  Public Rate
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Standard membership pricing
                </p>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Individual</p>
                  <p className="text-4xl font-bold text-slate-400 line-through decoration-slate-300">
                    $119.99
                  </p>
                  <p className="text-sm text-muted-foreground">per year</p>
                </div>
              </div>
            </div>

            {/* Association Rate */}
            <div className="md:col-span-7">
              <div className="bg-white rounded-3xl p-10 border-2 border-emerald-100 shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">EXCLUSIVE</div>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon name="CurrencyDollarIcon" size={32} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
                      Exclusive Association Benefits
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Our association pricing is intentionally structured <span className="font-bold text-emerald-600">below market value</span>, enabling associations to provide their members with savings they cannot access independently.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      This creates a sustainable, win-win model that supports both member satisfaction and organizational funding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-4xl font-bold text-foreground mb-4">
              Why Associations Partner with Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deliver real value to your members
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {benefits?.map((benefit) => (
              <div key={benefit?.id} className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 ${benefit?.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon name={benefit?.icon} size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-700 transition-colors">
                  {benefit?.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {benefit?.description}
                </p>
              </div>
            )) || []}
          </div>
        </div>
      </div>
      {/* Value Proposition */}
      <div className="relative py-24 bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto relative z-10">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-10 text-center">
                Real Savings for Your Members
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors text-center">
                  <p className="text-4xl font-bold text-emerald-400 mb-2">Up to 70%</p>
                  <p className="text-slate-300">Savings on travel bookings worldwide</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors text-center">
                  <p className="text-4xl font-bold text-teal-400 mb-2">25%</p>
                  <p className="text-slate-300">Average discount at local businesses</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors text-center">
                  <p className="text-4xl font-bold text-cyan-400 mb-2">$2,000</p>
                  <p className="text-slate-300">In redeemable certificates available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* How It Works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple Partnership Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
             {/* Connecting Line (Desktop) */}
             <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 -z-10"></div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg z-10 relative">
                1
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Initial Consultation
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We discuss your association needs and create a customized partnership package.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg z-10 relative">
                2
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Member Enrollment
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We provide co-branded materials and handle the enrollment process for your members.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg z-10 relative">
                3
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Ongoing Support
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your dedicated account manager provides ongoing support and usage analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonial Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xl relative">
            <div className="absolute top-8 right-8 text-emerald-100">
              <Icon name="ChatBubbleBottomCenterTextIcon" size={60} />
            </div>
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5]?.map((star) => (
                <Icon key={star} name="StarIcon" size={22} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-xl font-medium text-foreground mb-8 leading-relaxed relative z-10">
              "Adding Discount Club Cayman to our membership benefits has been a game-changer. Our members love the savings, and it has significantly improved our retention rates. The partnership team made implementation seamless."
            </p>
            <div>
              <p className="font-bold text-foreground">James Mitchell</p>
              <p className="text-emerald-600">Executive Director, Cayman Professional Association</p>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4988C4] to-[#BDE8F5]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Add Value to Your Membership?
          </h2>
          <p className="text-xl md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Contact us today to discuss a customized partnership for your association.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/sign-up"
              className="group px-10 py-5 bg-white text-[#1C4D8D] rounded-full text-xl font-bold hover:bg-emerald-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-flex items-center gap-2 transform hover:-translate-y-1"
            >
              Partner with Us
              <Icon name="ArrowRightIcon" size={24} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent text-white border border-white/70 text-center rounded-full text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Schedule a Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForAssociationsContent