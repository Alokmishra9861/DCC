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
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <AppImage
                src="/logo.png"
                alt="Discount Club Cayman Logo"
                className="h-20 scale-150"
              />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Empowering savings, enhancing lives. Making cost-of-living relief
              accessible to every Cayman resident.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-white hover:bg-[#1C4D8D] hover:border-[#1C4D8D] transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label={social.label}
                >
                  <Icon name={`${social.icon}Icon`} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
              Product
            </h4>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 hover:text-[#1C4D8D] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C4D8D] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
              Company
            </h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 hover:text-[#1C4D8D] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C4D8D] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-600 hover:text-[#1C4D8D] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C4D8D] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 font-medium">
            &copy; 2026 Discount Club Cayman. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 font-medium">
            Powered by{" "}
            <span className="text-[#1C4D8D] font-bold">
              One World Discounts
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
