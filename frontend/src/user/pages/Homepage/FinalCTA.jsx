import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4988C4] to-[#BDE8F5]"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-[500px] bg-white/10 blur-[100px] rounded-full pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="space-y-10 animate-fade-up">
          {/* Message */}
          <h2 className="text-3xl md:text-5xl text-white font-bold leading-tight tracking-tight drop-shadow-md">
            All savings are member-only.<br className="hidden md:block" /> See everything once you're inside.
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/sign-up"
              className="group relative px-10 py-5 bg-white text-purple-700 rounded-full text-xl font-bold hover:bg-gray-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-flex items-center gap-2 transform hover:-translate-y-1"
            >
              Join Now
              <Icon name="ArrowRightIcon" size={24} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="group px-10 py-5 bg-white/10 text-white border border-white/30 rounded-full text-xl font-bold hover:bg-white/20 hover:border-white/50 transition-all inline-flex items-center gap-2 backdrop-blur-sm"
            >
              Sign In
              <Icon name="ArrowRightIcon" size={24} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA