import React from 'react'
import {Link} from 'react-router-dom'
import Icon from '../../components/ui/AppIcon'

const LocalSavings = () => {
    const categories = [
    {
      id: 'cat_restaurants',
      name: 'Restaurants',
      discount: '10–20% OFF',
      icon: 'BuildingStorefrontIcon',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      id: 'cat_salons',
      name: 'Salons & Personal Care',
      discount: '15–20% OFF',
      icon: 'ScissorsIcon',
      color: 'bg-pink-100 text-pink-700',
    },
    {
      id: 'cat_clothing',
      name: 'Clothing & Retail',
      discount: '15% OFF',
      icon: 'ShoppingBagIcon',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'cat_groceries',
      name: 'Groceries',
      discount: '10–15% OFF',
      icon: 'ShoppingCartIcon',
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'cat_gas',
      name: 'Gas',
      discount: '10% OFF',
      icon: 'TruckIcon',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'cat_jewelry',
      name: 'Jewelry',
      discount: '15% OFF',
      icon: 'SparklesIcon',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      id: 'cat_services',
      name: 'Services & Experiences',
      discount: '10–20% OFF',
      icon: 'BriefcaseIcon',
      color: 'bg-indigo-100 text-indigo-700',
    },
  ];

  const compoundingExamples = [
    { category: 'Restaurants', usage: '~10 visits per month' },
    { category: 'Salons', usage: 'monthly savings' },
    { category: 'Clothing', usage: 'every other month' },
    { category: 'Gas & groceries', usage: 'ongoing, everyday wins' },
    { category: 'Jewelry & Perfumes', usage: 'special occasions & gifts' },
    { category: 'Coffee Shops', usage: 'weekly visits' },
    { category: 'Car Insurance', usage: 'annual renewal savings' },
  ];
  return (
     <section className="relative py-24 overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-pink-50/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100/40 via-blue-50/40 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Local Savings That Add Up
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use it consistently and the savings compound all year.
          </p>
        </div>

        {/* Category Tiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16 animate-fade-up animation-delay-100 ">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 hover:border-primary/20"
            >
              {/* Discount Badge Overlay */}
              <div className="absolute top-4 right-4 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md group-hover:bg-gradient-to-r from-teal-400 to-cyan-500 transition-colors">
                {category.discount}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <Icon name={category.icon} size={32} />
              </div>

              {/* Category Name */}
              <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-cyan-500 transition-colors">
                {category.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Compounding Example */}
        <div className="relative bg-slate-900 rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden animate-fade-up animation-delay-200">
          {/* Decorative blobs inside dark card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-white mb-10 text-center">
              How Everyday Savings Add Up
            </h3>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
              {compoundingExamples.map((example, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Icon name="CheckIcon" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg mb-1">{example.category}</p>
                    <p className="text-slate-400">{example.usage}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bold Summary */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
              <p className="text-2xl md:text-3xl font-bold text-white">
                Estimated annual local savings: <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 block md:inline mt-2 md:mt-0">US$1,000 – US$1,500 per year</span>
              </p>
            </div>

            {/* Footnote */}
            <p className="text-sm text-slate-500 text-center mt-6">
              Savings vary by usage and participating businesses.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 animate-fade-up animation-delay-300">
          <Link
            to="/browse-discounts"
            className="inline-flex items-center gap-2 text-[#4988C4] font-bold text-lg hover:gap-3 transition-all"
          >
            See all local deals inside
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default LocalSavings