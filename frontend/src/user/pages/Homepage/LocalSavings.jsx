import React from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const LocalSavings = () => {
  const categories = [
    {
      id: "cat_restaurants",
      name: "Restaurants",
      discount: "10–20% OFF",
      icon: "BuildingStorefrontIcon",
    },
    {
      id: "cat_salons",
      name: "Salons & Personal Care",
      discount: "15–20% OFF",
      icon: "ScissorsIcon",
    },
    {
      id: "cat_clothing",
      name: "Clothing & Retail",
      discount: "15% OFF",
      icon: "ShoppingBagIcon",
    },
    {
      id: "cat_groceries",
      name: "Groceries",
      discount: "10–15% OFF",
      icon: "ShoppingCartIcon",
    },
    {
      id: "cat_gas",
      name: "Gas",
      discount: "10% OFF",
      icon: "TruckIcon",
    },
    {
      id: "cat_jewelry",
      name: "Jewelry",
      discount: "15% OFF",
      icon: "SparklesIcon",
    },
    {
      id: "cat_services",
      name: "Services & Experiences",
      discount: "10–20% OFF",
      icon: "BriefcaseIcon",
    },
  ];

  const routines = [
    "Weekly restaurant visits with family",
    "Monthly hair & salon appointments",
    "Seasonal clothes & retail shopping",
    "Regular grocery & gas fill-ups",
    "Weekly coffee shops & routines",
    "Local services & experiences",
  ];

  return (
    <section className="relative py-24 bg-[#F9FAFB] text-[#111827] border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
              Local Savings
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 tracking-tight"
            style={HEADING_FONT}
          >
            Savings That Add Up Daily
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-semibold max-w-3xl">
            Use it consistently and the savings compound throughout the year.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-16">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm relative group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Discount Tag */}
              <span className="mb-3 px-2 py-0.5 bg-[#D4A62A]/10 text-[#D4A62A] rounded-md text-[9px] font-black tracking-wider uppercase border border-[#D4A62A]/20">
                {category.discount}
              </span>

              {/* Icon container */}
              <div className="w-12 h-12 rounded-2xl mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#D4A62A] transition-colors shadow-inner">
                <Icon name={category.icon} size={22} />
              </div>

              <h3 className="m-0 font-bold text-sm text-slate-900 leading-tight">
                {category.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Compounding Routine Value Card */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 md:p-12 mb-12 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left - List of routines */}
            <div className="space-y-4">
              <h3
                className="text-2xl font-bold text-slate-900 mb-6"
                style={HEADING_FONT}
              >
                How Everyday Savings Add Up
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {routines.map((routine, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 border border-[#10B981]/25">
                      <Icon name="CheckIcon" size={14} className="stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      {routine}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Value display Box */}
            <div className="bg-[#111936] rounded-[2rem] p-8 text-center text-white border border-white/8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A62A]/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] font-black tracking-widest uppercase text-[#8D95A8] mb-3">
                Estimated Annual Local Savings
              </p>
              <p
                className="text-3xl sm:text-4xl font-extrabold text-[#D4A62A] tracking-tight leading-none mb-3"
                style={HEADING_FONT}
              >
                US$1,000 – US$1,500
              </p>
              <p className="text-sm font-semibold text-[#B8C0D4]">per year</p>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            to="/browse-discounts"
            className="inline-flex items-center gap-2 text-[#D4A62A] font-extrabold text-sm hover:underline"
          >
            Browse all local deals
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocalSavings;