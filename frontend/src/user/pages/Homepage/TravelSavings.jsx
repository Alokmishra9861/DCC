import React from "react";
import AppImage from "../../components/ui/AppImage";
import Icon from "../../components/ui/AppIcon";
import { Link } from "react-router-dom";

const TravelSavings = () => {
  const hotelCards = [
    {
      id: "hotel_1",
      image: "/assets/hotel.jpeg",
      alt: "Arc de Triomphe in Paris, France - iconic monument and landmark",
      hotelName: "Hotel",
      location: "Paris area",
      stars: 4,
      landmark: "Near Eiffel Tower",
      amenity: "Free Internet",
      reviewScore: "8.8",
      reviewText: "Excellent",
      publicPrices: [
        { site: "hotels.com", price: "US$623" },
        { site: "orbitz.com", price: "US$623" },
        { site: "priceline.com", price: "US$697" },
      ],
      memberPrice: "US$348",
      savingsAmount: "US$275/night",
      savingsPercent: "44%",
    },
    {
      id: "hotel_2",
      image: "/assets/boutique.jpeg",
      alt: "Eiffel Tower in Paris with Seine river and bridge in foreground - iconic French landmark",
      hotelName: " Boutique",
      location: "Paris area",
      stars: 5,
      landmark: "Near Louvre Museum",
      amenity: "Free Internet",
      reviewScore: "9.4",
      reviewText: "Superb",
      publicPrices: [
        { site: "hotels.com", price: "US$334" },
        { site: "orbitz.com", price: "US$334" },
        { site: "priceline.com", price: "US$334" },
      ],
      memberPrice: "US$248",
      savingsAmount: "US$86/night",
      savingsPercent: "26%",
    },
  ];
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyaWJhKDMwLCA1OCwgMTM5LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Great Travel Savings Like This
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Examples show real public pricing compared to member-only rates.
            Hotel names blurred for partner protection.
          </p>
        </div>

        {/* Hotel Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 animate-fade-up animation-delay-100">
          {hotelCards?.map((hotel) => (
            <div
              key={hotel?.id}
              className="bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Hotel Image */}
              <div className="relative h-64 lg:h-96 overflow-hidden rounded-t-3xl">
                <img
                  src={hotel?.image}
                  alt={hotel?.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Hotel Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-2xl text-foreground mb-1">
                      {hotel?.hotelName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {hotel?.location}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {[...Array(hotel?.stars)]?.map((_, i) => (
                          <Icon
                            key={i}
                            name="StarIcon"
                            size={16}
                            className="text-yellow-500 fill-yellow-500"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        • {hotel?.landmark}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      {hotel?.amenity}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-md">
                    <span className="font-bold">{hotel?.reviewScore}</span>
                    <span>{hotel?.reviewText}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Public Prices */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Public Pricing:
                      </p>
                      <div className="space-y-1">
                        {hotel?.publicPrices?.map((price, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {price?.site}
                            </span>
                            <span className="text-foreground font-medium line-through">
                              {price?.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Member Price */}
                    <div className="text-right border-l border-slate-200 pl-4">
                      <p className="text-xs font-semibold text-[#1C4D8D] mb-2">
                        Member Price:
                      </p>
                      <p className="text-3xl font-bold text-[#1C4D8D]">
                        {hotel?.memberPrice}
                      </p>
                      <p className="text-xs text-muted-foreground">per night</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-green-100 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-bold text-lg">
                    You save {hotel?.savingsAmount} ({hotel?.savingsPercent})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real Trip Examples */}
        <div className="relative bg-slate-900 rounded-3xl p-10 md:p-12 mb-12 animate-fade-up animation-delay-200 shadow-2xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
          <h3 className="font-heading text-3xl font-bold text-white mb-8 text-center relative z-10">
            What That Means on a Real Trip
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto relative z-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 flex items-center gap-5 border border-white/10">
              <div className="w-14 h-14 bg-primary/20 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="CalendarDaysIcon" size={28} />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">7-night stay</p>
                <p className="text-sm text-slate-300">
                  Save{" "}
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    US$600 – US$1,900+
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 flex items-center gap-5 border border-white/10">
              <div className="w-14 h-14 bg-primary/20 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="CalendarDaysIcon" size={28} />
              </div>
              <div>
                <p className="font-semibold text-white text-lg">
                  10-night stay
                </p>
                <p className="text-sm text-slate-300">
                  Save{" "}
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
                    US$900 – US$2,700+
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Microcopy & CTA */}
        <div className="text-center animate-fade-up animation-delay-300">
          <p className="text-muted-foreground mb-4">
            Exact hotel names and availability visible after sign-in.
          </p>
          <Link
            to="/travel"
            className="inline-flex items-center gap-2 text-[#1C4D8D] font-semibold hover:gap-3 transition-all"
          >
            See full travel deals on the inside
            <Icon name="ArrowRightIcon" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelSavings;
