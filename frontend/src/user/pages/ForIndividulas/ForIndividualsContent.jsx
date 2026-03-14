import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const ForIndividualsContent = () => {
     const benefits = [
    {
      id: 'benefit_1',
      icon: 'GlobeAmericasIcon',
      title: 'Save Up to 70% on Travel',
      description: 'Access member-only hotel rates worldwide. Save hundreds on your next vacation with exclusive travel discounts.',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'benefit_2',
      icon: 'BuildingStorefrontIcon',
      title: 'Up to 25% off Local businesses',
      description: 'Save on groceries, dining, auto services, wellness, and more at 150+ trusted local businesses across Cayman.',
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'benefit_3',
      icon: 'TicketIcon',
      title: 'Up to $200 in Certificates',
      description: 'Redeem valuable certificates at participating businesses. Your membership pays for itself in the first month.',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'benefit_4',
      icon: 'CurrencyDollarIcon',
      title: 'Beat Rising Costs',
      description: 'Combat the high cost of living in Cayman. Keep more money in your pocket with everyday savings.',
      color: 'bg-orange-100 text-orange-700'
    }
  ];

  const savingsExamples = [
    { id: 'ex_1', category: 'Groceries', monthly: 32, annual: 384 },
    { id: 'ex_2', category: 'Dining Out', monthly: 55, annual: 660 },
    { id: 'ex_3', category: 'Auto Services', monthly: 8, annual: 96 },
    { id: 'ex_4', category: 'Wellness & Spa', monthly: 25, annual: 300 },
    { id: 'ex_5', category: 'Travel (Annual)', monthly: 0, annual: 150 },
    { id: 'ex_6', category: 'Misc (Jewelry, Perfume, Electronics, Flowers etc)', monthly: 35, annual: 420 }
  ];

  const totalMonthlySavings = savingsExamples?.reduce((sum, item) => sum + item?.monthly, 0);
  const totalAnnualSavings = savingsExamples?.reduce((sum, item) => sum + item?.annual, 0);
  return (
   <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
              <Icon name="SparklesIcon" size={16} />
              Start Saving Today
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              Membership That Pays for Itself
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of Cayman residents saving money every day on travel, groceries, dining, and more. Your membership investment returns to you in real savings.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/sign-up"
                className="px-8 py-4 bg-[#4988C4] text-primary-foreground rounded-full text-md font-bold hover:bg-[#1C4D8D] transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Join Now
                <Icon name="ArrowRightIcon" size={20} />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-white text-foreground border border-border rounded-full text-md font-semibold hover:border-[#4988C4] hover:text-[#4988C4] hover:bg-gray-50 transition-all shadow-sm"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-4xl font-bold text-foreground mb-4">
              Why Join Discount Club Cayman?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four powerful ways to save money every month
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {benefits?.map((benefit) => (
              <div key={benefit?.id} className="group bg-white rounded-3xl p-7 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 ${benefit?.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon name={benefit?.icon} size={32} />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-[#1C4D8D] transition-colors">
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

      {/* Savings Calculator */}
      <div className="relative py-24 bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 relative z-10">
            <h2 className="font-heading text-4xl md:text-4xl font-bold text-white mb-4">
              Your Potential Savings
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              See how much you could save with a typical family membership
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative z-10">
            <div className="space-y-6 mb-10">
              {savingsExamples?.map((example) => (
                <div key={example?.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-white/10 last:border-0 gap-4">
                  <span className="font-semibold text-lg text-white">{example?.category}</span>
                  <div className="flex justify-between sm:justify-end gap-8 w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Monthly</p>
                      <p className="font-bold text-xl text-white">${example?.monthly}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Annual</p>
                      <p className="font-bold text-xl text-green-400">${example?.annual}</p>
                    </div>
                  </div>
                </div>
              )) || []}
            </div>

            <div className="bg-gradient-to-r from-[#4988C4] to-[#BDE8F5] rounded-2xl p-5 border border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <span className="font-heading text-2xl font-bold text-white">Total Savings</span>
                <div className="flex justify-between w-full md:w-auto gap-12">
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Monthly</p>
                    <p className="font-heading text-3xl font-bold text-white">${totalMonthlySavings}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Annual</p>
                    <p className="font-heading text-3xl font-bold text-green-800">${totalAnnualSavings}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-slate-400 mt-8 text-sm">
              *Savings based on average member usage. Your actual savings may vary.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start saving in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -z-10"></div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg z-10 relative">
                1
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                Join Today
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Choose your membership tier and complete your registration in minutes.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg z-10 relative">
                2
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                Browse Discounts
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Access 150+ exclusive discounts and member-only travel rates immediately.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg z-10 relative">
                3
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                Start Saving
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Show your membership at participating businesses and watch the savings add up.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0  bg-gradient-to-br from-[#4988C4] to-[#BDE8F5]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Start Saving?
          </h2>
          <p className="text-xl md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Discount Club Cayman today and start keeping more money in your pocket.
          </p>
          <Link
            to="/sign-up"
            className="group px-9 py-4 bg-white text-[#1C4D8D] rounded-full text-xl font-bold hover:bg-gray-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-flex items-center gap-2 transform hover:-translate-y-1"
          >
            Join Now
            <Icon name="ArrowRightIcon" size={24} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForIndividualsContent