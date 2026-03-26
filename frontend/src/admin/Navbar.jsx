import React from "react";

const Navbar = ({ onMenuClick }) => {
  return (
    <div
      className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 justify-between sticky top-0 z-50 shadow-sm"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Mobile Only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <img
          src="/logo.png"
          alt="Logo"
          className="h-10 md:h-12 w-auto object-contain"
        />
        <div className="hidden sm:block">
          <p className="text-xs md:text-sm font-semibold text-slate-900">
            Admin Panel
          </p>
          <p className="text-[10px] md:text-xs text-slate-500">
            Discount Club Cayman
          </p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
        <span className="px-2 py-1 rounded-full bg-slate-100">Secure</span>
        <span>v1</span>
      </div>
    </div>
  );
};

export default Navbar;
