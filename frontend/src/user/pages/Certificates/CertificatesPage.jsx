import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { getUser } from "../../../services/api";

const CertificatesPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const isLoggedIn = !!user;

  // If logged in, redirect to the full certificates page
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate("/certification", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-slate-50 to-blue-100 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4988C4]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-[#1C4D8D]">
              <Icon name="TicketIcon" size={18} />
              Exclusive Member Benefits
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Unlock Exclusive Certificates & Deals
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Get access to prepaid gift certificates and value-added deals from
              your favorite local businesses. Save up to 50% on everything you
              love.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1C4D8D] text-white rounded-lg font-bold text-lg hover:bg-[#0F2854] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Icon name="LockOpenIcon" size={22} />
                <span>Log In for Certificates</span>
              </button>
              <button
                onClick={() => navigate("/sign-up")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300"
              >
                <Icon name="UserPlusIcon" size={22} />
                <span>Join Now</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon name="CheckIcon" size={16} className="text-green-700" />
                </div>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon name="CheckIcon" size={16} className="text-blue-700" />
                </div>
                <span>Best Prices Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon
                    name="CheckIcon"
                    size={16}
                    className="text-purple-700"
                  />
                </div>
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Purchase Certificates?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get amazing deals on popular businesses and experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "ArrowTrendingDownIcon",
                title: "Save Big",
                description:
                  "Purchase certificates at discounted prices and save up to 50% on your favorite restaurants, spas, and services.",
                color: "bg-green-100 text-green-700",
              },
              {
                icon: "GiftIcon",
                title: "Gift Easily",
                description:
                  "Send digital gift certificates to friends and family instantly. Perfect for birthdays, holidays, and special occasions.",
                color: "bg-pink-100 text-pink-700",
              },
              {
                icon: "ShieldCheckIcon",
                title: "Risk-Free",
                description:
                  "Use certificates whenever you want. They never expire (subject to business terms), and you control how you spend them.",
                color: "bg-blue-100 text-blue-700",
              },
              {
                icon: "UserGroupIcon",
                title: "Family Plans",
                description:
                  "Share certificates with family members on your account. Great for family outings and dining experiences.",
                color: "bg-purple-100 text-purple-700",
              },
              {
                icon: "SparklesIcon",
                title: "Exclusive Deals",
                description:
                  "Access special member-only certificates not available to the general public. First access to new businesses.",
                color: "bg-orange-100 text-orange-700",
              },
              {
                icon: "CheckCircleIcon",
                title: "Easy Redemption",
                description:
                  "Simply show the certificate at checkout. It's that easy! No codes to remember, no hassle.",
                color: "bg-teal-100 text-teal-700",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-[#1C4D8D]/30 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-lg ${feature.color} flex items-center justify-center mb-6`}
                >
                  <Icon name={feature.icon} size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Certificates Section */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Categories Available
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Certificates available across all these popular categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              "🍽️ Dining",
              "🏨 Hotels",
              "✈️ Travel",
              "💆 Wellness",
              "🎭 Entertainment",
              "🛍️ Shopping",
              "💇 Beauty",
              "⛳ Activities",
              "📚 Learning",
              "🏋️ Fitness",
            ].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center border border-slate-200 hover:border-[#1C4D8D] hover:shadow-md transition-all duration-300"
              >
                <p className="font-semibold text-foreground text-lg">
                  {category}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-[#1C4D8D] to-[#2563eb] opacity-95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            Join Now and Start Saving
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Become a member of Discount Club Cayman and unlock access to
            thousands of exclusive certificates and deals from your favorite
            local businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/sign-up")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1C4D8D] rounded-lg font-bold text-lg hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Icon name="UserPlusIcon" size={22} />
              <span>Create Account</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              <Icon name="ArrowRightIcon" size={22} />
              <span>Already a Member? Log In</span>
            </button>
          </div>

          <p className="text-white/70 text-sm mt-8">
            💳 Secure payment. No hidden charges. Cancel anytime.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do certificates expire?",
                a: "Most certificates do not expire, but some may have expiration dates as noted. Check the certificate details when purchasing.",
              },
              {
                q: "Can I refund a certificate?",
                a: "Certificates are typically non-refundable once purchased, but you have full control over when and how you use them.",
              },
              {
                q: "How do I redeem a certificate?",
                a: "Simply show your digital certificate at the business checkout. The balance will be deducted from your purchase automatically.",
              },
              {
                q: "Can I transfer a certificate to someone else?",
                a: "Yes, you can gift certificates to family members or generate a unique code to share with others who can redeem it with their own account.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:border-[#1C4D8D]/30 transition-all duration-300"
              >
                <h3 className="font-heading font-bold text-foreground mb-3">
                  {item.q}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <p className="text-muted-foreground mb-4">
              Have more questions? Check our full FAQ or contact us.
            </p>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 text-[#1C4D8D] font-semibold hover:text-[#0F2854] transition-colors"
            >
              <span>View Full FAQ</span>
              <Icon name="ArrowRightIcon" size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesPage;
