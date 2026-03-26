// Frontend/src/user/pages/AdminDashboard/AdminDashboardContent.jsx
// PREMIUM REDESIGN — Content only (sidebar lives in Admin.jsx/Sidebar.jsx)

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminAPI, analyticsAPI } from "../../../services/api";

/* ─── Tokens ───────────────────────────────────────────────────────────────── */
const BLUE = "#1C4D8D";
const BLUE_D = "#102D56";
const BLUE_L = "#EEF4FF";
const BLUE_M = "#DBEAFE";
const INK = "#0D1117";
const INK2 = "#3B4453";
const INK3 = "#8B95A3";
const BORDER = "#E8ECF2";
const SURFACE = "#F7F8FA";
const SUCCESS = "#059669";
const WARN = "#D97706";
const PURPLE = "#7C3AED";
const TEAL = "#0891B2";
const ROSE = "#BE123C";

const PIE_COLORS = [BLUE, "#4988C4", SUCCESS, WARN, PURPLE, ROSE, TEAL];

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n ?? 0);

const pct = (val) => {
  if (val == null) return null;
  return val >= 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`;
};

const QUICK_LINKS = [
  {
    label: "Members",
    sub: "View & manage",
    icon: "👥",
    to: "/admin/members",
    accent: BLUE,
    bg: BLUE_L,
  },
  {
    label: "Businesses",
    sub: "Approve & manage",
    icon: "🏪",
    to: "/admin/businesses",
    accent: SUCCESS,
    bg: "#ECFDF5",
  },
  {
    label: "Approvals",
    sub: "Pending actions",
    icon: "✅",
    to: "/admin/approvals",
    accent: WARN,
    bg: "#FFFBEB",
  },
  {
    label: "Analytics",
    sub: "Revenue & insights",
    icon: "📊",
    to: "/admin/analytics",
    accent: PURPLE,
    bg: "#F5F3FF",
  },
  {
    label: "Ads",
    sub: "Manage banners",
    icon: "📢",
    to: "/admin/banners",
    accent: TEAL,
    bg: "#ECFEFF",
  },
  {
    label: "Reports",
    sub: "Export CSV",
    icon: "📁",
    to: "/admin/finance",
    accent: ROSE,
    bg: "#FFF1F2",
  },
];

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .adc-root { font-family:'DM Sans',system-ui,sans-serif; color:${INK}; background:${SURFACE}; min-height:100%; }
  .adc-root * { box-sizing:border-box; }

  .adc-content { padding:clamp(24px,3vw,40px); max-width:1280px; }

  /* Stat cards */
  .adc-stat {
    background:#fff; border:1px solid ${BORDER}; border-radius:18px;
    padding:22px; position:relative; overflow:hidden;
    transition:box-shadow .22s,transform .22s,border-color .22s;
  }
  .adc-stat::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    border-radius:18px 18px 0 0; opacity:0; transition:opacity .22s;
  }
  .adc-stat:hover { box-shadow:0 12px 40px rgba(13,17,23,0.08); transform:translateY(-2px); border-color:#D0D8E8; }
  .adc-stat:hover::before { opacity:1; }
  .adc-stat.s-blue::before   { background:linear-gradient(90deg,${BLUE},#4988C4); }
  .adc-stat.s-green::before  { background:linear-gradient(90deg,${SUCCESS},#10B981); }
  .adc-stat.s-amber::before  { background:linear-gradient(90deg,${WARN},#F59E0B); }
  .adc-stat.s-purple::before { background:linear-gradient(90deg,${PURPLE},#A78BFA); }

  .adc-stat-icon {
    width:44px; height:44px; border-radius:12px; font-size:20px;
    display:flex; align-items:center; justify-content:center; margin-bottom:16px;
  }
  .adc-stat-val {
    font-family:'Playfair Display',serif;
    font-size:26px; font-weight:700; color:${INK}; line-height:1; letter-spacing:-0.02em; margin-bottom:5px;
  }
  .adc-stat-lbl { font-size:13px; font-weight:600; color:${INK2}; margin-bottom:2px; }
  .adc-stat-sub { font-size:12px; color:${INK3}; }

  /* Badges */
  .adc-badge { display:inline-flex;align-items:center; font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; }
  .adc-badge-up     { background:rgba(5,150,105,.09);  color:${SUCCESS}; border:1px solid rgba(5,150,105,.2); }
  .adc-badge-down   { background:rgba(220,38,38,.08);  color:#DC2626;    border:1px solid rgba(220,38,38,.18); }
  .adc-badge-warn   { background:rgba(217,119,6,.09);  color:${WARN};    border:1px solid rgba(217,119,6,.2); }
  .adc-badge-blue   { background:${BLUE_L}; color:${BLUE}; border:1px solid ${BLUE_M}; }
  .adc-badge-purple { background:#F5F3FF; color:${PURPLE}; border:1px solid rgba(124,58,237,.2); }

  /* Panel */
  .adc-panel { background:#fff; border:1px solid ${BORDER}; border-radius:18px; overflow:hidden; }
  .adc-panel-head {
    padding:18px 22px; border-bottom:1px solid ${BORDER};
    display:flex; align-items:center; justify-content:space-between;
  }
  .adc-panel-title {
    font-family:'Playfair Display',serif;
    font-size:15px; font-weight:700; color:${INK}; margin:0 0 2px;
  }
  .adc-panel-sub { font-size:12px; color:${INK3}; margin:0; }

  /* View link */
  .adc-vlink {
    font-size:12px; font-weight:700; color:${BLUE}; text-decoration:none;
    padding:6px 13px; border-radius:20px;
    background:${BLUE_L}; border:1px solid ${BLUE_M};
    transition:all .18s; display:inline-flex; align-items:center; gap:4px;
  }
  .adc-vlink:hover { background:${BLUE}; color:#fff; border-color:${BLUE}; }

  /* Impact */
  .adc-impact {
    border-radius:20px; padding:32px 36px; overflow:hidden; position:relative;
    background:linear-gradient(135deg,${BLUE_D} 0%,${BLUE} 55%,#2A6BC8 100%);
    box-shadow:0 8px 40px rgba(28,77,141,0.22);
  }
  .adc-impact::before {
    content:''; position:absolute; top:-40%; right:-8%;
    width:320px; height:320px; border-radius:50%;
    background:radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%);
    pointer-events:none;
  }

  /* Quick tiles */
  .adc-tile {
    background:#fff; border:1px solid ${BORDER}; border-radius:16px;
    padding:18px 14px; text-decoration:none;
    display:flex; flex-direction:column; align-items:center; text-align:center; gap:9px;
    transition:all .22s; position:relative; overflow:hidden;
  }
  .adc-tile::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; opacity:0; transition:opacity .22s; }
  .adc-tile:hover { box-shadow:0 10px 32px rgba(13,17,23,0.09); transform:translateY(-3px); border-color:#D0D8E8; }
  .adc-tile:hover::after { opacity:1; }

  /* List rows */
  .adc-row { display:flex; align-items:center; gap:12px; padding:12px 22px; transition:background .15s; }
  .adc-row:hover { background:${SURFACE}; }

  /* Skeleton */
  .adc-skel {
    background:linear-gradient(90deg,#f0f2f5 25%,#e6e9ed 50%,#f0f2f5 75%);
    background-size:200% 100%; animation:adc-shimmer 1.5s infinite; border-radius:12px;
  }

  /* Tooltip */
  .adc-tip { background:#fff; border:1px solid ${BORDER}; border-radius:12px; padding:10px 14px; font-family:'DM Sans',sans-serif; box-shadow:0 8px 32px rgba(13,17,23,.1); }

  /* Section */
  .adc-eyebrow { font-size:10px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:${INK3}; margin:0 0 4px; }
  .adc-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:${INK}; margin:0; letter-spacing:-.015em; }
  .adc-divider { height:1px; background:linear-gradient(90deg,${BORDER},${BORDER}44,transparent); margin:0 0 28px; }

  /* Pending banner */
  .adc-pending-btn {
    display:inline-flex; align-items:center; gap:9px;
    padding:10px 20px; border-radius:14px;
    background:linear-gradient(135deg,${WARN},#F59E0B);
    color:#fff; font-family:'DM Sans',sans-serif;
    font-size:13px; font-weight:700; text-decoration:none;
    box-shadow:0 4px 20px rgba(217,119,6,.32); border:none;
    transition:all .2s;
  }
  .adc-pending-btn:hover { box-shadow:0 8px 28px rgba(217,119,6,.45); transform:translateY(-1px); }

  /* Analytics breakdown pills */
  .adc-breakdown-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:20px; border:1px solid ${BORDER};
    background:#fff; font-size:12px; font-weight:600; color:${INK2};
    cursor:pointer; transition:all .18s;
  }
  .adc-breakdown-pill:hover { border-color:${BLUE}; color:${BLUE}; background:${BLUE_L}; }
  .adc-breakdown-pill.active { background:${BLUE}; color:#fff; border-color:${BLUE}; }

  @keyframes adc-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes adc-fadein  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .adc-fadein { animation:adc-fadein .4s ease both; }
`;

/* ─── Shared sub-components ────────────────────────────────────────────────── */
const Skel = ({ h = 140, style = {} }) => (
  <div className="adc-skel" style={{ height: h, ...style }} />
);

const ChartTip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="adc-tip" style={{ fontSize: 13 }}>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 11,
          color: INK3,
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <p
          key={i}
          style={{ margin: 0, fontWeight: 700, color: p.color || BLUE }}
        >
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, bg, cls, change }) => {
  const isUp = change && parseFloat(change) >= 0;
  return (
    <div className={`adc-stat adc-fadein ${cls}`}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="adc-stat-icon" style={{ background: bg }}>
          {icon}
        </div>
        {change != null && (
          <span
            className={`adc-badge ${isUp ? "adc-badge-up" : "adc-badge-down"}`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="adc-stat-val">{value}</p>
      <p className="adc-stat-lbl">{label}</p>
      {sub && <p className="adc-stat-sub">{sub}</p>}
    </div>
  );
};

/* ─── Deep analytics breakdown panel ──────────────────────────────────────── */
const BreakdownPanel = ({ memberDemo, loading }) => {
  const [activeBreakdown, setActiveBreakdown] = useState("type");

  const breakdowns = [
    {
      key: "type",
      label: "By Type",
      data: (memberDemo?.byType || []).filter((d) => d.value > 0),
    },
    {
      key: "district",
      label: "By District",
      data: (memberDemo?.byDistrict || [])
        .filter((d) => d.value > 0)
        .slice(0, 8),
    },
    { key: "month", label: "Monthly", data: memberDemo?.byMonth || [] },
  ];

  const current = breakdowns.find((b) => b.key === activeBreakdown);

  return (
    <div className="adc-panel">
      <div className="adc-panel-head">
        <div>
          <h3 className="adc-panel-title">Member Analytics</h3>
          <p className="adc-panel-sub">Deep membership breakdown</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {breakdowns.map((b) => (
            <button
              key={b.key}
              className={`adc-breakdown-pill${activeBreakdown === b.key ? " active" : ""}`}
              onClick={() => setActiveBreakdown(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 22px" }}>
        {loading ? (
          <Skel h={220} />
        ) : current.data.length === 0 ? (
          <div
            style={{
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: INK3,
              fontSize: 13,
            }}
          >
            No data yet
          </div>
        ) : activeBreakdown === "type" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              alignItems: "center",
            }}
          >
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={current.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {current.data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {current.data.map((d, i) => (
                <div
                  key={d.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: PIE_COLORS[i % PIE_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: INK2 }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeBreakdown === "district" ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={current.data}
              layout="vertical"
              margin={{ left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F0F2F5"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: INK3 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: INK2 }}
                axisLine={false}
                tickLine={false}
                width={88}
              />
              <Tooltip content={<ChartTip />} />
              <Bar
                dataKey="value"
                fill="#4988C4"
                radius={[0, 8, 8, 0]}
                name="Members"
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={current.data}>
              <defs>
                <linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.14} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: INK3 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: INK3 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={BLUE}
                strokeWidth={2.5}
                fill="url(#mgGrad)"
                name="Members"
                dot={{ fill: BLUE, r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

/* ─── Platform summary stats ───────────────────────────────────────────────── */
const PlatformSummary = ({ stats, timeSeries, loading }) => {
  const totalMembers = stats?.totalMembers ?? 0;
  const activeMembers = stats?.activeMembers ?? 0;
  const totalBusinesses = stats?.totalBusinesses ?? 0;
  const totalRevenue = timeSeries?.current?.saleAmount ?? 0;
  const totalSavings = stats?.totalSavings ?? 0;
  const totalTx = stats?.totalTransactions ?? 0;
  const revenueChange = pct(timeSeries?.changes?.saleAmount);
  const txChange = pct(timeSeries?.changes?.transactions);

  const cards = [
    {
      label: "Total Members",
      value: fmt(totalMembers),
      sub: `${activeMembers} active`,
      icon: "👥",
      bg: BLUE_L,
      cls: "s-blue",
    },
    {
      label: "Active Businesses",
      value: fmt(totalBusinesses),
      sub: "Approved listings",
      icon: "🏪",
      bg: "#ECFDF5",
      cls: "s-green",
    },
    {
      label: "Total Revenue",
      value: `$${fmt(totalRevenue)}`,
      sub: "This month",
      icon: "💰",
      bg: "#FFFBEB",
      cls: "s-amber",
      change: revenueChange,
    },
    {
      label: "Transactions",
      value: fmt(totalTx),
      sub: "This month",
      icon: "🔄",
      bg: "#F5F3FF",
      cls: "s-purple",
      change: txChange,
    },
    {
      label: "Total Savings",
      value: `$${fmt(totalSavings)}`,
      sub: "Delivered to members",
      icon: "🏷️",
      bg: "#ECFEFF",
      cls: "s-teal",
    },
    {
      label: "Active Rate",
      value:
        totalMembers > 0
          ? `${Math.round((activeMembers / totalMembers) * 100)}%`
          : "—",
      sub: "Members active",
      icon: "📈",
      bg: "#FFF1F2",
      cls: "s-rose",
    },
  ];

  if (loading)
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skel key={i} h={142} />
        ))}
      </div>
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
        gap: 14,
        marginBottom: 28,
      }}
    >
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const AdminDashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [memberDemo, setMemberDemo] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentBusinesses, setRecentBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [statsRes, tsRes, demoRes] = await Promise.allSettled([
        adminAPI.getStats(),
        analyticsAPI.getTimeSeries("month"),
        analyticsAPI.getMembershipAnalytics({}),
      ]);
      if (statsRes.status === "fulfilled") {
        const s = statsRes.value;
        setStats(s);
        if (Array.isArray(s?.recentMembers)) setRecentMembers(s.recentMembers);
        if (Array.isArray(s?.recentBusinesses))
          setRecentBusinesses(s.recentBusinesses);
        if (s?.totalPending !== undefined) setPendingCount(s.totalPending);
      }
      if (tsRes.status === "fulfilled") setTimeSeries(tsRes.value);
      if (demoRes.status === "fulfilled") setMemberDemo(demoRes.value);
    } catch (e) {
      console.error("Admin dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const totalMembers = stats?.totalMembers ?? 0;
  const totalBusinesses = stats?.totalBusinesses ?? 0;
  const totalSavings = stats?.totalSavings ?? 0;
  const totalTx = stats?.totalTransactions ?? 0;
  const revenueChange = pct(timeSeries?.changes?.saleAmount);

  const trendData = timeSeries
    ? [
        { period: "Previous", revenue: timeSeries.previous?.saleAmount ?? 0 },
        { period: "Current", revenue: timeSeries.current?.saleAmount ?? 0 },
      ]
    : [];

  return (
    <div className="adc-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="adc-content">
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div
          style={{
            marginBottom: 28,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div className="adc-fadein">
            <p
              style={{
                margin: "0 0 5px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: BLUE,
              }}
            >
              Admin Console
            </p>
            <h1
              style={{
                margin: "0 0 4px",
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(1.8rem,3vw,2.3rem)",
                fontWeight: 800,
                color: INK,
                letterSpacing: "-0.03em",
              }}
            >
              Platform Overview
            </h1>
            <p
              style={{ margin: 0, fontSize: 13, color: INK3, fontWeight: 500 }}
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {pendingCount > 0 && (
            <Link to="/admin/approvals" className="adc-pending-btn">
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {pendingCount}
              </span>
              Pending Approvals
            </Link>
          )}
        </div>

        <div className="adc-divider" />

        {/* ── Platform Stat Cards ──────────────────────────────────────── */}
        <PlatformSummary
          stats={stats}
          timeSeries={timeSeries}
          loading={loading}
        />

        {/* ── Impact Banner ────────────────────────────────────────────── */}
        <div className="adc-impact" style={{ marginBottom: 32 }}>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Platform Impact
              </p>
              <p
                style={{
                  margin: "0 0 4px",
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(2rem,4vw,2.8rem)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                ${fmt(totalSavings)}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  fontWeight: 500,
                }}
              >
                Total savings delivered to members
              </p>
            </div>
            <div style={{ display: "flex", gap: 0 }}>
              {[
                { label: "Members", value: fmt(totalMembers) },
                { label: "Businesses", value: fmt(totalBusinesses) },
                { label: "Transactions", value: fmt(totalTx) },
              ].map(({ label, value }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && (
                    <div
                      style={{
                        width: 1,
                        background: "rgba(255,255,255,0.15)",
                        margin: "0 28px",
                      }}
                    />
                  )}
                  <div style={{ textAlign: "center" }}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "clamp(1.5rem,2.5vw,2rem)",
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {value}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                        color: "rgba(255,255,255,0.55)",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Access ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <p className="adc-eyebrow">Navigation</p>
            <h2 className="adc-title">Quick Access</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
              gap: 12,
            }}
          >
            {QUICK_LINKS.map(({ label, sub, icon, to, accent, bg }) => (
              <Link
                key={label}
                to={to}
                className="adc-tile"
                style={{ ["--tile-accent"]: accent }}
              >
                <style>{`.adc-tile[style*="${accent}"]::after { background:${accent}; }`}</style>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    border: `1px solid ${accent}22`,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: INK,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: INK3,
                      lineHeight: 1.3,
                    }}
                  >
                    {sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="adc-divider" />

        {/* ── Charts Row 1: Revenue + Member Breakdown ──────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,3fr) minmax(0,2fr)",
            gap: 18,
            marginBottom: 20,
          }}
        >
          {/* Revenue */}
          <div className="adc-panel">
            <div className="adc-panel-head">
              <div>
                <h3 className="adc-panel-title">Revenue Comparison</h3>
                <p className="adc-panel-sub">Current vs previous period</p>
              </div>
              {revenueChange && (
                <span
                  className={`adc-badge ${parseFloat(revenueChange) >= 0 ? "adc-badge-up" : "adc-badge-down"}`}
                >
                  {revenueChange}
                </span>
              )}
            </div>
            <div style={{ padding: "20px 22px" }}>
              {loading ? (
                <Skel h={210} />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={trendData} barGap={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 12, fill: INK3, fontFamily: "DM Sans" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: INK3, fontFamily: "DM Sans" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${fmt(v)}`}
                    />
                    <Tooltip content={<ChartTip prefix="$" />} />
                    <Bar
                      dataKey="revenue"
                      fill={BLUE}
                      radius={[10, 10, 0, 0]}
                      name="Revenue"
                      maxBarSize={80}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 210,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: INK3,
                    fontSize: 13,
                  }}
                >
                  No revenue data yet
                </div>
              )}
            </div>
          </div>

          {/* Member analytics breakdown */}
          <BreakdownPanel memberDemo={memberDemo} loading={loading} />
        </div>

        <div className="adc-divider" />

        {/* ── Recent Activity ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <p className="adc-eyebrow">Platform Activity</p>
          <h2 className="adc-title">Recent Registrations</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginBottom: 48,
          }}
        >
          {/* Recent Members */}
          <div className="adc-panel">
            <div className="adc-panel-head">
              <div>
                <h3 className="adc-panel-title">Recent Members</h3>
                <p className="adc-panel-sub">Latest registrations</p>
              </div>
              <Link to="/admin/members" className="adc-vlink">
                View all →
              </Link>
            </div>
            {loading ? (
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[1, 2, 3].map((i) => (
                  <Skel key={i} h={52} />
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div
                style={{
                  padding: "44px 22px",
                  textAlign: "center",
                  color: INK3,
                  fontSize: 13,
                }}
              >
                No members yet
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {recentMembers.slice(0, 5).map((m, i) => (
                  <li
                    key={m.id || i}
                    className="adc-row"
                    style={{
                      borderBottom:
                        i < Math.min(recentMembers.length, 5) - 1
                          ? `1px solid ${BORDER}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        flexShrink: 0,
                        background: BLUE_L,
                        color: BLUE,
                        border: `1px solid ${BLUE_M}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        fontFamily: "'Playfair Display',serif",
                      }}
                    >
                      {(m.firstName || m.user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 700,
                          color: INK,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.firstName || "—"} {m.lastName || ""}
                      </p>
                      <p
                        style={{
                          margin: "1px 0 0",
                          fontSize: 11,
                          color: INK3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.user?.email || "—"}
                      </p>
                    </div>
                    <span
                      className={`adc-badge ${m.membership?.status === "ACTIVE" ? "adc-badge-up" : "adc-badge-warn"}`}
                    >
                      {m.membership?.status ?? "PENDING"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Businesses */}
          <div className="adc-panel">
            <div className="adc-panel-head">
              <div>
                <h3 className="adc-panel-title">Recent Businesses</h3>
                <p className="adc-panel-sub">Latest listings</p>
              </div>
              <Link to="/admin/businesses" className="adc-vlink">
                View all →
              </Link>
            </div>
            {loading ? (
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[1, 2, 3].map((i) => (
                  <Skel key={i} h={52} />
                ))}
              </div>
            ) : recentBusinesses.length === 0 ? (
              <div
                style={{
                  padding: "44px 22px",
                  textAlign: "center",
                  color: INK3,
                  fontSize: 13,
                }}
              >
                No businesses yet
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {recentBusinesses.slice(0, 5).map((b, i) => (
                  <li
                    key={b.id || i}
                    className="adc-row"
                    style={{
                      borderBottom:
                        i < Math.min(recentBusinesses.length, 5) - 1
                          ? `1px solid ${BORDER}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        flexShrink: 0,
                        background: "#ECFDF5",
                        color: SUCCESS,
                        overflow: "hidden",
                        border: "1px solid rgba(5,150,105,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        fontFamily: "'Playfair Display',serif",
                      }}
                    >
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        (b.name || "B")[0].toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 700,
                          color: INK,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.name || "—"}
                      </p>
                      <p
                        style={{
                          margin: "1px 0 0",
                          fontSize: 11,
                          color: INK3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.category?.name || "—"} ·{" "}
                        {b.district || "Cayman Islands"}
                      </p>
                    </div>
                    <span
                      className={`adc-badge ${b.status === "APPROVED" ? "adc-badge-up" : "adc-badge-warn"}`}
                    >
                      {b.status ?? "PENDING"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
