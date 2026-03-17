import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Icon from "../../../user/components/ui/AppIcon";
import { getUser, removeToken, removeUser } from "../../../services/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const displayName = currentUser?.name || "Admin User";
  const displayEmail = currentUser?.email || "admin@dcc.ky";
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "HomeIcon" },
    { path: "/admin/approvals", label: "Approvals", icon: "CheckBadgeIcon" },
    { path: "/admin/members", label: "Members", icon: "UsersIcon" },
    {
      path: "/admin/businesses",
      label: "Businesses",
      icon: "BuildingStorefrontIcon",
    },
    { path: "/admin/analytics", label: "Analytics", icon: "ChartBarIcon" },
    { path: "/admin/finance", label: "Finance", icon: "CurrencyDollarIcon" },
    { path: "/admin/settings", label: "Settings", icon: "Cog6ToothIcon" },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex-col h-[calc(100vh-64px)] sticky top-16 hidden lg:flex shadow-sm">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="mb-6 px-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Main Menu
          </p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={item.icon}
                    size={22}
                    className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                    variant={isActive ? "solid" : "outline"}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
          </div>
        </div>
        <button
          onClick={() => {
            removeToken();
            removeUser();
            navigate("/login");
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 w-full transition-colors group"
        >
          <Icon
            name="ArrowRightOnRectangleIcon"
            size={22}
            className="text-slate-400 group-hover:text-red-500 transition-colors"
          />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
