import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const ForEmployersContent = () => {
    const benefits = [
    {
      id: 'emp_1',
      icon: 'UserGroupIcon',
      title: 'Boost Employee Morale',
      description: 'Show your team you care by providing real value that helps with cost of living challenges.',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'emp_2',
      icon: 'HeartIcon',
      title: 'Attract & Retain Talent',
      description: 'Stand out as an employer of choice with a benefit that employees actually use and appreciate.',
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'emp_3',
      icon: 'CurrencyDollarIcon',
      title: 'Cost-Effective Benefit',
      description: 'Provide thousands in value to employees at a fraction of the cost of traditional benefits.',
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'emp_4',
      icon: 'ChartBarIcon',
      title: 'Easy Administration',
      description: 'Simple enrollment process with minimal administrative overhead for your HR team.',
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  const features = [
    { id: 'feat_1', text: 'Bulk enrollment for all employees' },
    { id: 'feat_2', text: 'Dedicated account manager' },
    { id: 'feat_3', text: 'Usage reporting and analytics' },
    { id: 'feat_4', text: 'Flexible payment options' },
    { id: 'feat_5', text: 'Employee onboarding support' },
    { id: 'feat_6', text: 'Downloadable Staff Handout Materials' }
  ];
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
              Employee Benefits
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              A Benefit Your Employees Will Actually Use
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Help your team combat the high cost of living in Cayman with a membership that delivers real, everyday savings on travel, groceries, dining, and more.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/sign-up"
                className="px-8 py-4 bg-[#4988C4] text-primary-foreground rounded-full text-lg font-bold hover:bg-[#1C4D8D]transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                Get Started
                <Icon name="ArrowRightIcon" size={20} />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-white text-foreground border border-border rounded-full text-lg font-semibold hover:border-[#4988C4] hover:text-[#4988C4] hover:bg-gray-50 transition-all shadow-sm"
              >
                View Employer Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Employers Choose Discount Club Cayman
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Invest in your team with a benefit that makes a real difference
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {benefits?.map((benefit) => (
              <div key={benefit?.id} className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 ${benefit?.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon name={benefit?.icon} size={32} />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-3 group-hover:text-[#4988C4] transition-colors">
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
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-8">
                The Numbers Speak for Themselves
              </h2>
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-4xl font-bold text-green-400 mb-2">$2,010</p>
                  <p className="text-slate-300">Average annual savings per employee</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-4xl font-bold text-blue-400 mb-2">105</p>
                  <p className="text-slate-300">Local businesses offering discounts</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-4xl font-bold text-purple-400 mb-2">70%</p>
                  <p className="text-slate-300">Maximum savings on travel bookings</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-4xl font-bold text-orange-400 mb-2">$2,500</p>
                  <p className="text-slate-300">Save as much as USD 2,500 on a 7 night vacation</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-heading text-3xl font-bold text-white mb-8">
                What Employers Get
              </h3>
              <ul className="space-y-6 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                {features?.map((feature) => (
                  <li key={feature?.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="CheckIcon" size={16} className="text-green-400" />
                    </div>
                    <span className="text-slate-200 text-lg">{feature?.text}</span>
                  </li>
                )) || []}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple Setup Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your team enrolled in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -z-10"></div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg z-10 relative">
                1
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Contact Us
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Reach out to discuss your company size and needs. We will create a custom package.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 border-[#4988C4]/50 text-[#1C4D8D]  rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg z-10 relative">
                2
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Bulk Enrollment
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We handle the enrollment process for all employees with minimal effort from your HR team.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-white border-4 text-[#1C4D8D] border-[#4988C4]/50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg z-10 relative">
                3
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                Employees Save
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your team starts saving immediately on travel, groceries, dining, and everyday expenses.
              </p>
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
            Ready to Invest in Your Team?
          </h2>
          <p className="text-xl md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Contact us today to learn about employer pricing and bulk enrollment options.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              to="/sign-up"
              className="group px-10 py-5 bg-white text-[#1C4D8D] rounded-full text-xl font-bold hover:bg-gray-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-flex items-center gap-2 transform hover:-translate-y-1"
            >
              Get Started
              <Icon name="ArrowRightIcon" size={24} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-transparent text-white border border-white/30 rounded-full text-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForEmployersContent