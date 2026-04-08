import React from "react";
import Icon from "../../components/ui/AppIcon";

const Terms = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        "By accessing and using the Discount Club Cayman platform (website, mobile application, and services), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "2. Use License",
      content:
        "Permission is granted to temporarily download one copy of the materials (information or software) on Discount Club Cayman's platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n\n• Modify or copy the materials\n• Use the materials for any commercial purpose or for any public display\n• Attempt to decompile or reverse engineer any software contained on the platform\n• Remove any copyright or other proprietary notations from the materials\n• Transfer the materials to another person or \"mirror\" the materials on any other server\n• Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the platform",
    },
    {
      title: "3. Disclaimer",
      content:
        "The materials on Discount Club Cayman's platform are provided on an 'as is' basis. Discount Club Cayman makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
    },
    {
      title: "4. Limitations",
      content:
        "In no event shall Discount Club Cayman or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform, even if Discount Club Cayman or an authorized representative has been notified orally or in writing of the possibility of such damage.",
    },
    {
      title: "5. Accuracy of Materials",
      content:
        "The materials appearing on the Discount Club Cayman platform could include technical, typographical, or photographic errors. Discount Club Cayman does not warrant that any of the materials on the platform are accurate, complete, or current. Discount Club Cayman may make changes to the materials contained on its platform at any time without notice.",
    },
    {
      title: "6. Materials Not Reviewed",
      content:
        "Discount Club Cayman has not reviewed all of the sites linked to its platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Discount Club Cayman of the site. Use of any such linked website is at the user's own risk.",
    },
    {
      title: "7. Modifications",
      content:
        "Discount Club Cayman may revise these terms of service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service.",
    },
    {
      title: "8. Governing Law",
      content:
        "These terms and conditions are governed by and construed in accordance with the laws of the Cayman Islands, and you irrevocably submit to the exclusive jurisdiction of the courts located in the Cayman Islands.",
    },
    {
      title: "9. User Accounts",
      content:
        "When you register for an account, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and are liable for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.",
    },
    {
      title: "10. User Conduct",
      content:
        "You agree not to use the platform to:\n\n• Engage in any illegal or unauthorized activities\n• Harass, abuse, or threaten any person or entity\n• Infringe upon any intellectual property rights\n• Post or transmit any viruses, malware, or harmful code\n• Attempt to gain unauthorized access to any portion of the platform\n• Spam or send unsolicited messages\n• Impersonate any person or entity",
    },
    {
      title: "11. Membership Terms",
      content:
        "Membership subscriptions are billed on a recurring monthly or annual basis based on your selected plan. You authorize us to charge your payment method each billing period. Membership can be canceled at any time, with cancellation taking effect at the end of your current billing period. No refunds are issued for partial months.",
    },
    {
      title: "12. Intellectual Property Rights",
      content:
        "All content on the Discount Club Cayman platform, including text, graphics, logos, images, and software, is the property of Discount Club Cayman or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, transmit, or display any content without our prior written permission.",
    },
    {
      title: "13. Offers and Discounts",
      content:
        "Discount offers on the platform are provided subject to the terms and conditions specified by the business offering the discount. Discount Club Cayman is not responsible for any business's failure to honor an offer. Each offer has an expiration date, and expired offers cannot be redeemed. Some offers may have restrictions or exclusions as noted.",
    },
    {
      title: "14. Limitation of Liability",
      content:
        "To the fullest extent permitted by law, neither Discount Club Cayman nor its affiliates shall be liable to you for any direct, indirect, incidental, special, consequential, or punitive damages, or any loss of profit, revenue, or data, arising from or related to your use of the platform, even if advised of the possibility of such damages.",
    },
    {
      title: "15. Indemnification",
      content:
        "You agree to indemnify and hold harmless Discount Club Cayman and its officers, directors, employees, agents, and successors from any claims, damages, losses, and expenses (including reasonable attorney's fees) arising out of or related to your use of the platform or violation of these terms.",
    },
    {
      title: "16. Termination",
      content:
        "Discount Club Cayman reserves the right to suspend or terminate your account and access to the platform at any time, for any reason or no reason, including if we believe you have violated these terms of service.",
    },
    {
      title: "17. Contact Information",
      content:
        "If you have any questions about these Terms of Service, please contact us at:\n\nDiscount Club Cayman\nGeorge Town, Grand Cayman\nEmail: legal@discountclubcayman.ky\nPhone: +1 (345) 949-SAVE",
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
              <Icon name="DocumentTextIcon" size={16} />
              Legal Terms
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Terms of Service
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using Discount Club
              Cayman.
            </p>
            <p className="text-sm text-muted-foreground mt-6">
              Last updated: April 2026
            </p>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4988C4]/10 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-[#1C4D8D]/20 transition-all duration-300"
              >
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-16 p-8 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <Icon
                  name="InformationCircleIcon"
                  size={24}
                  className="text-blue-700"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground mb-2">
                  Questions about our Terms?
                </h3>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please
                  don't hesitate to reach out to our legal team.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 text-[#1C4D8D] font-semibold hover:text-[#0F2854] transition-colors"
                >
                  <span>Contact Us</span>
                  <Icon name="ArrowRightIcon" size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
