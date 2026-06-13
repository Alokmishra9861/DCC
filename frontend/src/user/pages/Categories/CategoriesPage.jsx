import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { employerAPI, getUser, businessAPI } from "../../../services/api";

const STOREFRONT_FALLBACK = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231C4D8D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E";
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

const CATEGORIES = [
  {
    name: "Automotive & Marine",
    slug: "automotive-marine",
    icon: "TruckIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop",
    description:
      "Find the best deals on vehicle maintenance, parts, detailing, and marine services.",
  },
  {
    name: "B2B Members",
    slug: "b2b",
    icon: "BriefcaseIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    description:
      "Exclusive business-to-business services, wholesale opportunities, and corporate solutions.",
  },
  {
    name: "Beauty Salon & Barber Shop",
    slug: "beauty",
    icon: "SparklesIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop",
    description:
      "Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.",
  },
  {
    name: "Construction",
    slug: "construction",
    icon: "WrenchScrewdriverIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop",
    description:
      "Save on building materials, contractors, renovation services, and heavy equipment.",
  },
  {
    name: "Electronics & Office Supplies",
    slug: "electronics",
    icon: "ComputerDesktopIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
    description:
      "Upgrade your tech and stock up on essential office supplies and furniture for less.",
  },
  {
    name: "Recreational",
    slug: "fashion",
    icon: "ShoppingBagIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    description:
      "Stay stylish with offers on apparel, accessories, footwear, and jewelry.",
  },
  {
    name: "Food & Beverage",
    slug: "food",
    icon: "CakeIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    description:
      "Delicious dining experiences, cafes, and beverage deals across the island.",
  },
  {
    name: "Health & Fitness",
    slug: "health",
    icon: "HeartIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    description:
      "Gym memberships, wellness centers, healthcare savings, and pharmacy deals.",
  },
  {
    name: "Home & Garden",
    slug: "home",
    icon: "HomeIcon",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    description:
      "Furniture, decor, gardening supplies, and home improvement services.",
  },
  {
    name: "Kids & Fashion",
    slug: "kids",
    icon: "FaceSmileIcon",
    imageUrl:
      "https://trendyfashionguide.com/wp-content/uploads/2025/07/23-July-Feature-Image-3-Kids-Fashion.jpg",
    description:
      "Fun activities, toys, educational resources, and entertainment for children.",
  },
  {
    name: "Retail",
    slug: "retail",
    icon: "TagIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    description:
      "General retail shopping for gifts, hobbies, pets, and everyday items.",
  },
];

const CategoriesPage = () => {
  const [businesses, setBusinesses] = useState([]);
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
    businessAPI
      .getAll({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.businesses)
            ? res.businesses
            : Array.isArray(res?.data)
              ? res.data
              : [];
        setBusinesses(list);
      })
      .catch((err) => {
        console.error("Error loading businesses:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getBusinessCategorySlug = (b) => {
    if (!b) return "";
    if (typeof b.category === "object" && b.category !== null) {
      return b.category.slug || "";
    }
    if (b.categorySlug) return b.categorySlug;
    if (typeof b.category === "string") return b.category;
    return "";
  };

  const availableCategories = CATEGORIES.filter((cat) => {
    return businesses.some(
      (b) => getBusinessCategorySlug(b).toLowerCase() === cat.slug.toLowerCase()
    );
  });

  const getBusinessCountByCategory = (slug) => {
    return businesses.filter(
      (b) => getBusinessCategorySlug(b).toLowerCase() === slug.toLowerCase()
    ).length;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">

      {/* Hero Header */}
      <div className="bg-[#111936] text-white py-20 md:py-24 overflow-hidden relative border-b border-white/8">
        <div className="absolute inset-0 bg-[#D4A62A]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D4A62A]/15 border border-[#D4A62A]/30 rounded-full text-[#D4A62A] font-bold text-xs uppercase tracking-wider mb-6">
              🏪 Partner Network Directory
            </span>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4"
              style={HEADING_FONT}
            >
              Control Where You Save.
            </h1>
            <p className="text-base sm:text-lg text-[#B8C0D4] font-medium leading-relaxed">
              Explore the verified local businesses that power DCC's exclusive private discount ecosystem across the Cayman Islands.
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

      {/* ── Categories Grid Section ── */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-b border-slate-200/60">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900" style={HEADING_FONT}>
            Browse By Category
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Click a category card below to view active local businesses and discount offers available in that category.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCategories.map((cat) => {
              const count = getBusinessCountByCategory(cat.slug);

              return (
                <Link
                  key={cat.slug}
                  to={`/categoriespage/${cat.slug}`}
                  className="group relative h-52 rounded-[2rem] overflow-hidden border-2 border-slate-100/60 hover:border-[#D4A62A]/40 shadow-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-slate-900">
                    <AppImage
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 text-[#D4A62A] rounded-2xl flex items-center justify-center">
                    <Icon name={cat.icon} size={20} />
                  </div>
                  <div className="absolute inset-x-6 bottom-6 text-white flex flex-col justify-end">
                    <span className="px-2.5 py-1 bg-[#D4A62A] text-[#111936] font-black text-[9px] tracking-wider uppercase rounded-md self-start mb-2 shadow">
                      {count} {count === 1 ? "Partner" : "Partners"}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight mb-1" style={HEADING_FONT}>
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-[11px] font-semibold line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Featured Businesses Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h2
            className="text-3xl font-extrabold text-slate-900"
            style={HEADING_FONT}
          >
            All Partner Businesses
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Click on any partner store to view their exclusive discounts, active campaigns, and available prepaid value certificates.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <Icon name="BuildingStorefrontIcon" size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-base">No businesses found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {businesses.map((business) => {
              const categoryLabel = business.category?.name || business.category?.slug || business.category || "Premium Partner";
              return (
                <Link
                  key={business.id || business._id}
                  to={`/business-profile/${business.id || business._id}`}
                  className="group bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-[2rem] p-6 flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1 shadow-inner group-hover:border-[#D4A62A]/40 transition-all duration-300">
                    {business.logoUrl ? (
                      <AppImage
                        src={business.logoUrl}
                        alt={business.name}
                        fallbackSrc={STOREFRONT_FALLBACK}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <Icon
                        name="BuildingStorefrontIcon"
                        size={28}
                        className="text-slate-400 group-hover:text-[#D4A62A] transition-colors"
                      />
                    )}
                  </div>
                  <h3
                    className="text-base font-extrabold text-slate-800 group-hover:text-[#1C4D8D] transition-colors line-clamp-1 w-full"
                    style={HEADING_FONT}
                  >
                    {business.name}
                  </h3>
                  <p className="text-xs font-bold text-[#D4A62A] uppercase tracking-wider mt-1.5 truncate w-full">
                    {categoryLabel}
                  </p>
                  <span className="mt-5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black tracking-widest uppercase text-slate-500 border border-slate-200/40 truncate w-full">
                    {business.district || "Cayman Islands"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CategoriesPage;
