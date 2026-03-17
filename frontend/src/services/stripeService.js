// Frontend/src/services/stripeService.js  — FULL REPLACEMENT
import { loadStripe } from "@stripe/stripe-js";
import { getToken, certificateAPI } from "./api"; // ← uses dcc_token correctly

// Singleton Stripe instance
let stripePromise = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// ─────────────────────────────────────────────────────────────────────────────
// redirectToStripeCheckout
// Called from the purchase modal "Pay $X" button.
//
// Uses certificateAPI.purchase() from api.js which:
//  - already attaches the correct dcc_token Authorization header
//  - already unwraps the ApiResponse wrapper ({ data: { checkoutUrl, sessionId } })
//  - hits POST /api/certificates/purchase (your real existing backend route)
// ─────────────────────────────────────────────────────────────────────────────
export const redirectToStripeCheckout = async ({ certificateId, type }) => {
  const base = window.location.origin;
  const successUrl = `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=${type || ""}`;
  const cancelUrl = `${base}/certification`;

  // certificateAPI.purchase() returns the already-unwrapped data:
  // { checkoutUrl, sessionId }  (api.js request() strips the ApiResponse wrapper)
  const data = await certificateAPI.purchase(
    certificateId,
    "STRIPE",
    successUrl,
    cancelUrl,
  );

  // Handle membership gate — backend returns 403 with code MEMBERSHIP_REQUIRED
  // api.js throws an Error with err.message set to json.message in that case
  // so this is caught by the caller's try/catch in the modal

  const { checkoutUrl, sessionId } = data || {};

  // Modern Stripe.js approach: redirect to the checkout URL directly
  // (stripe.redirectToCheckout is deprecated)
  if (checkoutUrl) {
    window.location.href = checkoutUrl;
    return;
  }

  // Fallback: if only sessionId is returned, build the checkout URL manually
  if (sessionId) {
    // Stripe URLs follow the pattern: https://checkout.stripe.com/pay/{sessionId}
    const checkoutSessionUrl = `https://checkout.stripe.com/pay/${sessionId}`;
    window.location.href = checkoutSessionUrl;
    return;
  }

  throw new Error("No checkoutUrl or sessionId returned from server");
};

// ─────────────────────────────────────────────────────────────────────────────
// verifyPaymentSession
// Called by PaymentSuccessPage on mount.
// Hits GET /api/payments/verify-certificate-session?session_id=xxx
// Returns { success, certificate } or { pending: true, message }
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPaymentSession = async (sessionId) => {
  // Cannot use the generic request() wrapper here because we need to read the
  // 202 status (pending) before throwing — so we fetch directly with dcc_token.
  const token = getToken(); // ← correct key: dcc_token
  const BASE_URL =
    import.meta.env.VITE_API_URL || "https://dcc-backend-ej8n.onrender.com/api";

  const response = await fetch(
    `${BASE_URL}/payments/verify-certificate-session?session_id=${encodeURIComponent(sessionId)}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    },
  );

  const json = await response.json();

  // 202 = webhook hasn't fired yet — show "processing" state
  if (response.status === 202 && json.pending) {
    return { pending: true, message: json.message };
  }

  if (!response.ok) {
    throw new Error(json.message || `Verification failed (${response.status})`);
  }

  // Response shape: { success: true, certificate: { ... } }
  return json;
};

// ─────────────────────────────────────────────────────────────────────────────
// redeemCertificate
// Called when member clicks "Mark as Redeemed" on a VALUE_ADDED certificate.
// ─────────────────────────────────────────────────────────────────────────────
export const redeemCertificate = async ({ purchaseId }) => {
  const token = getToken();
  const BASE_URL =
    import.meta.env.VITE_API_URL || "https://dcc-backend-ej8n.onrender.com/api";

  const response = await fetch(`${BASE_URL}/payments/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ purchaseId }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Redemption failed");
  return json;
};

// Client-side display fallback — real code is generated server-side in webhook
export const generateUniqueCode = (prefix = "DISC") => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${prefix}-${seg()}-${seg()}-${seg()}`;
};
