import React from "react";

const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-12 w-auto object-contain"
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">Admin Panel</p>
          <p className="text-xs text-slate-500">Discount Club Cayman</p>
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
