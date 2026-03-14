const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../middlewares/errorhandler");
const amadeus = require("../services/amadeus.service");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ── Membership helpers ────────────────────────────────────────────────────────
const getMemberWithMembership = async (userId) =>
  prisma.member.findUnique({
    where: { userId },
    include: { membership: true },
  });

const hasActiveMembership = (member) => member?.membership?.status === "ACTIVE";

const gateResponse = (member) => ({
  success: false,
  code: "MEMBERSHIP_REQUIRED",
  message: "An active DCC membership is required to book travel deals.",
  membershipStatus: member?.membership?.status ?? null,
  redirectTo: "/membership",
});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH — all logged-in users can search; canBook flag tells frontend who books
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/travel/locations?keyword=grand&type=AIRPORT,CITY
exports.searchLocations = asyncHandler(async (req, res) => {
  const { keyword, type } = req.query;
  if (!keyword) throw ApiError.badRequest("keyword is required");
  const results = await amadeus.searchLocations(keyword, type);
  return res.status(200).json({ success: true, ...results });
});

// GET /api/travel/hotels?cityCode=GCM&checkIn=2026-04-01&checkOut=2026-04-05&adults=2
exports.searchHotels = asyncHandler(async (req, res) => {
  const {
    cityCode,
    checkIn,
    checkOut,
    adults = 1,
    currency = "USD",
  } = req.query;
  if (!cityCode || !checkIn || !checkOut)
    throw ApiError.badRequest("cityCode, checkIn and checkOut are required");

  let canBook = false,
    membershipStatus = null;
  if (req.user?.role === "MEMBER") {
    const member = await getMemberWithMembership(req.user.id);
    membershipStatus = member?.membership?.status ?? null;
    canBook = hasActiveMembership(member);
  }

  const results = await amadeus.searchHotels({
    cityCode,
    checkIn,
    checkOut,
    adults: parseInt(adults),
    currency,
  });
  return res
    .status(200)
    .json({ success: true, ...results, canBook, membershipStatus });
});

// GET /api/travel/hotels/:offerId
exports.getHotelOffer = asyncHandler(async (req, res) => {
  const offer = await amadeus.getHotelOffer(req.params.offerId);
  if (!offer) throw ApiError.notFound("Hotel offer not found");

  let canBook = false;
  if (req.user?.role === "MEMBER") {
    const member = await getMemberWithMembership(req.user.id);
    canBook = hasActiveMembership(member);
  }
  return res.status(200).json({
    success: true,
    data: offer,
    canBook,
    redirectTo: !canBook && req.user?.role === "MEMBER" ? "/membership" : null,
  });
});

// GET /api/travel/flights?originCode=MIA&destinationCode=GCM&departureDate=2026-04-01&adults=1
exports.searchFlights = asyncHandler(async (req, res) => {
  const {
    originCode,
    destinationCode,
    departureDate,
    returnDate,
    adults = 1,
    travelClass = "ECONOMY",
    nonStop = false,
  } = req.query;
  if (!originCode || !destinationCode || !departureDate)
    throw ApiError.badRequest(
      "originCode, destinationCode and departureDate are required",
    );

  let canBook = false,
    membershipStatus = null;
  if (req.user?.role === "MEMBER") {
    const member = await getMemberWithMembership(req.user.id);
    membershipStatus = member?.membership?.status ?? null;
    canBook = hasActiveMembership(member);
  }

  const results = await amadeus.searchFlights({
    originCode,
    destinationCode,
    departureDate,
    returnDate,
    adults: parseInt(adults),
    travelClass,
    nonStop: nonStop === "true",
  });
  return res
    .status(200)
    .json({ success: true, ...results, canBook, membershipStatus });
});

// GET /api/travel/packages — placeholder (no Amadeus free endpoint)
exports.getPackages = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: [],
    message: "Vacation packages integration coming soon.",
    canBook: false,
  });
});

// GET /api/travel/cruises — placeholder
exports.getCruises = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: [],
    message: "Cruise deals integration coming soon.",
    canBook: false,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING — MEMBER + ACTIVE MEMBERSHIP ONLY
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/travel/bookings/checkout
// Body: { category, dealTitle, totalPrice, currency, offerId, bookingData, savingsAmount }
exports.createBookingCheckout = asyncHandler(async (req, res) => {
  if (req.user.role !== "MEMBER")
    throw ApiError.forbidden("Only members can book travel deals");

  const member = await getMemberWithMembership(req.user.id);
  if (!member) throw ApiError.notFound("Member profile not found");
  if (!hasActiveMembership(member))
    return res.status(403).json(gateResponse(member));

  const {
    category,
    dealTitle,
    totalPrice,
    currency = "usd",
    bookingData,
    offerId,
    savingsAmount = 0,
  } = req.body;
  if (!category || !dealTitle || !totalPrice)
    throw ApiError.badRequest(
      "category, dealTitle and totalPrice are required",
    );

  const amountCents = Math.round(parseFloat(totalPrice) * 100);
  if (amountCents < 50)
    throw ApiError.badRequest("Amount too small (min $0.50)");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amountCents,
          product_data: {
            name: dealTitle,
            description: `DCC Member Travel Booking — ${category}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "travel_booking",
      memberId: member.id,
      category,
      offerId: offerId || "",
      savingsAmount: String(savingsAmount),
    },
    success_url: `${process.env.CLIENT_URL}/travel/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/travel`,
  });

  // Store pending booking
  const booking = await prisma.travelBooking.create({
    data: {
      memberId: member.id,
      category,
      providerRef: session.id,
      bookingData: bookingData ?? {},
      totalPrice: parseFloat(totalPrice),
      savingsAmount: parseFloat(savingsAmount),
      commissionAmount: 0,
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      checkoutUrl: session.url,
      sessionId: session.id,
      bookingId: booking.id,
    },
  });
});

// GET /api/travel/bookings/verify?session_id=xxx
exports.verifyBooking = asyncHandler(async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) throw ApiError.badRequest("session_id is required");

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const paid = session.payment_status === "paid";

  if (paid) {
    // Update booking providerRef and member savings
    const savings = parseFloat(session.metadata?.savingsAmount || 0);
    await prisma.travelBooking.updateMany({
      where: { providerRef: session_id },
      data: { providerRef: session.payment_intent || session_id },
    });
    if (savings > 0 && session.metadata?.memberId) {
      await prisma.member
        .update({
          where: { id: session.metadata.memberId },
          data: { totalSavings: { increment: savings } },
        })
        .catch(() => {}); // non-critical
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      paid,
      status: session.payment_status,
      category: session.metadata?.category,
    },
  });
});

// POST /api/travel/bookings/webhook  (raw body)
exports.handleBookingWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_TRAVEL_WEBHOOK_SECRET ||
        process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.metadata?.type !== "travel_booking")
      return res.json({ received: true });

    const savings = parseFloat(session.metadata?.savingsAmount || 0);
    await prisma.travelBooking.updateMany({
      where: { providerRef: session.id },
      data: { providerRef: session.payment_intent || session.id },
    });
    if (savings > 0 && session.metadata?.memberId) {
      await prisma.member
        .update({
          where: { id: session.metadata.memberId },
          data: { totalSavings: { increment: savings } },
        })
        .catch(() => {});
    }
  }

  return res.json({ received: true });
});

// GET /api/travel/my/bookings
exports.getMyBookings = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  const bookings = await prisma.travelBooking.findMany({
    where: { memberId: member.id },
    orderBy: { bookedAt: "desc" },
  });
  return res.status(200).json({ success: true, data: bookings });
});
