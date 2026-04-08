import React from "react";
import Icon from "../../components/ui/AppIcon";

const Privacy = () => {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "Discount Club Cayman ('we,' 'us,' 'our,' or 'Company') respects the privacy of its users and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform, including our website and mobile application.",
    },
    {
      title: "2. Information We Collect",
      content:
        "We collect information you voluntarily provide to us such as:\n\n• Account Information: Name, email address, phone number, date of birth, and password\n• Payment Information: Billing address, payment method details (processed securely via Stripe)\n• Profile Information: Family members' names (for family plans), preferences, and interests\n• Location Data: Your location for finding nearby discounts (optional)\n• Communication Data: Messages you send us and correspondence history\n• Usage Data: How you interact with the platform, pages visited, and features used\n• Device Information: Device type, operating system, browser, and IP address",
    },
    {
      title: "3. How We Use Your Information",
      content:
        "We use your information to:\n\n• Provide and maintain our services\n• Process your membership subscription and payments\n• Send you updates about your account and service changes\n• Personalize your experience and recommend relevant offers\n• Send marketing communications (with your consent)\n• Detect and prevent fraud or security issues\n• Comply with legal obligations\n• Improve our platform and services\n• Respond to your inquiries and customer support requests",
    },
    {
      title: "4. Sharing Your Information",
      content:
        "We do not sell your personal data. However, we may share your information with:\n\n• Participating Businesses: When you redeem a discount, we share redemption confirmation (not personal details unless required)\n• Payment Processors: Stripe processes payments securely\n• Service Providers: Third-party vendors who assist us (email, analytics, hosting)\n• Legal Authorities: When required by law or to protect our rights\n• Business Partners: With your consent for co-marketing opportunities\n\nAll third parties are required to maintain your information's confidentiality.",
    },
    {
      title: "5. For Employers and Associations",
      content:
        "If you register as an employer or association:\n\n• We collect and store employee/member information you provide\n• Your dashboard can see aggregate usage statistics only (not individual personal data)\n• Employee invitations contain your company name but no other employee information\n• You agree that Discount Club Cayman is the data processor and you are the controller\n• Employees have full control of their personal accounts and data",
    },
    {
      title: "6. Data Security",
      content:
        "We implement industry-standard security measures to protect your personal information:\n\n• SSL/TLS encryption for all data in transit\n• Secure password hashing (bcrypt)\n• Restricted access to personal information (employees on need-to-know basis)\n• Regular security audits and updates\n• PCI DSS compliance for payment processing\n\nWhile we strive to protect your data, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.",
    },
    {
      title: "7. Your Rights and Choices",
      content:
        "You have the right to:\n\n• Access your personal information and request a copy\n• Correct inaccurate or incomplete information\n• Delete your account and associated data\n• Opt-out of marketing communications\n• Withdraw consent for specific data uses\n• Export your data in a portable format\n\nTo exercise these rights, contact us at privacy@discountclubcayman.ky. We will respond within 30 days.",
    },
    {
      title: "8. Cookies and Tracking Technologies",
      content:
        "We use:\n\n• Essential Cookies: Required for platform functionality\n• Analytics Cookies: Help us understand how you use the platform\n• Marketing Cookies: Track advertising effectiveness\n\nYou can control cookies through your browser settings. Disabling cookies may affect platform functionality. We do not track you across third-party websites.",
    },
    {
      title: "9. Third-Party Links",
      content:
        "Our platform may contain links to third-party websites. We are not responsible for their privacy practices. This Privacy Policy only applies to our platform. Please review the privacy policies of any external sites before providing your information.",
    },
    {
      title: "10. Children's Privacy",
      content:
        "Discount Club Cayman is not intended for children under 18. We do not knowingly collect personal information from children. If we learn that we have collected such information, we will promptly delete it. Parents or guardians who believe we have collected information about their child should contact us immediately.",
    },
    {
      title: "11. Data Retention",
      content:
        "We retain your personal information for as long as:\n\n• Your account is active\n• Necessary to provide our services\n• Required by law or for legitimate business purposes\n\nWhen you delete your account, we delete or anonymize your personal data within 30 days, except where retention is required by law or for backup purposes.",
    },
    {
      title: "12. International Data Transfers",
      content:
        "Your information is stored and processed in the Cayman Islands. If you access our platform from outside the Cayman Islands, you consent to the transfer of your information to and within the Cayman Islands.",
    },
    {
      title: "13. Marketing Communications",
      content:
        "We may send you promotional emails about new offers, features, or services. You can opt-out by:\n\n• Clicking 'Unsubscribe' in any marketing email\n• Adjusting your notification preferences in your account settings\n• Contacting us at support@discountclubcayman.ky\n\nPlease note: You cannot opt-out of transactional emails related to your account.",
    },
    {
      title: "14. GDPR and Privacy Laws",
      content:
        "If you are a resident of the European Union or other jurisdictions with privacy laws, you have additional rights. We are committed to complying with the General Data Protection Regulation (GDPR) and similar laws. For GDPR-related requests, contact our Data Protection Officer at privacy@discountclubcayman.ky.",
    },
    {
      title: "15. Changes to This Privacy Policy",
      content:
        "We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the 'Last Updated' date and, where possible, sending you an email notification. Your continued use of the platform following changes constitutes your acceptance of the updated policy.",
    },
    {
      title: "16. Contact Us",
      content:
        "If you have questions about this Privacy Policy or our privacy practices, please contact us:\n\nDiscount Club Cayman\nGeorge Town, Grand Cayman\nEmail: privacy@discountclubcayman.ky\nGeneral Inquiries: support@discountclubcayman.ky\nPhone: +1 (345) 949-SAVE\n\nData Protection Officer: privacy@discountclubcayman.ky",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-slate-50 to-blue-100 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-[#1C4D8D]">
              <Icon name="LockClosedIcon" size={16} />
              Your Privacy Matters
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We are committed to protecting your privacy. Learn how we collect,
              use, and safeguard your information.
            </p>
            <p className="text-sm text-muted-foreground mt-6">
              Last updated: April 2026
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Content */}
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
          <div className="mt-16 p-8 bg-green-50 rounded-xl border border-green-200">
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <Icon
                  name="CheckCircleIcon"
                  size={24}
                  className="text-green-700"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground mb-2">
                  Your privacy is our priority
                </h3>
                <p className="text-muted-foreground mb-4">
                  We take data protection seriously and comply with all
                  applicable privacy laws. If you have concerns about how we
                  handle your data, please reach out to our privacy team.
                </p>
                <a
                  href="mailto:privacy@discountclubcayman.ky"
                  className="inline-flex items-center gap-2 text-[#1C4D8D] font-semibold hover:text-[#0F2854] transition-colors"
                >
                  <Icon name="EnvelopeIcon" size={18} />
                  <span>privacy@discountclubcayman.ky</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
