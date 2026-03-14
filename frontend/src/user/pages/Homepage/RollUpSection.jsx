import React from 'react'
import Icon from '../../components/ui/AppIcon'

const RollUpSection = () => {
     const valueBreakdown = [
    {
      id: 'value_travel',
      category: 'Travel',
      value: 'Hundreds to thousands per trip',
      icon: 'GlobeAmericasIcon',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      id: 'value_local',
      category: 'Local discounts',
      value: 'US$1,000–US$1,500/year',
      icon: 'BuildingStorefrontIcon',
      color: 'from-orange-400 to-amber-500',
    },
    {
      id: 'value_certificates',
      category: 'Certificates',
      value: '~US$1,000/year',
      icon: 'TicketIcon',
      color: 'from-green-400 to-emerald-500',
    },
  ];
  return (
     <section className="relative py-24 bg-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            One Membership. Whole-Life Savings.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Big Picture Summary */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-10 md:p-12 border border-white/10 shadow-2xl animate-fade-up animation-delay-100">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center text-white gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                <Icon name="CalculatorIcon" size={20} />
                The Math
              </div>

              <p className="text-xl md:text-xl text-slate-300 leading-relaxed">
                A <span className="font-bold text-white">US$119.99 membership</span> can realistically return
              </p>

              <p className="text-6xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-cyan-400 py-2">
                US$2,600 – US$3,900+
              </p>

              <p className="text-xl text-slate-400 -mt-4">per year</p>

              <div className="pt-6 border-t border-white/10">
                <p className="text-3xl md:text-3xl font-bold text-white">
                  That's <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-cyan-400">20x-30x</span> the cost of membership.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Value Breakdown */}
          <div className="space-y-7 animate-fade-up animation-delay-200">
            {valueBreakdown.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className={`shrink-0 w-14 h-14 bg-linear-to-br ${item.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon name={item.icon} size={32} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-white mb-1">
                    {item.category}
                  </h3>
                  <p className="text-lg text-slate-300">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RollUpSection