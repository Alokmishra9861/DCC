import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const RedeemableCertificates = () => {
     const certificates = [
    {
      id: 'cert_25',
      value: '$25',
      title: 'OFF',
      description: 'dining & everyday services',
      color: 'from-[#667BC6] to-[#667BC6]',
      icon: 'BuildingStorefrontIcon',
    },
    {
      id: 'cert_50',
      value: '$50',
      title: 'OFF',
      description: 'popular local businesses',
      color: 'from-[#8E7DBE] to-[#8E7DBE]',
      icon: 'ShoppingBagIcon',
    },
    {
      id: 'cert_100',
      value: '$100',
      title: 'OFF',
      description: 'premium services & experiences',
      color: 'from-[#8ABB6C] to-[#8ABB6C]',
      icon: 'SparklesIcon',
    },
  ];
  return (
     <section className="relative py-24 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMTI4LCAxMjgsIDAuMDUpIi8+PC9zdmc+')] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Redeem Certificates From Local Businesses
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Straight-dollar value you can actually use.
          </p>
        </div>

        {/* Certificate Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 animate-fade-up animation-delay-100">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="group relative bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Gradient Header */}
              <div className={`relative h-56 bg-gradient-to-br ${cert.color} p-8 flex flex-col items-center justify-center text-white overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                
                <div className="relative z-10 text-center transform group-hover:scale-105 transition-transform duration-500">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/20">
                    <Icon name={cert.icon} size={32} className="text-white" />
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-6xl font-bold tracking-tight shadow-sm drop-shadow-md">{cert.value}</span>
                    <span className="text-2xl font-bold opacity-90">{cert.title}</span>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div className="p-8 text-center bg-white relative">
                 {/* Dashed line separator */}
                 <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-slate-100"></div>
                 
                <p className="text-xl font-medium text-slate-600 leading-relaxed mt-2">
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Annual Value Summary */}
        <div className="relative bg-slate-900 rounded-3xl p-10 md:p-12 text-center mb-12 animate-fade-up animation-delay-200 shadow-2xl overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
           
           {/* Glow effects */}
           <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2"></div>
           <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2"></div>

           <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-6 shadow-lg shadow-green-900/20">
                 <Icon name="BanknotesIcon" size={32} className="text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Estimated annual certificate value
              </h3>
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-6">
                ~US$1,000 per year
              </p>
              <p className="text-slate-400 text-sm">
                Certificate availability varies by location and partner.
              </p>
           </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 animate-fade-up animation-delay-300">
          <Link
            to="/certificates"
            className="inline-flex items-center gap-2 text-primary font-bold text-lg hover:gap-3 transition-all"
          >
            Browse certificates inside
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RedeemableCertificates