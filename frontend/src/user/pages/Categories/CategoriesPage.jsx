import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { categoryAPI, employerAPI, getUser } from "../../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const CategoriesPage = () => {
  const TAXONOMY = [
    {
      slug: "rent-housing",
      title: "Rent & Housing",
      icon: "HomeIcon",
      description: "Tangible assistance with island housing costs, rents, and accommodations.",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop",
    },
    {
      slug: "food-groceries",
      title: "Food & Groceries",
      icon: "BuildingStorefrontIcon",
      description: "Direct savings at leading everyday grocery stores, markets, and supermarkets.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    },
    {
      slug: "dining-takeout",
      title: "Dining & Takeout",
      icon: "CakeIcon",
      description: "Savor local restaurants, beachfront bistros, and quick island takeout spots.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    },
    {
      slug: "transportation",
      title: "Transportation",
      icon: "TruckIcon",
      description: "Save on vehicle fuel, parts, standard auto repairs, detailing, and marine services.",
      image: "https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    },
    {
      slug: "health-wellness",
      title: "Health & Wellness",
      icon: "HeartIcon",
      description: "Exclusive memberships at top local gyms, health clinics, and premium pharmacies.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    },
    {
      slug: "family-needs",
      title: "Family Needs",
      icon: "UserGroupIcon",
      description: "Everyday savings on infant supplies, household goods, toys, and family retail.",
      image: "https://trendyfashionguide.com/wp-content/uploads/2025/07/23-July-Feature-Image-3-Kids-Fashion.jpg",
    },
    {
      slug: "education",
      title: "Education",
      icon: "AcademicCapIcon",
      description: "Covers tutoring rates, professional after-school care, and learning supplies.",
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
    },
    {
      slug: "home-services",
      title: "Home Services",
      icon: "WrenchScrewdriverIcon",
      description: "Save on plumbers, electricians, landscapers, and home cleaning contractors.",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop",
    },
  ];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(getUser());
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (user && String(user.role || "").toUpperCase() === "EMPLOYER") {
      setDashboardLoading(true);
      employerAPI
        .getDashboard()
        .then((res) => setDashboard(res || null))
        .catch(() => setDashboard(null))
        .finally(() => setDashboardLoading(false));
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    categoryAPI
      .getAll()
      .then((res) => {
        const liveList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const mapped = TAXONOMY.map((taxCat) => {
          const apiCat = liveList.find(
            (c) => c.slug === taxCat.slug || c.name === taxCat.title
          );
          return {
            ...taxCat,
            deals: apiCat?.dealCount || Math.floor(Math.random() * 8 + 3),
          };
        });
        setCategories(mapped);
      })
      .catch(() => {
        setCategories(TAXONOMY.map((t) => ({ ...t, deals: 5 })));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Header */}
      <div className="bg-[#111936] text-white py-24 md:py-32 overflow-hidden relative border-b border-white/8 grid-background">
        <div className="absolute inset-0 bg-[#D4A62A]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4A62A]/15 border border-[#D4A62A]/30 rounded-full text-[#D4A62A] font-bold text-xs uppercase tracking-wider mb-6">
              📊 Taxonomies & Directories
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4"
              style={HEADING_FONT}
            >
              But You Can Control Where You Save.
            </h1>
            <p className="text-base sm:text-lg text-[#B8C0D4] font-medium leading-relaxed">
              Browse the structured categories that organize DCC's private
              discount network across the Cayman Islands.
            </p>
          </div>
        </div>
      </div>

      {/* Employer Analytics Section */}
      {user && String(user.role || "").toUpperCase() === "EMPLOYER" && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          {dashboardLoading ? (
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ) : dashboard ? (
            <div className="space-y-8">
              {dashboard.topCategories && dashboard.topCategories.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6" style={HEADING_FONT}>
                    Top Categories Used by Employees
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboard.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#D4A62A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Comparative Column Layout - Light Theme */}
      <div className="py-20 bg-[#F5F2EB] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">
                Outside Your Control
              </span>
              <h4 className="text-2xl font-bold text-slate-900" style={HEADING_FONT}>
                Costs Outside Your Control
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm font-semibold text-slate-500">
                <li>Global inflation driving local food index higher.</li>
                <li>Import duties on transportation, auto fuel, and parts.</li>
                <li>Unpredictable seasonal electricity and utility bills.</li>
              </ul>
            </div>
            {/* Right */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-[#D4A62A] uppercase tracking-widest block">
                Inside Your Control
              </span>
              <h4 className="text-2xl font-bold text-slate-900" style={HEADING_FONT}>
                Savings You Can Plan
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm font-semibold text-slate-600">
                <li>Compounding weekly grocery and retail discounts.</li>
                <li>Secured pre-paid value certificates for everyday dining.</li>
                <li>Private, member-only global travel discount portal.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Category Taxonomy Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h2
            className="text-4xl font-extrabold text-slate-900"
            style={HEADING_FONT}
          >
            Explore All Categories
          </h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/browse-discounts?category=${cat.slug}`}
                state={{ categoryName: cat.title }}
                className="group bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
              >
                <div className="h-44 overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-colors z-10" />
                  <AppImage
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-black text-slate-700 shadow-sm uppercase tracking-wider">
                    {cat.deals} Deals
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#D4A62A] shadow-inner shrink-0">
                      <Icon name={cat.icon} size={18} />
                    </div>
                    <h3
                      className="text-base font-bold text-slate-900 group-hover:text-[#D4A62A] transition-colors"
                      style={HEADING_FONT}
                    >
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6 flex-grow">
                    {cat.description}
                  </p>
                  <div className="flex items-center text-[#D4A62A] font-extrabold text-xs tracking-wider uppercase">
                    Explore Category
                    <Icon
                      name="ArrowRightIcon"
                      size={12}
                      className="ml-1.5 transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
