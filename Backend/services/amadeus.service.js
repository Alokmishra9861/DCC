/**
 * amadeus.service.js
 * Handles Amadeus API authentication and all travel searches.
 * Uses in-memory token cache — no DB needed.
 *
 * Required .env:
 *   AMADEUS_CLIENT_ID=your_client_id
 *   AMADEUS_CLIENT_SECRET=your_client_secret
 *   AMADEUS_BASE_URL=https://test.api.amadeus.com   (test)
 *                 or https://api.amadeus.com         (prod)
 */

const BASE_URL = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

// ── Token cache (in-memory, survives restarts only until expiry) ──────────────
let _tokenCache = { token: null, expiresAt: 0 };

const getAccessToken = async () => {
  // Return cached token if still valid (with 60s buffer)
  if (_tokenCache.token && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token;
  }

  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${err}`);
  }

  const data = await res.json();
  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return _tokenCache.token;
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
const amadeusGet = async (path, params = {}) => {
  const token = await getAccessToken();
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      body?.errors?.[0]?.detail || body?.errors?.[0]?.title || res.statusText;
    throw new Error(`Amadeus error (${res.status}): ${msg}`);
  }

  return res.json();
};

// ── Hotel search ──────────────────────────────────────────────────────────────
/**
 * Step 1: Find hotels by city code
 * Step 2: Get offers for those hotels
 */
exports.searchHotels = async ({
  cityCode,
  checkIn,
  checkOut,
  adults = 1,
  currency = "USD",
  maxResults = 20,
}) => {
  if (!cityCode) throw new Error("cityCode is required for hotel search");
  if (!checkIn) throw new Error("checkIn date is required");
  if (!checkOut) throw new Error("checkOut date is required");

  // Get hotel list for city
  const hotelList = await amadeusGet(
    "/v1/reference-data/locations/hotels/by-city",
    {
      cityCode: cityCode.toUpperCase(),
      radius: 5,
      radiusUnit: "KM",
      hotelSource: "ALL",
    },
  );

  const hotelIds = (hotelList.data || [])
    .slice(0, 20)
    .map((h) => h.hotelId)
    .join(",");

  if (!hotelIds) return { data: [], meta: { count: 0 } };

  // Get offers/pricing for those hotels
  const offers = await amadeusGet("/v3/shopping/hotel-offers", {
    hotelIds,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adults,
    currency,
    bestRateOnly: true,
    paymentPolicy: "NONE",
    includeClosed: false,
  });

  return {
    data: (offers.data || []).slice(0, maxResults).map(normalizeHotelOffer),
    meta: { count: (offers.data || []).length, source: "amadeus" },
  };
};

// ── Get single hotel offer ────────────────────────────────────────────────────
exports.getHotelOffer = async (offerId) => {
  const data = await amadeusGet(`/v3/shopping/hotel-offers/${offerId}`);
  return normalizeHotelOffer(data.data);
};

// ── Flight search ─────────────────────────────────────────────────────────────
exports.searchFlights = async ({
  originCode,
  destinationCode,
  departureDate,
  returnDate,
  adults = 1,
  travelClass = "ECONOMY",
  currency = "USD",
  maxResults = 20,
  nonStop = false,
}) => {
  if (!originCode || !destinationCode)
    throw new Error("originCode and destinationCode are required");
  if (!departureDate) throw new Error("departureDate is required");

  const params = {
    originLocationCode: originCode.toUpperCase(),
    destinationLocationCode: destinationCode.toUpperCase(),
    departureDate,
    adults,
    travelClass,
    currencyCode: currency,
    max: maxResults,
    nonStop,
  };
  if (returnDate) params.returnDate = returnDate;

  const data = await amadeusGet("/v2/shopping/flight-offers", params);

  return {
    data: (data.data || []).map((offer) =>
      normalizeFlightOffer(offer, data.dictionaries),
    ),
    meta: { count: (data.data || []).length, source: "amadeus" },
  };
};

// ── Airport / city search (autocomplete) ─────────────────────────────────────
exports.searchLocations = async (keyword, subType = "AIRPORT,CITY") => {
  if (!keyword || keyword.length < 2) return { data: [] };

  const data = await amadeusGet("/v1/reference-data/locations", {
    keyword,
    subType,
    page: { limit: 10 },
  });

  return {
    data: (data.data || []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      iataCode: loc.iataCode,
      type: loc.subType,
      cityName: loc.address?.cityName,
      countryName: loc.address?.countryName,
      label: `${loc.name} (${loc.iataCode}) — ${loc.address?.cityName || ""}`,
    })),
  };
};

// ── Normalizers — shape Amadeus responses into consistent DCC format ──────────
const normalizeHotelOffer = (item) => {
  if (!item) return null;
  const hotel = item.hotel || {};
  const offer = item.offers?.[0] || {};
  const price = offer.price || {};

  return {
    id: item.type === "hotel-offers" ? offer.id : item.offerId || item.id,
    hotelId: hotel.hotelId,
    type: "hotel",
    title: hotel.name || "Hotel",
    description: hotel.description?.text || null,
    destination: hotel.cityCode || "",
    address: hotel.address
      ? `${hotel.address.lines?.join(", ") || ""}, ${hotel.address.cityName || ""}`.trim()
      : "",
    starRating: hotel.rating ? parseInt(hotel.rating) : null,
    checkIn: offer.checkInDate,
    checkOut: offer.checkOutDate,
    roomType:
      offer.room?.typeEstimated?.category ||
      offer.room?.description?.text ||
      "Standard Room",
    boardType: offer.boardType || null,
    originalPrice: null,
    discountedPrice: parseFloat(price.base || price.total || 0),
    currency: price.currency || "USD",
    totalPrice: parseFloat(price.total || 0),
    taxes: parseFloat(
      price.taxes?.reduce((s, t) => s + parseFloat(t.amount || 0), 0) || 0,
    ),
    imageUrl: null, // Amadeus doesn't provide images in free tier
    amenities: hotel.amenities || [],
    // Raw offer ID needed to complete booking
    offerId: offer.id,
  };
};

const normalizeFlightOffer = (item, dictionaries = {}) => {
  const itinerary = item.itineraries?.[0] || {};
  const segments = itinerary.segments || [];
  const firstSeg = segments[0] || {};
  const lastSeg = segments[segments.length - 1] || {};
  const price = item.price || {};

  // Resolve airline name from dictionaries
  const airlineCode = firstSeg.carrierCode;
  const airlineName =
    dictionaries?.carriers?.[airlineCode] || airlineCode || "Unknown Airline";

  // Build stops label
  const stops = segments.length - 1;
  const stopsLabel =
    stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`;

  return {
    id: item.id,
    type: "flight",
    title: `${firstSeg.departure?.iataCode} → ${lastSeg.arrival?.iataCode}`,
    airline: airlineName,
    airlineCode,
    flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
    origin: firstSeg.departure?.iataCode,
    originTerminal: firstSeg.departure?.terminal,
    destination: lastSeg.arrival?.iataCode,
    destinationTerminal: lastSeg.arrival?.terminal,
    departureTime: firstSeg.departure?.at,
    arrivalTime: lastSeg.arrival?.at,
    duration: itinerary.duration, // ISO 8601 e.g. "PT2H30M"
    stops,
    stopsLabel,
    cabinClass:
      item.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY",
    seats: item.numberOfBookableSeats,
    originalPrice: null,
    discountedPrice: parseFloat(price.grandTotal || price.total || 0),
    totalPrice: parseFloat(price.grandTotal || 0),
    currency: price.currency || "USD",
    // Raw offer needed for booking
    rawOffer: item,
  };
};
