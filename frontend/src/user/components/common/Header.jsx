import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/AppIcon";
import AppImage from "../ui/AppImage";
import {
  getUser,
  removeToken,
  removeUser,
  getAssociationType,
  notificationAPI,
  authAPI,
} from "../../../services/api";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getUser());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(getUser());
  }, [location.pathname]);

  // Load and Subscribe to Notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        const list = await notificationAPI.getAll();
        setNotifications(list.notifications || []);
        
        const countRes = await notificationAPI.getUnreadCount();
        setUnreadCount(countRes.count || 0);
      } catch (err) {
        console.error("Failed to load notifications:", err.message);
      }
    };
    loadNotifications();

    let stream;
    try {
      stream = notificationAPI.getStream();
      stream.onmessage = (event) => {
        try {
          const newNotif = JSON.parse(event.data);
          if (newNotif && newNotif.id) {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        } catch (e) {
          // handshake/keep-alive logs ignored
        }
      };
    } catch (err) {
      console.error("SSE stream error:", err.message);
    }

    return () => {
      if (stream) stream.close();
    };
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authAPI.logout().catch((err) => console.error("Logout API error:", err));
    removeToken();
    removeUser();
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const publicNavLinks = [
    { href: "/", label: "Home" },
    { href: "/members", label: "For Members" },
    { href: "/for-employers", label: "For Employers" },
    { href: "/for-businesses", label: "For Businesses" },
    { href: "/for-associations", label: "For Associations" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const memberNavLinks = [
    { href: "/member-dashboard", label: "Dashboard" },
    { href: "/travel", label: "Travel" },
    { href: "/discounts", label: "Discounts" },
    { href: "/certification", label: "Certificates" },
    { href: "/categories", label: "Categories" },
    { href: "/b2b-directory", label: "B2B Directory" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const businessNavLinks = [
    { href: "/business-dashboard", label: "Dashboard" },
    { href: "/discounts", label: "Discounts" },
    { href: "/certification", label: "Certificates" },
    { href: "/b2b-directory", label: "B2B Directory" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  const employerNavLinks = [
    { href: "/employer-dashboard", label: "Dashboard" },
    { href: "/b2b-directory", label: "B2B Directory" },
    { href: "/b2b-discounts", label: "B2B Discounts" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ];

  // ── B2B PARTNER nav ──────────────────────────────────────────────────────────
  const b2bNavLinks = [
    { href: "/b2b-dashboard", label: "Dashboard" },
    { href: "/b2b-directory", label: "B2B Directory" },
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
    { href: "/b2b-directory", label: "B2B Directory" },
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
      case "B2B":
        return b2bNavLinks;
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
          ? "bg-[#0D1328]/95 backdrop-blur-md shadow-2xl border-b border-white/8"
          : "bg-[#0D1328]/70 backdrop-blur-sm border-b border-white/4"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-24 lg:h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 -ml-4 h-full">
            <AppImage
              src="/DCC-logo.png"
              alt="Discount Club Cayman Logo"
              className="h-full w-auto max-h-none object-fit scale-[2.4] lg:scale-[2.1] ml-15 mt-5 filter brightness-110"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-bold tracking-wide transition-all duration-300 relative group py-2 ${
                  isActive(link.href)
                    ? "text-[#D4A62A]"
                    : "text-[#B8C0D4] hover:text-[#D4A62A]"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4A62A] rounded-full shadow-[0_0_8px_#D4A62A]" />
                )}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4A62A] to-[#E0B53A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full" />
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Dynamic Real-time Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2.5 bg-[#111936] border border-white/8 hover:border-[#D4A62A]/40 text-[#B8C0D4] hover:text-[#D4A62A] rounded-full transition-all shadow-inner flex items-center justify-center cursor-pointer"
                  >
                    <Icon name="BellIcon" size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-black text-white ring-1 ring-[#0D1328] animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown list */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-[#0E1530] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-white/8 bg-[#121B3D]/50 flex items-center justify-between">
                        <span className="text-xs font-black text-white tracking-wide uppercase">Notifications</span>
                        <div className="flex items-center gap-3">
                          {unreadCount > 0 && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await notificationAPI.markAllAsRead();
                                  setUnreadCount(0);
                                  setNotifications((prev) =>
                                    prev.map((n) => ({ ...n, isRead: true }))
                                  );
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-xs font-bold text-[#D4A62A] hover:text-white transition-colors cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await notificationAPI.clearAll();
                                  setNotifications([]);
                                  setUnreadCount(0);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-xs font-bold text-rose-450 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              Clear all
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsNotifOpen(false);
                            }}
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                          >
                            <Icon name="XMarkIcon" size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-white/4">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Icon name="BellSlashIcon" size={24} className="mx-auto mb-2 opacity-30 text-[#B8C0D4]" />
                            <p className="text-xs font-medium">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={async () => {
                                if (!n.isRead) {
                                  try {
                                    await notificationAPI.markAsRead(n.id);
                                    setUnreadCount((c) => Math.max(0, c - 1));
                                    setNotifications((prev) =>
                                      prev.map((item) =>
                                        item.id === n.id ? { ...item, isRead: true } : item
                                      )
                                    );
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                              className={`p-4 transition-all duration-300 hover:bg-[#121B3D] cursor-pointer flex gap-3 relative group/notif ${
                                !n.isRead ? "bg-[#141E47]/30 border-l-2 border-[#D4A62A]" : ""
                              }`}
                            >
                              <div className="shrink-0 mt-0.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  n.type === "BOOKING" ? "bg-emerald-500/10 text-emerald-400" :
                                  n.type === "SYSTEM" ? "bg-rose-500/10 text-rose-400" :
                                  "bg-[#D4A62A]/10 text-[#D4A62A]"
                                }`}>
                                  <Icon name={
                                    n.type === "BOOKING" ? "TicketIcon" :
                                    n.type === "SYSTEM" ? "ExclamationTriangleIcon" :
                                    "InformationCircleIcon"
                                  } size={15} />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 pr-6">
                                <p className={`text-xs font-bold leading-tight ${n.isRead ? "text-slate-400" : "text-white"}`}>
                                  {n.title}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">
                                  {n.message}
                                </p>
                                <p className="text-[9px] text-slate-500 font-black tracking-wider uppercase mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {/* Individual Delete Button */}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await notificationAPI.delete(n.id);
                                    setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                                    if (!n.isRead) {
                                      setUnreadCount((c) => Math.max(0, c - 1));
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 border border-white/8 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-400 hover:text-rose-450 rounded-lg opacity-0 group-hover/notif:opacity-100 transition-all duration-200 cursor-pointer flex items-center justify-center"
                                title="Delete notification"
                              >
                                <Icon name="TrashIcon" size={13} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-[#111936] border border-white/8 rounded-full shadow-inner">
                  <div className="w-7 h-7 bg-[#D4A62A] text-[#0D1328] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#FFFFFF]">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-rose-400 border border-rose-500/20 rounded-full hover:bg-rose-500/10 hover:border-rose-500/40 transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#B8C0D4] hover:text-[#D4A62A] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/sign-up"
                  className="btn-premium-gold scale-95 py-2 px-6"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#B8C0D4] hover:text-[#D4A62A] focus:outline-none"
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
          <div className="lg:hidden py-4 border-t border-white/8 max-h-[calc(100vh-90px)] overflow-y-auto bg-[#0D1328]/95 backdrop-blur-lg">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-bold tracking-wide transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-[#0D1328] bg-gradient-to-r from-[#D4A62A] to-[#E0B53A] shadow-lg"
                      : "text-[#B8C0D4] hover:bg-[#111936] hover:text-[#D4A62A]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-4 pt-4 mt-2 border-t border-white/8">
                {currentUser ? (
                  <div className="px-2 flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#111936] border border-white/8 rounded-xl shadow-inner">
                      <div className="w-9 h-9 bg-[#D4A62A] text-[#0D1328] rounded-full flex items-center justify-center shrink-0 shadow-md">
                        <span className="text-sm font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-[#8D95A8] capitalize">
                          {currentUser.role?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 border border-rose-500/30 text-rose-400 rounded-xl text-base font-semibold hover:bg-rose-500/10 transition-all text-center cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-3 border border-white/10 text-white rounded-xl text-base font-semibold hover:border-[#D4A62A] hover:text-[#D4A62A] transition-all text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-6 py-3 bg-[#D4A62A] text-[#0D1328] rounded-xl text-base font-bold hover:bg-[#E0B53A] transition-all shadow-lg text-center"
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
