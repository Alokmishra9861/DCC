// Frontend/src/admin/component/sidebar/Sidebar.jsx
// PREMIUM REDESIGN — Playfair Display + DM Sans, rich nav system

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser, removeToken, removeUser } from "../../../../src/services/api";

const BLUE = "#1C4D8D";
const BLUE_L = "#EEF4FF";
const BLUE_M = "#DBEAFE";
const INK = "#0D1117";
const INK2 = "#3B4453";
const INK3 = "#8B95A3";
const BORDER = "#E8ECF2";
const SURFACE = "#F7F8FA";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .sb-root { font-family:'DM Sans',system-ui,sans-serif; }
  .sb-root * { box-sizing:border-box; }

  .sb-wrap {
    width:260px; flex-shrink:0;
    background:#fff; border-right:1px solid ${BORDER};
    height:calc(100vh - 64px); position:sticky; top:64px;
    display:flex; flex-direction:column; overflow:hidden;
    box-shadow:1px 0 20px rgba(13,17,23,0.04);
    max-height:calc(100vh - 64px);
  }

  @media (max-width:768px) {
    .sb-wrap {
      position:fixed; width:260px; height:calc(100vh - 64px); top:64px; left:0;
      z-index:999; transition:transform 0.3s ease; transform:translateX(-100%);
    }
    .sb-wrap.sb-open { transform:translateX(0); }
    .sb-overlay {
      display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5);
      z-index:998; top:64px; animation:sb-fade-in 0.3s ease;
    }
    .sb-overlay.sb-open { display:block; }
  }

  @media (min-width:769px) {
    .sb-overlay { display:none !important; }
    .sb-wrap { transform:translateX(0) !important; }
  }

  .sb-brand {
    padding:20px 18px 16px;
    border-bottom:1px solid ${BORDER};
    display:flex; align-items:center; gap:11px;
    flex-shrink:0;
  }
  .sb-brand-mark {
    width:38px; height:38px; border-radius:11px; flex-shrink:0;
    background:linear-gradient(135deg,${BLUE} 0%,#2A6BC8 100%);
    display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif;
    font-size:17px; font-weight:700; color:#fff;
    box-shadow:0 4px 14px rgba(28,77,141,0.3);
  }
  .sb-brand-name {
    font-family:'Playfair Display',serif;
    font-size:14px; font-weight:700; color:${INK}; line-height:1.2;
  }
  .sb-brand-sub { font-size:11px; color:${INK3}; margin-top:1px; }

  .sb-nav { flex:1; overflow-y:auto; padding:14px 10px; min-height:0; }
  .sb-nav::-webkit-scrollbar { width:0; }

  .sb-nav-section-label {
    font-size:9px; font-weight:800; letter-spacing:0.18em;
    text-transform:uppercase; color:${INK3};
    padding:0 10px; margin:0 0 6px;
  }

  .sb-link {
    display:flex; align-items:center; gap:9px;
    padding:10px 12px; border-radius:12px; border:1px solid transparent;
    font-size:13px; font-weight:600; color:${INK2};
    text-decoration:none; margin-bottom:2px;
    transition:all 0.18s; position:relative;
  }
  .sb-link:hover { background:${SURFACE}; color:${INK}; border-color:${BORDER}; }
  .sb-link.active-link {
    background:${BLUE_L}; color:${BLUE};
    border-color:${BLUE_M}; font-weight:700;
  }
  .sb-link-icon {
    width:32px; height:32px; border-radius:9px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:15px; background:${SURFACE}; transition:background 0.18s;
  }
  .sb-link.active-link .sb-link-icon { background:${BLUE_M}; }
  .sb-link-label { flex:1; }
  .sb-link-dot {
    width:7px; height:7px; border-radius:50%;
    background:#D97706; box-shadow:0 0 0 2px rgba(217,119,6,0.2);
    animation:adm-pulse 2s infinite;
  }
  .sb-active-dot {
    width:6px; height:6px; border-radius:50%; background:${BLUE};
  }

  .sb-footer {
    padding:14px 16px; border-top:1px solid ${BORDER};
    flex-shrink:0;
  }
  .sb-user-card {
    background:${SURFACE}; border:1px solid ${BORDER};
    border-radius:13px; padding:11px 13px;
    display:flex; align-items:center; gap:10px; margin-bottom:8px;
  }
  .sb-user-ava {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,${BLUE},#2A6BC8);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-weight:700; font-size:13px;
    font-family:'Playfair Display',serif;
    box-shadow:0 2px 8px rgba(28,77,141,0.25);
  }
  .sb-user-name { font-size:13px; font-weight:700; color:${INK}; }
  .sb-user-email { font-size:11px; color:${INK3}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .sb-logout {
    display:flex; align-items:center; gap:9px;
    padding:9px 12px; border-radius:11px;
    font-size:13px; font-weight:600; color:${INK3};
    background:transparent; border:none; width:100%;
    cursor:pointer; transition:all 0.18s; font-family:'DM Sans',sans-serif;
  }
  .sb-logout:hover { background:rgba(220,38,38,0.06); color:#DC2626; }
  .sb-logout-icon { font-size:16px; }

  @keyframes adm-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes sb-fade-in { from{opacity:0} to{opacity:1} }
`;

const NAV = [
  { path: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { path: "/admin/approvals", label: "Approvals", icon: "✅", hasDot: true },
  { path: "/admin/banners", label: "Banner Ads", icon: "📢" },
  { path: "/admin/members", label: "Members", icon: "👥" },
  { path: "/admin/businesses", label: "Businesses", icon: "🏪" },
  { path: "/admin/analytics", label: "Analytics", icon: "📊" },
  { path: "/admin/finance", label: "Finance", icon: "💰" },
  { path: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const Sidebar = ({ pendingCount = 0, isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const user = getUser();
  const name = user?.name || "Admin User";
  const email = user?.email || "admin@dcc.ky";
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate("/login");
  };

  const handleNavClick = () => {
    onClose();
  };

  return (
    <aside className="sb-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Mobile Overlay */}
      <div
        className={`sb-overlay${isOpen ? " sb-open" : ""}`}
        onClick={onClose}
      />

      <div className={`sb-wrap${isOpen ? " sb-open" : ""}`}>
        {/* Brand */}
        <div className="sb-brand">
          <div className="sb-brand-mark">D</div>
          <div>
            <div className="sb-brand-name">Admin Panel</div>
            <div className="sb-brand-sub">Discount Club Cayman</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <p className="sb-nav-section-label">Main Menu</p>
          {NAV.map(({ path, label, icon, exact, hasDot }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `sb-link${isActive ? " active-link" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="sb-link-icon">{icon}</div>
                  <span className="sb-link-label">{label}</span>
                  {hasDot && pendingCount > 0 && (
                    <div className="sb-link-dot" />
                  )}
                  {isActive && <div className="sb-active-dot" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user-card">
            <div className="sb-user-ava">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-user-name">{name}</div>
              <div className="sb-user-email">{email}</div>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout}>
            <span className="sb-logout-icon">→</span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
