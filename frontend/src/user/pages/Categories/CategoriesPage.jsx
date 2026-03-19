// Frontend/src/user/pages/Shopping/Categories.jsx
// CHANGES FROM ORIGINAL (minimal — design kept identical):
//   1. Fetches /api/categories to get LIVE deal counts → merges into static list
//   2. Link changed from /categoriespage/:slug → /browse-discounts?category=slug
//   3. Shows loading skeleton while fetching
//   Everything else (layout, images, icons, descriptions) is IDENTICAL.
//   4. ADDED: Employer analytics view showing savings by category, usage, and top categories

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
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const CategoriesPage = () => {
  // Static fallback with 0 deals - actual counts come from API
  const STATIC_CATEGORY_FALLBACK = [
    {
      slug: "automotive-marine",
      title: "Automotive & Marine",
      icon: "TruckIcon",
      deals: 0, // NO hardcoded deals - API will provide real count
      image:
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop",
      description:
        "Find the best deals on vehicle maintenance, parts, detailing, and marine services.",
    },
    {
      slug: "b2b",
      title: "B2B Members",
      icon: "BriefcaseIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
      description:
        "Exclusive business-to-business services, wholesale opportunities, and corporate solutions.",
    },
    {
      slug: "beauty",
      title: "Beauty Salon & Barber Shop",
      icon: "SparklesIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop",
      description:
        "Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.",
    },
    {
      slug: "construction",
      title: "Construction",
      icon: "WrenchScrewdriverIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop",
      description:
        "Save on building materials, contractors, renovation services, and heavy equipment.",
    },
    {
      slug: "electronics",
      title: "Electronics & Office Supplies",
      icon: "ComputerDesktopIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
      description:
        "Upgrade your tech and stock up on essential office supplies and furniture for less.",
    },
    {
      slug: "fashion",
      title: "Recreational",
      icon: "ShoppingBagIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      description:
        "Stay stylish with offers on apparel, accessories, footwear, and jewelry.",
    },
    {
      slug: "food",
      title: "Food & Beverage",
      icon: "CakeIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
      description:
        "Delicious dining experiences, cafes, and beverage deals across the island.",
    },
    {
      slug: "health",
      title: "Health & Fitness",
      icon: "HeartIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
      description:
        "Gym memberships, wellness centers, healthcare savings, and pharmacy deals.",
    },
    {
      slug: "home",
      title: "Home & Garden",
      icon: "HomeIcon",
      deals: 0,
      image:
        "https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop",
      description:
        "Furniture, decor, gardening supplies, and home improvement services.",
    },
    {
      slug: "kids",
      title: "Kids & Fashion",
      icon: "FaceSmileIcon",
      deals: 0,
      image:
        "https://trendyfashionguide.com/wp-content/uploads/2025/07/23-July-Feature-Image-3-Kids-Fashion.jpg",
      description:
        "Fun activities, toys, educational resources, and entertainment for children.",
    },
    {
      slug: "retail",
      title: "Retail",
      icon: "TagIcon",
      deals: 0,
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      description:
        "General retail shopping for gifts, hobbies, pets, and everyday items.",
    },
  ];

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(getUser());
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Fetch employer dashboard data if user is an employer
  useEffect(() => {
    if (user && String(user.role || "").toUpperCase() === "EMPLOYER") {
      setDashboardLoading(true);
      employerAPI
        .getDashboard()
        .then((res) => {
          setDashboard(res || null);
        })
        .catch((err) => {
          console.error("Failed to load employer dashboard:", err);
          setDashboard(null);
        })
        .finally(() => {
          setDashboardLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    categoryAPI
      .getAll()
      .then((res) => {
        // Extract the categories list from API response
        const liveList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        // If API returns data, use it (real data from backend)
        if (liveList && liveList.length > 0) {
          const mappedCategories = liveList.map((apiCat) => {
            // Find matching fallback for icon/image if API doesn't provide them
            const fallback = STATIC_CATEGORY_FALLBACK.find(
              (s) => s.slug === apiCat.slug,
            );

            return {
              slug: apiCat.slug,
              title: apiCat.name,
              icon: apiCat.icon || fallback?.icon || "TagIcon",
              deals: apiCat.dealCount || 0, // ← LIVE DEAL COUNT FROM API
              image: apiCat.imageUrl || fallback?.image,
              description: apiCat.description || fallback?.description || "",
              id: apiCat.id,
            };
          });

          setCategories(mappedCategories);
        } else {
          // If API returns empty, use fallback with 0 deals
          setCategories(STATIC_CATEGORY_FALLBACK);
        }
        setLoading(false);
      })
      .catch((err) => {
        // API failed — use fallback
        console.error("Failed to load categories:", err);
        setCategories(STATIC_CATEGORY_FALLBACK);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — show different content for employers */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          {user && String(user.role || "").toUpperCase() === "EMPLOYER" ? (
            <>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                Category Analytics
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                View your employees' savings and activity by category. Analyze
                engagement patterns and ROI by offering category.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                Browse Categories
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                Find exactly what you're looking for. Explore our diverse range
                of discount categories.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Show employer analytics if user is an employer */}
        {user && String(user.role || "").toUpperCase() === "EMPLOYER" && (
          <div className="mb-16 space-y-8">
            {dashboardLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
                ))}
              </div>
            ) : dashboard ? (
              <>
                {/* Top categories by usage */}
                {dashboard.topCategories &&
                  dashboard.topCategories.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                          Top Categories Used by Employees
                        </h2>
                        <p className="text-sm text-slate-400 mt-2">
                          Redemption count by category
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboard.topCategories}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="category"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "none",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#1C4D8D"
                            radius={[6, 6, 0, 0]}
                            name="Redemptions"
                            maxBarSize={60}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                {/* ROI by category analytics cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Total Employee Savings
                    </p>
                    <p className="text-3xl font-black text-emerald-600">
                      ${Number(dashboard.roi?.totalSavings || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 mt-3">
                      Across all categories
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Overall ROI
                    </p>
                    <p className="text-3xl font-black text-[#1C4D8D]">
                      {dashboard.roi?.roiPercent || 0}%
                    </p>
                    <p className="text-xs text-slate-400 mt-3">
                      Return on membership investment
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Avg Savings/Employee
                    </p>
                    <p className="text-3xl font-black text-violet-600">
                      $
                      {Number(
                        dashboard.roi?.avgSavingsPerEmployee || 0,
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400 mt-3">
                      Per active employee
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <Icon
                  name="ChartBarIcon"
                  size={48}
                  className="mx-auto text-slate-300 mb-4"
                />
                <p className="font-semibold text-slate-500">
                  No analytics data yet
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Purchase seats and add employees to see category analytics.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categories Section Heading */}
        <div className="mt-20 mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            {user && String(user.role || "").toUpperCase() === "EMPLOYER"
              ? "Explore Categories"
              : "All Categories"}
          </h2>
          <p className="text-slate-600 max-w-2xl">
            {user && String(user.role || "").toUpperCase() === "EMPLOYER"
              ? "Click on any category to see available discounts and benefits for your employees."
              : "Browse all available discount categories"}
          </p>
        </div>

        {loading ? (
          // Skeleton loader — same grid layout as the cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {STATIC_CATEGORY_FALLBACK.map((cat) => (
              <div
                key={cat.slug}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-80 animate-pulse"
              >
                <div className="h-48 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              // ── FIXED: was /categoriespage/:slug → now /browse-discounts?category=slug ──
              // This navigates to BrowseDiscounts with the category pre-selected,
              // which is correct per spec: categories group offers → clicking shows
              // filtered businesses/offers in that category.
              <Link
                key={cat.slug}
                to={`/browse-discounts?category=${cat.slug}`}
                state={{ categoryName: cat.title }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors z-10" />
                  <AppImage
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Deal count badge — shows live count when available */}
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                    {cat.deals} Deals
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1C4D8D]">
                      <Icon name={cat.icon} size={20} />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1C4D8D] transition-colors">
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                    {cat.description}
                  </p>
                  <div className="flex items-center text-[#1C4D8D] font-semibold text-sm">
                    Explore Category
                    <Icon
                      name="ArrowRightIcon"
                      size={16}
                      className="ml-2 transition-transform group-hover:translate-x-1"
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
