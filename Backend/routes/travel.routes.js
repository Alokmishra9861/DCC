const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/travel.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Stripe webhook — raw body, no auth
router.post(
  "/bookings/webhook",
  express.raw({ type: "application/json" }),
  ctrl.handleBookingWebhook,
);

// All other routes require login
router.use(protect);

// Location autocomplete
router.get("/locations", ctrl.searchLocations);

// Hotel search & detail
router.get("/hotels", ctrl.searchHotels);
router.get("/hotels/:offerId", ctrl.getHotelOffer);

// Flight search
router.get("/flights", ctrl.searchFlights);

// Packages & cruises
router.get("/packages", ctrl.getPackages);
router.get("/cruises", ctrl.getCruises);

// Booking — MEMBER only
router.post(
  "/bookings/checkout",
  authorize("MEMBER"),
  ctrl.createBookingCheckout,
);
router.get("/bookings/verify", authorize("MEMBER"), ctrl.verifyBooking);
router.get("/my/bookings", authorize("MEMBER"), ctrl.getMyBookings);

module.exports = router;
