import React from "react";
import Icon from "../../components/ui/AppIcon";
import { Link } from "react-router-dom";

const HEADING_FONT = { fontFamily: "'Playfair Display', serif" };

const TravelSavings = () => {
  const hotelCards = [
    {
      id: "hotel_1",
      image: "/assets/hotel.jpeg",
      alt: "Iconic hotel near Eiffel Tower",
      hotelName: "████████ Hotel",
      landmark: "Near Eiffel Tower",
      stars: 4,
      reviewScore: "8.8",
      reviewText: "Excellent",
      publicPrices: [
        { site: "hotels.com", price: "US$623" },
        { site: "orbitz.com", price: "US$623" },
        { site: "priceline.com", price: "US$697" },
      ],
      memberPrice: "US$348",
      savingsAmount: "US$275",
      savingsPercent: "Save 44%",
    },
    {
      id: "hotel_2",
      image: "/assets/boutique.jpeg",
      alt: "Boutique hotel near Louvre Museum",
      hotelName: "██████ Boutique",
      landmark: "Near Louvre Museum",
      stars: 5,
      reviewScore: "9.4",
      reviewText: "Superb",
      publicPrices: [
        { site: "hotels.com", price: "US$334" },
        { site: "orbitz.com", price: "US$334" },
        { site: "priceline.com", price: "US$334" },
      ],
      memberPrice: "US$248",
      savingsAmount: "US$86",
      savingsPercent: "Save 26%",
    },
  ];

  return (
    <section className="relative py-24 bg-[#F9FAFB] text-[#111827] border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-8 bg-[#D4A62A] rounded-full inline-block shrink-0" />
            <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-[#D4A62A]">
              Travel Savings
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 tracking-tight"
            style={HEADING_FONT}
          >
            Member-Only Hotel Rates
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-semibold max-w-3xl">
            Real public pricing compared to member-only rates. Hotel names
            blurred for partner protection.
          </p>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {hotelCards.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Hotel Image */}
              <div className="relative h-64 overflow-hidden bg-slate-100 border-b border-slate-100 flex items-center justify-center">
                {/* Fallback background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center z-0">
                  <Icon name="GlobeAltIcon" size={48} className="text-slate-300" />
                </div>
                {/* Actual image */}
                <img 
                  src={hotel.image} 
                  alt={hotel.alt} 
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
                <div className="absolute top-5 left-6 z-20 px-4 py-1.5 bg-[#10B981] text-white rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                  {hotel.savingsPercent}
                </div>
              </div>

              {/* Hotel Info */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3
                        className="font-bold text-2xl text-slate-900 mb-1 tracking-tight"
                        style={HEADING_FONT}
                      >
                        {hotel.hotelName}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex">
                          {[...Array(hotel.stars)].map((_, i) => (
                            <Icon
                              key={i}
                              name="StarIcon"
                              size={14}
                              className="text-[#D4A62A] fill-[#D4A62A]"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                          • {hotel.landmark}
                        </span>
                      </div>
                    </div>

                    <div className="px-3.5 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-extrabold flex items-center gap-1.5 border border-[#10B981]/20">
                      <span className="font-black">{hotel.reviewScore}</span>
                      <span>{hotel.reviewText}</span>
                    </div>
                  </div>

                  {/* Pricing Comparison Container */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Public Prices */}
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                          Public Pricing:
                        </p>
                        <div className="space-y-1.5">
                          {hotel.publicPrices.map((price, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs font-bold"
                            >
                              <span className="text-slate-500">
                                {price.site}
                              </span>
                              <span className="text-slate-400 line-through">
                                {price.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Member Price */}
                      <div className="text-right border-l border-slate-200 pl-5">
                        <p className="text-[10px] font-black text-[#D4A62A] uppercase tracking-widest mb-2.5">
                          Member Price:
                        </p>
                        <p
                          className="text-3xl font-black text-[#D4A62A] leading-none mb-1.5"
                          style={HEADING_FONT}
                        >
                          {hotel.memberPrice}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          per night
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full py-4 bg-[#10B981] text-white rounded-xl font-black text-base shadow-sm text-center block">
                  Save {hotel.savingsAmount}/night
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real Trip Examples Card */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-8 md:p-12 mb-12 shadow-sm">
          <h3
            className="text-2xl font-bold text-slate-900 mb-8 text-center"
            style={HEADING_FONT}
          >
            What That Means on a Real Trip
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-[#D4A62A]/10 text-[#D4A62A] rounded-xl flex items-center justify-center shrink-0">
                <Icon name="CalendarDaysIcon" size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">7-night stay</p>
                <p className="text-sm font-semibold text-slate-500">
                  Save{" "}
                  <span className="font-black text-[#10B981]">
                    US$600 – US$1,900+
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-[#D4A62A]/10 text-[#D4A62A] rounded-xl flex items-center justify-center shrink-0">
                <Icon name="CalendarDaysIcon" size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">10-night stay</p>
                <p className="text-sm font-semibold text-slate-500">
                  Save{" "}
                  <span className="font-black text-[#10B981]">
                    US$900 – US$2,700+
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 mb-4">
            Exact hotel names and availability visible after sign-in.
          </p>
          <Link
            to="/travel"
            className="inline-flex items-center gap-2 text-[#D4A62A] font-extrabold text-sm hover:underline"
          >
            View full travel deals
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelSavings;
