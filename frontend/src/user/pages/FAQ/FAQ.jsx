import React, { useState } from "react";
import Icon from "../../components/ui/AppIcon";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Membership",
      questions: [
        {
          q: "What is Discount Club Cayman?",
          a: "Discount Club Cayman is a membership-based platform that connects members with exclusive discounts and benefits from local businesses, restaurants, travel providers, and more across the Cayman Islands.",
        },
        {
          q: "How much does membership cost?",
          a: "Membership plans start at $4.99/month for individual membership or $7.99/month for family membership. Annual plans are also available at discounted rates. You can cancel anytime with no penalties.",
        },
        {
          q: "What's included in the family plan?",
          a: "The family plan covers up to 4 family members on a single account, giving everyone access to the same discounts and benefits. Each member gets their own digital card in the app.",
        },
        {
          q: "Can I cancel my membership anytime?",
          a: "Yes, you can cancel your membership at any time through your account settings. Your access will continue until the end of your current billing period.",
        },
        {
          q: "Do I get a refund if I cancel mid-month?",
          a: "Memberships are billed on a monthly or annual basis. Cancellations take effect at the end of your current billing period. We do not provide prorated refunds for partial months.",
        },
      ],
    },
    {
      category: "Using Discounts",
      questions: [
        {
          q: "How do I use a discount at a business?",
          a: "Open the Discount Club Cayman app, browse or search for offers, tap 'Claim' on the discount you want to use, and show the QR code to the business cashier. They'll scan it, and your discount is applied instantly.",
        },
        {
          q: "Can I use multiple discounts at the same business?",
          a: "Most businesses allow one discount per transaction. Check the specific offer details for any restrictions before claiming.",
        },
        {
          q: "What if a business doesn't accept the code?",
          a: "Make sure the business is listed as accepting Discount Club Cayman and the offer hasn't expired. If there's a problem, contact us and we'll help resolve it.",
        },
        {
          q: "Are there expiration dates on discounts?",
          a: "Yes, each offer has an expiration date clearly displayed. We recommend checking before heading to the business to ensure the offer is still valid.",
        },
        {
          q: "Can I use discounts online?",
          a: "Some offers are valid online and in-store. Check the offer details to see which redemption methods are available for each discount.",
        },
      ],
    },
    {
      category: "Certificates & Deals",
      questions: [
        {
          q: "What are certificates?",
          a: "Certificates are digital vouchers you purchase through the app at a discounted price. For example, buy a $50 restaurant certificate for $35. They can be redeemed for service or products at participating businesses.",
        },
        {
          q: "How do I purchase a certificate?",
          a: "Browse the Certificates section in the app, select the business and certificate value, and complete the purchase through our secure payment system.",
        },
        {
          q: "Can I gift a certificate to someone else?",
          a: "Yes, you can generate a unique code that you can share with anyone. They can redeem it with their own account.",
        },
        {
          q: "What's the difference between a discount and a certificate?",
          a: "Discounts give you a percentage or fixed amount off directly at checkout. Certificates are pre-purchased at a discount and can be used multiple times until the balance is spent.",
        },
      ],
    },
    {
      category: "Travel & Experiences",
      questions: [
        {
          q: "What travel deals are available?",
          a: "We offer negotiated rates on hotels, flights, car rentals, activities, and travel packages with our partner vendors. Browse the Travel section to see current deals.",
        },
        {
          q: "Can I book travel through the app?",
          a: "Yes, you can browse, compare, and book travel directly through our app with member-exclusive rates. Payment is secure and you'll receive confirmation and booking details immediately.",
        },
        {
          q: "Is travel insurance included?",
          a: "Travel insurance varies by booking and provider. Check the booking details for what's included. Comprehensive insurance can often be added during checkout.",
        },
      ],
    },
    {
      category: "For Businesses",
      questions: [
        {
          q: "How much does it cost to list my business?",
          a: "Listing your business is free. You only pay a commission on successful transactions (discounts claimed or certificates sold). We have flexible pricing based on your business type and volume.",
        },
        {
          q: "How do I create offers that attract customers?",
          a: "Create offers that solve real problems: deep discounts on popular items, limited-time deals, or exclusive member benefits. Track performance in your dashboard and optimize based on redemption data.",
        },
        {
          q: "How do I get paid for redemptions?",
          a: "We settle payouts weekly. You can view real-time redemptions in your dashboard, and payments are deposited directly to your business bank account.",
        },
        {
          q: "Can I see who's using my offers?",
          a: "Yes, your business dashboard shows detailed analytics: number of redemptions, revenue generated, peak usage times, and more. Use this data to understand what's working.",
        },
      ],
    },
    {
      category: "For Employers",
      questions: [
        {
          q: "How do employer memberships work?",
          a: "You set up a company account, upload your employee list, and we send invitations to each team member. They accept and get immediate access to full member benefits at no cost to them.",
        },
        {
          q: "What's the cost for employer memberships?",
          a: "Pricing is based on the number of employees. Contact our sales team for a customized quote. Bulk rates are available.",
        },
        {
          q: "Can I track which employees are using benefits?",
          a: "Yes, your employer dashboard shows adoption rates, benefit usage by category, total savings generated, and engagement metrics to measure program success.",
        },
        {
          q: "Can employees bring family members on the family plan?",
          a: "If you've purchased family memberships, each employee can include family members. If you've purchased individual memberships, only the employee has access.",
        },
      ],
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a secure link to reset your password.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes. We use industry-standard encryption (SSL/TLS) and integrate with Stripe for secure payment processing. We never store full credit card details.",
        },
        {
          q: "Can I update my account information?",
          a: "Yes, you can update your profile, email, billing address, and payment method anytime in your account settings.",
        },
        {
          q: "How is my personal data used?",
          a: "We use your data to provide services, improve your experience, and send you relevant offers and updates. We never sell your data to third parties. See our Privacy Policy for full details.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "The app isn't working properly. What should I do?",
          a: "Try restarting the app or your device. Make sure you're using the latest version from the App Store or Google Play. If the issue persists, contact our support team.",
        },
        {
          q: "I'm having trouble logging in.",
          a: "Clear your app cache, try the password reset option, or reinstall the app. If you still can't log in, contact our support team.",
        },
        {
          q: "How do I contact customer support?",
          a: "Reach out to us at support@discountclubcayman.ky or call +1 (345) 949-SAVE. We're available Monday-Friday, 9AM-5PM.",
        },
      ],
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let faqIndex = 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-100 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-[#1C4D8D]">
              <Icon name="QuestionMarkCircleIcon" size={16} />
              We're Here to Help
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about membership, discounts,
              certificates, and how to get the most out of Discount Club Cayman.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4988C4]/10 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8 pb-4 border-b-2 border-[#1C4D8D]/20">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, qIndex) => {
                  const globalIndex = faqIndex++;
                  return (
                    <div
                      key={globalIndex}
                      className="bg-white rounded-lg border border-slate-200 hover:border-[#1C4D8D]/30 transition-all duration-300 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-6 py-4 flex items-start justify-between hover:bg-slate-50 transition-colors duration-200"
                      >
                        <h3 className="font-heading font-bold text-foreground text-left text-lg">
                          {item.q}
                        </h3>
                        <div
                          className={`flex-shrink-0 ml-4 transition-transform duration-300 ${
                            openIndex === globalIndex ? "rotate-180" : ""
                          }`}
                        >
                          <Icon
                            name="ChevronDownIcon"
                            size={24}
                            className="text-[#1C4D8D]"
                          />
                        </div>
                      </button>
                      {openIndex === globalIndex && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                          <p className="text-muted-foreground text-base leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Still have questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our support team is here to help. Reach out anytime and we'll get
              back to you quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#1C4D8D] text-white rounded-lg font-semibold hover:bg-[#0F2854] transition-colors duration-200"
              >
                <span>Contact Us</span>
                <Icon name="ArrowRightIcon" size={20} />
              </a>
              <a
                href="mailto:support@discountclubcayman.ky"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-[#1C4D8D] text-[#1C4D8D] rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                <Icon name="EnvelopeIcon" size={20} />
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
