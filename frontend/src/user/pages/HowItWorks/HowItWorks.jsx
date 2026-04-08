import React from "react";
import Icon from "../../components/ui/AppIcon";

const HowItWorks = () => {
  const memberSteps = [
    {
      number: "1",
      title: "Sign Up for Membership",
      description:
        "Create your account and choose between individual or family membership plans with flexible monthly or annual billing options.",
      icon: "UserPlusIcon",
      color: "bg-blue-100 text-blue-700",
    },
    {
      number: "2",
      title: "Browse & Discover Offers",
      description:
        "Explore thousands of discounts and deals from local businesses, restaurants, travel providers, and more.",
      icon: "SparklesIcon",
      color: "bg-purple-100 text-purple-700",
    },
    {
      number: "3",
      title: "Claim & Redeem",
      description:
        "Use your mobile app to instantly claim discounts or certificates. Simply scan the QR code at participating businesses.",
      icon: "QrCodeIcon",
      color: "bg-green-100 text-green-700",
    },
    {
      number: "4",
      title: "Save Every Day",
      description:
        "Enjoy instant savings across dining, entertainment, travel, healthcare, and hundreds of other categories.",
      icon: "PresentationChartLineIcon",
      color: "bg-orange-100 text-orange-700",
    },
  ];

  const businessSteps = [
    {
      title: "Create Business Account",
      description:
        "Sign up as a business and set up your profile with location, contact info, and business details.",
      icon: "BuildingStorefrontIcon",
    },
    {
      title: "Create Offers",
      description:
        "Design compelling discount offers or certificates that appeal to our members and drive foot traffic.",
      icon: "TagIcon",
    },
    {
      title: "Gain Exposure",
      description:
        "Your offers are immediately visible to thousands of members searching for deals in your category.",
      icon: "BoltIcon",
    },
    {
      title: "Measure Success",
      description:
        "Track offer redemptions in real-time with our analytics dashboard. See what works and optimize accordingly.",
      icon: "ChartBarIcon",
    },
  ];

  const employerSteps = [
    {
      title: "Set Up Employer Account",
      description:
        "Register your company and set employee membership quotas based on your workforce size and needs.",
      icon: "BuildingOfficeIcon",
    },
    {
      title: "Upload Employee List",
      description:
        "Easily import your employee roster. We'll send personalized invitations to each team member.",
      icon: "DocumentArrowUpIcon",
    },
    {
      title: "Employees Activate Benefits",
      description:
        "Your team members accept invitations and immediately gain access to full membership benefits.",
      icon: "CheckCircleIcon",
    },
    {
      title: "Track Engagement",
      description:
        "Monitor employee adoption and engagement with real-time analytics and utilization reports.",
      icon: "EyeIcon",
    },
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
              Easy to Use Platform
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              How Discount Club Cayman Works
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a member looking to save, a business seeking
              customers, or an employer offering benefits, our platform makes it
              simple and rewarding.
            </p>
          </div>
        </div>
      </div>

      {/* For Members Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4988C4]/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              For Members
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start saving on everything you love in just four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {memberSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-full ${step.color} flex items-center justify-center mb-6 text-2xl font-bold shadow-lg`}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < memberSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-1 bg-gradient-to-r from-[#1C4D8D] to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Businesses Section */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              For Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get discovered by thousands of customers and drive revenue growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessSteps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-[#1C4D8D] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-6 text-2xl">
                  <Icon name={step.icon} size={28} />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Employers Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              For Employers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Offer your employees a valuable benefit that improves satisfaction
              and retention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {employerSteps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-[#1C4D8D] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-6 text-2xl">
                  <Icon name={step.icon} size={28} />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Quick Section */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Quick Questions?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Visit our FAQ page for more detailed answers about membership,
              discounts, and how to get started.
            </p>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1C4D8D] text-white rounded-lg font-semibold hover:bg-[#0F2854] transition-colors duration-200"
            >
              <span>Browse FAQ</span>
              <Icon name="ArrowRightIcon" size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
