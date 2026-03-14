import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const HeroSection = () => {
    const valueBullets = [
    {
      icon: 'GlobeAmericasIcon',
      text: 'Save up to 70% on travel',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      icon: 'BuildingStorefrontIcon',
      text: 'Save 10–25% locally, all year',
      color: 'from-orange-400 to-pink-500'
    },
    {
      icon: 'TicketIcon',
      text: 'Redeem real dollar-value certificates',
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 sm:min-h-screen -mt-16 lg:-mt-20">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-12 text-center sm:px-6 md:pt-32 md:pb-20">
        <div className="space-y-8 animate-fade-up md:space-y-10">
          {/* Main Headline */}
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tighter text-foreground animate-fade-up sm:text-5xl md:text-6xl">
            Save on Travel. Save Locally. Save <br />Every Day.
          </h1>

          {/* Subhead */}
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground animate-fade-up animation-delay-100 md:text-xl">
            One membership that unlocks real savings on travel, everyday essentials, and redeemable certificates.
          </p>

          {/* Value Bullets */}
          <div className="mx-auto flex max-w-max flex-col items-start gap-y-5 gap-x-10 py-4 animate-fade-up animation-delay-200 sm:flex-row sm:items-center">
            {valueBullets.map((bullet, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg md:h-12 md:w-12 ${bullet.color}`}>
                  <Icon name={bullet.icon} size={24} className="scale-90 md:scale-100" />
                </div>
                <span className="text-base font-semibold text-foreground md:text-lg">{bullet.text}</span>
              </div>
            ))}
          </div>

          {/* Digital Convenience Highlight */}
          <div className="relative py-6 animate-fade-up animation-delay-300">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-slate-900 p-1 shadow-2xl">
              <div className="rounded-[1.4rem] bg-slate-800/50 px-6 py-8 backdrop-blur-md md:px-8 md:py-10">
                <div className="flex flex-col items-center justify-center gap-6 text-white md:flex-row">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] text-white shadow-lg md:h-20 md:w-20">
                    <Icon name="DevicePhoneMobileIcon" size={40} className="scale-90 md:scale-100" />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-xl font-bold leading-tight text-white md:text-2xl">
                      No more cards to lose or forget.
                    </p>
                    <p className="mt-1 text-lg text-slate-300 md:text-xl">
                      Just open the app and <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">SWIPE</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 pt-4 animate-fade-up animation-delay-400 sm:flex-row">
            <Link
              to="/sign-up"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4988C4] px-8 py-4 text-lg font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1C4D8D] hover:shadow-2xl sm:w-auto"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={20} />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white bg-slate-200 px-8 py-4 text-lg font-semibold text-[#1C4D8D] backdrop-blur-sm transition-all hover:border-[#1C4D8D] hover:bg-white sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-muted-foreground pt-4 animate-fade-up animation-delay-500">
            All savings are member-only. Full details visible after sign-in.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HeroSection