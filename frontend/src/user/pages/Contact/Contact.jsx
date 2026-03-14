import React, { useState } from "react";
import Icon from "../../components/ui/AppIcon";
import { contactAPI } from "../../../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "general",
          message: "",
        });
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      id: "info_1",
      icon: "PhoneIcon",
      title: "Phone",
      value: "+1 (345) 949-SAVE",
      link: "tel:+13459497283",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "info_2",
      icon: "EnvelopeIcon",
      title: "Email",
      value: "info@discountclubcayman.ky",
      link: "mailto:info@discountclubcayman.ky",
      color: "bg-green-100 text-green-700",
    },
    {
      id: "info_3",
      icon: "MapPinIcon",
      title: "Office",
      value: "George Town, Grand Cayman",
      link: null,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "info_4",
      icon: "ClockIcon",
      title: "Hours",
      value: "Mon-Fri: 9AM-5PM",
      link: null,
      color: "bg-orange-100 text-orange-700",
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full text-[#1C4D8D] font-semibold text-sm mb-6 shadow-sm">
              <Icon name="ChatBubbleLeftRightIcon" size={16} />
              We're Here to Help
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
              Get in Touch
            </h1>
            <p className="text-xl md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions about membership, partnerships, or how Discount
              Club Cayman works? We are here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {contactInfo?.map((info) => (
              <div
                key={info?.id}
                className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div
                  className={`w-16 h-16 ${info?.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon name={info?.icon} size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {info?.title}
                </h3>
                {info?.link ? (
                  <a
                    href={info?.link}
                    className="text-lg text-muted-foreground hover:text-[#1C4D8D] transition-colors font-medium"
                  >
                    {info?.value}
                  </a>
                ) : (
                  <p className="text-lg text-muted-foreground font-medium">
                    {info?.value}
                  </p>
                )}
              </div>
            )) || []}
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                  Send Us a Message
                </h2>

                {submitted ? (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-12 text-center animate-fade-up">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon name="CheckCircleIcon" size={40} />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      Thank you for contacting us. We will get back to you
                      within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData?.name}
                          onChange={handleChange}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData?.email}
                          onChange={handleChange}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData?.phone}
                          onChange={handleChange}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all"
                          placeholder="+1 (345) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                          Subject *
                        </label>
                        <div className="relative">
                          <select
                            name="subject"
                            required
                            value={formData?.subject}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all appearance-none"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="membership">
                              Membership Question
                            </option>
                            <option value="business">
                              Business Partnership
                            </option>
                            <option value="employer">Employer Program</option>
                            <option value="association">
                              Association Partnership
                            </option>
                            <option value="support">Technical Support</option>
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <Icon name="ChevronDownIcon" size={20} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2 ml-1">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        value={formData?.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#0F2854] transition-all resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-8 py-4 bg-[#0F2854] text-white text-primary-foreground rounded-xl text-lg font-bold hover:bg-[#1C4D8D] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sending..." : "Send Message"}
                      <Icon name="PaperAirplaneIcon" size={20} />
                    </button>
                    {error && (
                      <p className="text-sm text-red-600 text-center mt-2">
                        {error}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-bold text-xl text-foreground mb-3">
                How do I become a member?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Simply click the "Join Now" button, choose your membership tier,
                and complete the registration process. You will have immediate
                access to all discounts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-bold text-xl text-foreground mb-3">
                How do I use my membership?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Once logged in, browse our discount directory, find offers you
                want to use, and show your membership at participating
                businesses to receive your discount.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-bold text-xl text-foreground mb-3">
                Can businesses join Discount Club Cayman?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! We welcome local businesses to join our network. Visit our
                "For Businesses" page or contact us to learn about partnership
                opportunities.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-bold text-xl text-foreground mb-3">
                Do you offer employer or association programs?
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Absolutely! We have special programs for employers and
                associations. Contact us to discuss bulk enrollment and custom
                pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
