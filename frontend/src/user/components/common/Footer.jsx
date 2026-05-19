import React from "react";
import { Link } from "react-router-dom";
import Icon from "../ui/AppIcon";
import AppImage from "../ui/AppImage";

const Footer = () => {
  const productLinks = [
    { href: "/browse-discounts", label: "Browse Discounts" },
    { href: "/certificates", label: "Certificates" },
    { href: "/pricing", label: "Pricing" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  const companyLinks = [
    { href: "/about", label: "About" },
    { href: "/for-businesses", label: "For Businesses" },
    { href: "/for-employers", label: "For Employers" },
    { href: "/for-associations", label: "For Associations" },
  ];

  const supportLinks = [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ];

  const socialLinks = [
    { icon: "Instagram", label: "Instagram", href: "#" },
    { icon: "Facebook", label: "Facebook", href: "#" },
    { icon: "Twitter", label: "Twitter", href: "#" },
  ];

  return (
    <footer className="bg-[#0D1328] border-t border-white/8">
      {/* Gradient divider */}
      <div className="h-0.5 bg-linear-to-r from-transparent via-[#D4A62A]/30 to-transparent"></div>

      <div className="bg-gradient-to-b from-[#111936] to-[#0D1328]">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <AppImage
                  src="/logo-rmbg.png"
                  alt="Discount Club Cayman Logo"
                  className="h-20 filter brightness-110"
                />
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-[#B8C0D4] font-medium">
                Empowering savings, enhancing lives. Making cost-of-living
                relief accessible to every Cayman resident.
              </p>
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#161F3D] border border-white/8 text-[#B8C0D4] hover:text-[#0D1328] hover:bg-[#D4A62A] hover:border-[#D4A62A] transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(212,166,42,0.3)] hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <Icon name={`${social.icon}Icon`} size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-7 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A62A] shadow-[0_0_6px_#D4A62A]"></span>
                Product
              </h4>
              <ul className="space-y-3.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#B8C0D4] hover:text-[#D4A62A] font-medium transition-all duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4A62A] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_4px_#D4A62A]" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-7 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A62A] shadow-[0_0_6px_#D4A62A]"></span>
                Company
              </h4>
              <ul className="space-y-3.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#B8C0D4] hover:text-[#D4A62A] font-medium transition-all duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4A62A] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_4px_#D4A62A]" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-7 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A62A] shadow-[0_0_6px_#D4A62A]"></span>
                Support
              </h4>
              <ul className="space-y-3.5">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-[#B8C0D4] hover:text-[#D4A62A] font-medium transition-all duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4A62A] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_4px_#D4A62A]" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 mb-8"></div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-[#8D95A8] font-semibold">
              &copy; 2026 Discount Club Cayman. All rights reserved.
            </p>
            <p className="text-xs text-[#8D95A8] font-semibold">
              Powered by{" "}
              <Link
                to="/"
                className="text-[#D4A62A] font-bold hover:text-[#E0B53A] transition-colors"
              >
                One World Discounts
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
