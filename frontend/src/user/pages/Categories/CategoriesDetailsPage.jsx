import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import AppImage from "../../components/ui/AppImage";
import { businessAPI } from "../../../services/api";

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

const CategoriesDetailsPage = () => {
  const { category } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  const currentCategory = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === category.toLowerCase()
  );

  if (!currentCategory) {
    return <Navigate to="/categories" replace />;
  }

  const getBusinessCategorySlug = (b) => {
    if (!b) return "";
    if (typeof b.category === "object" && b.category !== null) {
      return b.category.slug || "";
    }
    if (b.categorySlug) return b.categorySlug;
    if (typeof b.category === "string") return b.category;
    return "";
  };

  const filteredBusinesses = businesses.filter(
    (b) => getBusinessCategorySlug(b).toLowerCase() === category.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Category Hero Block */}
      <div className="relative bg-[#111936] text-white py-24 md:py-28 overflow-hidden border-b border-white/8">
        {/* Background Category Image */}
        <div className="absolute inset-0 bg-slate-900 z-0">
          <AppImage
            src={currentCategory.imageUrl}
            alt={currentCategory.name}
            className="w-full h-full object-cover opacity-35"
          />
        </div>

        {/* Deep Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/60 to-transparent z-1" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider mb-8 hover:bg-white/20 transition-all border border-white/10"
          >
            <Icon name="ArrowLeftIcon" size={14} />
            Back to Categories
          </Link>

          <div className="max-w-3xl">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 text-[#D4A62A] rounded-2xl mb-6 shadow-lg">
              <Icon name={currentCategory.icon} size={28} />
            </div>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500"
              style={HEADING_FONT}
            >
              {currentCategory.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-200 font-semibold max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
              {currentCategory.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900" style={HEADING_FONT}>
            Available Businesses ({filteredBusinesses.length})
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Browse through active local businesses and discount programs available under this category.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-200/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-[2rem] shadow-sm max-w-2xl mx-auto">
            <Icon name="BuildingStorefrontIcon" size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Partners Yet</h3>
            <p className="text-slate-500 font-semibold text-sm max-w-sm mx-auto leading-relaxed">
              We currently don't have any live business partners listed under {currentCategory.name}. Please check back soon!
            </p>
            <Link
              to="/categories"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Browse other categories
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBusinesses.map((business) => {
              const categoryLabel = business.category?.name || business.category?.slug || business.category || "Premium Partner";
              return (
                <Link
                  key={business.id || business._id}
                  to={`/business-profile/${business.id || business._id}`}
                  className="group bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-[2rem] p-6 flex flex-col items-center text-center cursor-pointer"
                >
                  {/* Logo Block */}
                  <div className="w-16 h-16 rounded-2xl mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1 shadow-inner group-hover:border-[#D4A62A]/40 transition-all duration-300">
                    {business.logoUrl ? (
                      <AppImage
                        src={business.logoUrl}
                        alt={business.name}
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

                  {/* Business Name */}
                  <h3
                    className="text-base font-extrabold text-slate-800 group-hover:text-[#1C4D8D] transition-colors line-clamp-1 w-full"
                    style={HEADING_FONT}
                  >
                    {business.name}
                  </h3>

                  {/* Category Label */}
                  <p className="text-xs font-bold text-[#D4A62A] uppercase tracking-wider mt-1.5 truncate w-full">
                    {categoryLabel}
                  </p>

                  {/* Address Badge */}
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

export default CategoriesDetailsPage;