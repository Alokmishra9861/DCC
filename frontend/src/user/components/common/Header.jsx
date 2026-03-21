import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/AppIcon";
import AppImage from "../ui/AppImage";
import {
  getUser,
  removeToken,
  removeUser,
  getAssociationType,
} from "../../../services/api";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getUser());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getUser());
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    removeToken();
    removeUser();
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // ── Nav link definitions per role ────────────────────────────────────────────
  const publicNavLinks = [
    { href: "/", label: "Home" },
    { href: "/for-individuals", label: "For Individuals" },
    { href: "/for-employers", label: "For Employers" },
    { href: "/for-businesses", label: "For Businesses" },
    { href: "/for-associations", label: "For Associations" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const memberNavLinks = [
    { href: "/member-dashboard", label: "Dashboard" },
    { href: "/travel", label: "Travel" },
    { href: "/discounts", label: "Discounts" },
    { href: "/certification", label: "Certificates" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const businessNavLinks = [
    { href: "/business-dashboard", label: "Dashboard" },
    { href: "/discounts", label: "Discounts" },
    { href: "/certification", label: "Certificates" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const employerNavLinks = [
    { href: "/employer-dashboard", label: "Dashboard" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  // ── ASSOCIATION nav ──────────────────────────────────────────────────────────
  // Dashboard href reads associationType from localStorage (set by saveAuthData).
  // Falls back to /association-member-dashboard if type not yet cached.
  const assocDashboardHref = React.useMemo(() => {
    const type = getAssociationType();
    return type === "BUSINESS"
      ? "/association-business-dashboard"
      : "/association-member-dashboard";
    // Re-compute when route changes so it picks up a freshly-cached type
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const associationNavLinks = [
    { href: assocDashboardHref, label: "Dashboard" },
    { href: "/b2b-discounts", label: "B2B Discounts" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const getNavLinks = () => {
    if (!currentUser) return publicNavLinks;
    switch ((currentUser.role || "").toUpperCase()) {
      case "BUSINESS":
        return businessNavLinks;
      case "EMPLOYER":
        return employerNavLinks;
      case "ASSOCIATION":
        return associationNavLinks;
      case "ADMIN":
        return [{ href: "/admin", label: "Admin Panel" }];
      default:
        return memberNavLinks; // MEMBER / B2B
    }
  };

  const navLinks = getNavLinks();
  const displayName = currentUser?.name?.split(" ")[0] || "Account";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24 lg:h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 -ml-4 h-full">
            <AppImage
              src="/logo.png"
              alt="Discount Club Cayman Logo"
              className="h-full w-auto max-h-none object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-semibold transition-colors relative group py-2 ${
                  isActive(link.href)
                    ? "text-[#1C4D8D]"
                    : "text-slate-600 hover:text-[#1C4D8D]"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1C4D8D] rounded-full" />
                )}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1C4D8D] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full">
                  <div className="w-7 h-7 bg-[#1C4D8D] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-red-600 border-2 border-red-100 rounded-full hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#1C4D8D] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/membership"
                  className="px-5 py-2.5 bg-[#1C4D8D] text-white rounded-full text-sm font-bold hover:bg-[#1C4D8D]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Icon
              name={isMobileMenuOpen ? "XMarkIcon" : "Bars3Icon"}
              size={24}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 max-h-[calc(100vh-90px)] overflow-y-auto">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? "text-white bg-[#1C4D8D]"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-4 pt-4 mt-2 border-t border-slate-200">
                {currentUser ? (
                  <div className="px-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="w-9 h-9 bg-[#1C4D8D] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {currentUser.role?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 border-2 border-red-200 text-red-600 rounded-lg text-base font-semibold hover:bg-red-50 transition-all text-center"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-3 border-2 border-slate-200 rounded-lg text-base font-semibold hover:border-[#1C4D8D] hover:text-[#1C4D8D] transition-all text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/membership"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-3 bg-[#1C4D8D] text-white rounded-lg text-base font-semibold hover:bg-[#1C4D8D]/90 transition-all shadow-md text-center"
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
