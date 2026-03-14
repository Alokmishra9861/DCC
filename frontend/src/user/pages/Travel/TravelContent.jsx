import React, { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/ui/AppIcon";
import { travelAPI, getUser } from "../../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
};
const fmtPrice = (p, curr = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: 0,
  }).format(p || 0);
const fmtDuration = (iso) => {
  if (!iso) return "";
  const h = iso.match(/(\d+)H/)?.[1];
  const m = iso.match(/(\d+)M/)?.[1];
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ");
};

// ── Membership upgrade modal ──────────────────────────────────────────────────
const MembershipModal = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">✈️</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
        Membership Required
      </h3>
      <p className="text-slate-500 text-sm text-center mb-6">
        An active DCC membership unlocks exclusive travel deals and lets you
        book directly on our platform.
      </p>
      <Link
        to="/membership"
        className="w-full block text-center py-3 bg-[#1C4D8D] text-white font-bold rounded-xl hover:bg-[#0F2854] transition-colors mb-3"
      >
        Get Membership
      </Link>
      <button
        onClick={onClose}
        className="w-full py-3 text-slate-500 text-sm hover:text-slate-800 transition-colors"
      >
        Browse deals first
      </button>
    </div>
  </div>
);

// ── Location autocomplete input ───────────────────────────────────────────────
const LocationInput = ({ placeholder, value, onChange, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    clearTimeout(timer.current);
    if (v.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await travelAPI.searchLocations(v, "AIRPORT,CITY");
        setSuggestions(res?.data || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C4D8D]/20 focus:border-[#1C4D8D] transition-all text-sm"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm flex items-center gap-3 border-b border-slate-50 last:border-0"
              onMouseDown={() => {
                onSelect(s);
                onChange(s.label || s.name);
                setOpen(false);
              }}
            >
              <span className="text-slate-400">
                {s.type === "AIRPORT" ? "✈" : "🏙"}
              </span>
              <div>
                <span className="font-semibold text-slate-900">
                  {s.iataCode}
                </span>
                <span className="text-slate-500 ml-2">{s.name}</span>
                {s.cityName && (
                  <span className="text-slate-400 ml-1">· {s.cityName}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ── Hotel card ────────────────────────────────────────────────────────────────
const HotelCard = ({ hotel, canBook, onBook }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
    <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
      <span className="text-5xl">🏨</span>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-slate-900 text-base leading-tight">
          {hotel.title}
        </h3>
        {hotel.starRating && (
          <span className="text-yellow-400 text-sm flex-shrink-0">
            {"★".repeat(hotel.starRating)}
          </span>
        )}
      </div>
      {hotel.address && (
        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
          <span>📍</span>
          {hotel.address}
        </p>
      )}
      {hotel.roomType && (
        <p className="text-xs text-slate-500 mb-3">{hotel.roomType}</p>
      )}
      <div className="flex items-end justify-between mt-4">
        <div>
          <p className="text-xs text-slate-400">From</p>
          <p className="text-2xl font-bold text-[#1C4D8D]">
            {fmtPrice(hotel.discountedPrice, hotel.currency)}
          </p>
          <p className="text-xs text-slate-400">per night</p>
        </div>
        {canBook ? (
          <button
            onClick={() => onBook(hotel)}
            className="px-4 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-semibold text-sm hover:bg-[#0F2854] transition-colors"
          >
            Book Now
          </button>
        ) : (
          <button
            onClick={() => onBook(null)}
            className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-colors"
          >
            Join to Book
          </button>
        )}
      </div>
    </div>
  </div>
);

// ── Flight card ───────────────────────────────────────────────────────────────
const FlightCard = ({ flight, canBook, onBook }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
        ✈️
      </div>
      <div>
        <p className="font-bold text-slate-900 text-sm">
          {flight.airline || flight.airlineCode}
        </p>
        <p className="text-xs text-slate-400">
          {flight.flightNumber} · {flight.cabinClass}
        </p>
      </div>
      <span
        className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${flight.stops === 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
      >
        {flight.stopsLabel}
      </span>
    </div>

    <div className="flex items-center justify-between mb-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">{flight.origin}</p>
        <p className="text-xs text-slate-400">
          {flight.departureTime
            ? new Date(flight.departureTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center px-4">
        <p className="text-xs text-slate-400 mb-1">
          {fmtDuration(flight.duration)}
        </p>
        <div className="w-full h-px bg-slate-200 relative">
          <div className="absolute inset-y-0 left-0 w-2 h-2 bg-slate-400 rounded-full -translate-y-1/2" />
          <div className="absolute inset-y-0 right-0 w-2 h-2 bg-[#1C4D8D] rounded-full -translate-y-1/2" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900">
          {flight.destination}
        </p>
        <p className="text-xs text-slate-400">
          {flight.arrivalTime
            ? new Date(flight.arrivalTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div>
        <p className="text-xl font-bold text-[#1C4D8D]">
          {fmtPrice(flight.totalPrice, flight.currency)}
        </p>
        <p className="text-xs text-slate-400">{flight.seats} seats left</p>
      </div>
      {canBook ? (
        <button
          onClick={() => onBook(flight)}
          className="px-4 py-2.5 bg-[#1C4D8D] text-white rounded-xl font-semibold text-sm hover:bg-[#0F2854] transition-colors"
        >
          Book Now
        </button>
      ) : (
        <button
          onClick={() => onBook(null)}
          className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-colors"
        >
          Join to Book
        </button>
      )}
    </div>
  </div>
);

// ── Placeholder card (packages / cruises) ─────────────────────────────────────
const PlaceholderSection = ({ icon, title, message }) => (
  <div className="col-span-full flex flex-col items-center py-20 text-center">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm max-w-md">{message}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TravelContent = () => {
  const navigate = useNavigate();
  const user = useRef(getUser()).current;

  const [activeTab, setActiveTab] = useState("hotels");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canBook, setCanBook] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Hotel form state
  const [hotelForm, setHotelForm] = useState({
    cityCode: "",
    cityLabel: "",
    checkIn: addDays(today(), 7),
    checkOut: addDays(today(), 10),
    adults: 1,
  });

  // Flight form state
  const [flightForm, setFlightForm] = useState({
    originCode: "",
    originLabel: "",
    destinationCode: "",
    destinationLabel: "",
    departureDate: addDays(today(), 7),
    returnDate: "",
    adults: 1,
    travelClass: "ECONOMY",
    tripType: "roundtrip",
  });

  // ── Search handlers ─────────────────────────────────────────────────────
  const searchHotels = async (e) => {
    e?.preventDefault();
    if (!hotelForm.cityCode) {
      setError("Please select a city");
      return;
    }
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const res = await travelAPI.searchHotels({
        cityCode: hotelForm.cityCode,
        checkIn: hotelForm.checkIn,
        checkOut: hotelForm.checkOut,
        adults: hotelForm.adults,
      });
      setResults(res?.data || []);
      setCanBook(res?.canBook ?? false);
      setMembershipStatus(res?.membershipStatus ?? null);
    } catch (err) {
      setError(err.message || "Hotel search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const searchFlights = async (e) => {
    e?.preventDefault();
    if (!flightForm.originCode || !flightForm.destinationCode) {
      setError("Please select origin and destination");
      return;
    }
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const res = await travelAPI.searchFlights({
        originCode: flightForm.originCode,
        destinationCode: flightForm.destinationCode,
        departureDate: flightForm.departureDate,
        returnDate:
          flightForm.tripType === "roundtrip"
            ? flightForm.returnDate
            : undefined,
        adults: flightForm.adults,
        travelClass: flightForm.travelClass,
      });
      setResults(res?.data || []);
      setCanBook(res?.canBook ?? false);
      setMembershipStatus(res?.membershipStatus ?? null);
    } catch (err) {
      setError(err.message || "Flight search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Book handler ────────────────────────────────────────────────────────
  const handleBook = async (deal) => {
    if (!deal) {
      setShowMembershipModal(true);
      return;
    }
    if (!canBook) {
      setShowMembershipModal(true);
      return;
    }

    setBookingLoading(true);
    try {
      const res = await travelAPI.createBookingCheckout({
        category: deal.type,
        dealTitle: deal.title,
        totalPrice: deal.totalPrice || deal.discountedPrice,
        currency: deal.currency || "usd",
        offerId: deal.offerId || deal.id,
        bookingData: deal,
        savingsAmount: deal.originalPrice
          ? deal.originalPrice - deal.totalPrice
          : 0,
      });
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err) {
      if (
        err.message?.includes("MEMBERSHIP") ||
        err.message?.includes("membership")
      ) {
        setShowMembershipModal(true);
      } else {
        setError(err.message || "Booking failed. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Tab switch — clear results ──────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setResults([]);
    setError("");
    setHasSearched(false);
    if (tab === "packages" || tab === "cruises") setHasSearched(true);
  };

  const tabs = [
    { key: "hotels", label: "Hotels", icon: "🏨" },
    { key: "flights", label: "Flights", icon: "✈️" },
    { key: "packages", label: "Packages", icon: "🌴" },
    { key: "cruises", label: "Cruises", icon: "🛳️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {showMembershipModal && (
        <MembershipModal onClose={() => setShowMembershipModal(false)} />
      )}

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] pt-16 pb-0">
        <div className="max-w-5xl mx-auto px-6 text-center mb-10">
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-3">
            Member Exclusive
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Travel Deals
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Search hotels and flights worldwide. Active members can book
            directly at member rates.
          </p>
          {membershipStatus && membershipStatus !== "ACTIVE" && (
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-amber-400 text-amber-900 font-bold rounded-xl hover:bg-amber-300 transition-colors text-sm shadow-lg"
            >
              <span>⚡</span> Activate membership to unlock booking
            </Link>
          )}
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-t-2xl p-1.5 w-fit mx-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === t.key
                    ? "bg-white text-[#1C4D8D] shadow-md"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search forms ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Hotel search form */}
          {activeTab === "hotels" && (
            <form
              onSubmit={searchHotels}
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Destination City
                </label>
                <LocationInput
                  placeholder="e.g. Grand Cayman (GCM)"
                  value={hotelForm.cityLabel}
                  onChange={(v) =>
                    setHotelForm((p) => ({ ...p, cityLabel: v, cityCode: "" }))
                  }
                  onSelect={(s) =>
                    setHotelForm((p) => ({
                      ...p,
                      cityCode: s.iataCode,
                      cityLabel: s.label || s.name,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Check-in
                </label>
                <input
                  type="date"
                  value={hotelForm.checkIn}
                  min={today()}
                  onChange={(e) =>
                    setHotelForm((p) => ({ ...p, checkIn: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Check-out
                </label>
                <input
                  type="date"
                  value={hotelForm.checkOut}
                  min={hotelForm.checkIn}
                  onChange={(e) =>
                    setHotelForm((p) => ({ ...p, checkOut: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Guests
                </label>
                <div className="flex gap-2">
                  <select
                    value={hotelForm.adults}
                    onChange={(e) =>
                      setHotelForm((p) => ({
                        ...p,
                        adults: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} Adult{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#0F2854] transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {loading ? "..." : "Search"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Flight search form */}
          {activeTab === "flights" && (
            <form onSubmit={searchFlights} className="space-y-3">
              <div className="flex gap-3 mb-3">
                {["roundtrip", "oneway"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setFlightForm((p) => ({ ...p, tripType: t }))
                    }
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${flightForm.tripType === t ? "bg-[#1C4D8D] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {t === "roundtrip" ? "Round Trip" : "One Way"}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    From
                  </label>
                  <LocationInput
                    placeholder="Origin (e.g. MIA)"
                    value={flightForm.originLabel}
                    onChange={(v) =>
                      setFlightForm((p) => ({
                        ...p,
                        originLabel: v,
                        originCode: "",
                      }))
                    }
                    onSelect={(s) =>
                      setFlightForm((p) => ({
                        ...p,
                        originCode: s.iataCode,
                        originLabel: s.label || s.name,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    To
                  </label>
                  <LocationInput
                    placeholder="Destination (e.g. GCM)"
                    value={flightForm.destinationLabel}
                    onChange={(v) =>
                      setFlightForm((p) => ({
                        ...p,
                        destinationLabel: v,
                        destinationCode: "",
                      }))
                    }
                    onSelect={(s) =>
                      setFlightForm((p) => ({
                        ...p,
                        destinationCode: s.iataCode,
                        destinationLabel: s.label || s.name,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Depart
                  </label>
                  <input
                    type="date"
                    value={flightForm.departureDate}
                    min={today()}
                    onChange={(e) =>
                      setFlightForm((p) => ({
                        ...p,
                        departureDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                  />
                </div>
                {flightForm.tripType === "roundtrip" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Return
                    </label>
                    <input
                      type="date"
                      value={flightForm.returnDate}
                      min={flightForm.departureDate}
                      onChange={(e) =>
                        setFlightForm((p) => ({
                          ...p,
                          returnDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Passengers
                  </label>
                  <select
                    value={flightForm.adults}
                    onChange={(e) =>
                      setFlightForm((p) => ({
                        ...p,
                        adults: parseInt(e.target.value),
                      }))
                    }
                    className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} Passenger{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Class
                  </label>
                  <select
                    value={flightForm.travelClass}
                    onChange={(e) =>
                      setFlightForm((p) => ({
                        ...p,
                        travelClass: e.target.value,
                      }))
                    }
                    className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1C4D8D]"
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#1C4D8D] text-white rounded-xl font-bold text-sm hover:bg-[#0F2854] transition-colors disabled:opacity-60"
                >
                  {loading ? "Searching…" : "Search Flights"}
                </button>
              </div>
            </form>
          )}

          {(activeTab === "packages" || activeTab === "cruises") && (
            <div className="text-center py-4 text-slate-400 text-sm">
              {activeTab === "packages"
                ? "🌴 Vacation packages coming soon"
                : "🛳️ Cruise deals coming soon"}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-[#1C4D8D] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm">
              Searching for the best deals…
            </p>
          </div>
        )}

        {/* Membership notice bar */}
        {hasSearched &&
          !loading &&
          !canBook &&
          user?.role === "MEMBER" &&
          membershipStatus !== "ACTIVE" &&
          results.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    Activate your membership to book
                  </p>
                  <p className="text-amber-700 text-xs">
                    You can browse all deals — activate DCC membership to unlock
                    booking.
                  </p>
                </div>
              </div>
              <Link
                to="/membership"
                className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors"
              >
                Get Membership
              </Link>
            </div>
          )}

        {!loading && hasSearched && (
          <>
            {activeTab === "packages" && (
              <PlaceholderSection
                icon="🌴"
                title="Vacation Packages Coming Soon"
                message="We're working on integrating exclusive vacation packages. Check back soon or contact admin to configure."
              />
            )}
            {activeTab === "cruises" && (
              <PlaceholderSection
                icon="🛳️"
                title="Cruise Deals Coming Soon"
                message="Cruise booking integration is on the way. Stay tuned for exclusive Caribbean and international cruise deals."
              />
            )}

            {results.length === 0 &&
              activeTab !== "packages" &&
              activeTab !== "cruises" && (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-slate-900 font-bold text-lg mb-2">
                    No results found
                  </p>
                  <p className="text-slate-400 text-sm">
                    Try adjusting your search — different dates or destination
                    may show more options.
                  </p>
                </div>
              )}

            {results.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-bold text-slate-900">
                    {results.length}{" "}
                    {activeTab === "hotels" ? "hotels" : "flights"} found
                  </p>
                  {bookingLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-4 h-4 border-2 border-[#1C4D8D] border-t-transparent rounded-full animate-spin" />
                      Preparing booking…
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeTab === "hotels" &&
                    results.map((h, i) => (
                      <HotelCard
                        key={h.id || h.offerId || i}
                        hotel={h}
                        canBook={canBook}
                        onBook={handleBook}
                      />
                    ))}
                  {activeTab === "flights" &&
                    results.map((f, i) => (
                      <FlightCard
                        key={f.id || i}
                        flight={f}
                        canBook={canBook}
                        onBook={handleBook}
                      />
                    ))}
                </div>
              </>
            )}
          </>
        )}

        {!hasSearched && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {activeTab === "hotels"
                ? "🏨"
                : activeTab === "flights"
                  ? "✈️"
                  : activeTab === "packages"
                    ? "🌴"
                    : "🛳️"}
            </div>
            <p className="text-slate-900 font-bold text-xl mb-2">
              {activeTab === "hotels"
                ? "Find your perfect hotel"
                : activeTab === "flights"
                  ? "Search for flights"
                  : activeTab === "packages"
                    ? "Vacation packages"
                    : "Cruise deals"}
            </p>
            <p className="text-slate-400 text-sm">
              {activeTab === "hotels" || activeTab === "flights"
                ? "Use the search form above to find available deals."
                : "Coming soon — check back later."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelContent;
