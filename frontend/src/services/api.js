

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("dcc_token");
export const setToken = (token) => localStorage.setItem("dcc_token", token);
export const removeToken = () => localStorage.removeItem("dcc_token");

export const getUser = () => {
  const raw = localStorage.getItem("dcc_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setUser = (user) =>
  localStorage.setItem("dcc_user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("dcc_user");

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Something went wrong");
  }
  // Unwrap ApiResponse wrapper: { success, message, data } → return data
  return json.data !== undefined ? json.data : json;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (email, password, role, profile) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role, profile }),
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/auth/me"),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  verifyEmail: (token) => request(`/auth/verify/${token}`),
};

// ─── Role → dashboard route mapping ──────────────────────────────────────────
export const ROLE_ROUTES = {
  MEMBER: "/member-dashboard",
  BUSINESS: "/business-dashboard",
  EMPLOYER: "/employer-dashboard",
  ASSOCIATION: "/association-dashboard",
  B2B: "/b2b-dashboard",
  ADMIN: "/admin",
  // lowercase aliases
  member: "/member-dashboard",
  business: "/business-dashboard",
  employer: "/employer-dashboard",
  association: "/association-dashboard",
  b2b: "/b2b-dashboard",
  admin: "/admin",
};

// ─── Helper: save auth response ───────────────────────────────────────────────
// Handles both { token, ... } and { accessToken, ... } from the backend
export const saveAuthData = (data) => {
  const token = data.token || data.accessToken;
  if (token) setToken(token);
  if (data.user) setUser(data.user);
  return token;
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
  getById: (id) => request(`/users/${id}`),
  update: (id, data) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ─── Member ───────────────────────────────────────────────────────────────────
export const memberAPI = {
  getProfile: () => request("/member/profile"),
  updateProfile: (data) =>
    request("/member/profile", { method: "PUT", body: JSON.stringify(data) }),
  getQR: () => request("/member/qr"),
  getSavings: (period = "lifetime") =>
    request(`/member/savings?period=${period}`),
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/member/transactions${qs ? `?${qs}` : ""}`);
  },
};

// ─── Employer ─────────────────────────────────────────────────────────────────
export const employerAPI = {
  getDashboard: () => request("/employers/dashboard"),
  getEmployees: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/employers/employees${qs ? `?${qs}` : ""}`);
  },
  uploadEmployees: (data) =>
    request("/employers/employees", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Association ──────────────────────────────────────────────────────────────
export const associationAPI = {
  getDashboard: () => request("/association/dashboard"),
  getMembers: () => request("/association/members"),
  addMembers: (data) =>
    request("/association/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Businesses ───────────────────────────────────────────────────────────────
export const businessAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/businesses${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => request(`/businesses/${id}`),
  getMyProfile: () => request("/businesses/me/profile"),
  updateMyProfile: (data) =>
    request("/businesses/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  connectPayment: (data) =>
    request("/businesses/me/payment", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => request("/categories"),
  getBySlug: (slug) => request(`/categories/${slug}`),
};

// ─── Offers ───────────────────────────────────────────────────────────────────
export const offerAPI = {
  getByBusiness: (businessId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/offers/${businessId}${qs ? `?${qs}` : ""}`);
  },
  create: (data) =>
    request("/offers", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/offers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/offers/${id}`, { method: "DELETE" }),
};

// ─── Discounts ────────────────────────────────────────────────────────────────
export const discountAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/discounts${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => request(`/discounts/${id}`),
  // Called when member clicks Redeem — returns { canRedeem, showUpgradeModal, modalData }
  redeemAttempt: (offerId) =>
    request(`/discounts/${offerId}/redeem-attempt`, { method: "POST" }),
};

// ─── Membership ───────────────────────────────────────────────────────────────
export const membershipAPI = {
  getPlans: () => request("/membership/plans"),

  // Returns { data: membership, isActive, canRedeem, membershipStatus }
  // Use isActive directly — no need to dig into data.status
  getMy: () => request("/membership/my"),

  subscribe: (planType, paymentProvider, paymentId) =>
    request("/membership/subscribe", {
      method: "POST",
      body: JSON.stringify({ planType, paymentProvider, paymentId }),
    }),

  cancel: (id) => request(`/membership/${id}/cancel`, { method: "PUT" }),
};

// ─── Certificates ─────────────────────────────────────────────────────────────
export const certificateAPI = {
  getAvailable: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/certificates/available${qs ? `?${qs}` : ""}`);
  },
  getMy: () => request("/certificates/my"),
  getByBusiness: () => request("/certificates/business"),
  purchase: (certificateId, paymentProvider = "STRIPE") =>
    request("/certificates/purchase", {
      method: "POST",
      body: JSON.stringify({ certificateId, paymentProvider }),
    }),
  redeem: (claimCode) =>
    request("/certificates/redeem", {
      method: "POST",
      body: JSON.stringify({ claimCode }),
    }),
  create: (data) =>
    request("/certificates", { method: "POST", body: JSON.stringify(data) }),
  checkRedeemEligibility: () =>
    request("/certificates/redeem-check", { method: "POST" }),
};

// ─── Travel ───────────────────────────────────────────────────────────────────
export const travelAPI = {
  // GET /api/travel — main list, supports ?category=hotel&featured=true etc.
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/travel${qs ? `?${qs}` : ""}`);
  },

  // search() now maps to getAll() — /api/travel/search does NOT exist
  // passing { category } becomes ?category=hotel on /api/travel
  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/travel${qs ? `?${qs}` : ""}`);
  },

  getById: (id) => request(`/travel/${id}`),
  getMyBookings: () => request("/travel/my/bookings"),
  recordBooking: (data) =>
    request("/travel/bookings", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Contact ──────────────────────────────────────────────────────────────────
export const contactAPI = {
  submit: (data) =>
    request("/contact", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Uploads ──────────────────────────────────────────────────────────────────
export const uploadAPI = {
  image: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    const response = await fetch(`${BASE_URL}/upload/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Upload failed");
    return json.data !== undefined ? json.data : json;
  },
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createStripeCheckout: () =>
    request("/payment/stripe/checkout", { method: "POST" }),

  // Returns { isActive, membershipStatus, canRedeem } — use isActive directly
  verifyStripeSession: (sessionId) =>
    request(
      `/payment/stripe/verify?session_id=${encodeURIComponent(sessionId)}`,
    ),

  createPayPalCheckout: () =>
    request("/payment/paypal/checkout", { method: "POST" }),

  capturePayPal: (orderId, membershipId) =>
    request("/payment/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId, membershipId }),
    }),

  // Legacy aliases
  createOrder: () => request("/payment/paypal/checkout", { method: "POST" }),
  captureOrder: (orderId) =>
    request("/payment/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),
};

// ─── Analytics (Admin) ────────────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview: (period = "month") =>
    request(`/analytics/overview?period=${period}`),
  getSavingsByCategory: (period = "month") =>
    request(`/analytics/by-category?period=${period}`),
  getSavingsByDistrict: (period = "month") =>
    request(`/analytics/by-district?period=${period}`),
  getSavingsByDemographics: (period = "month") =>
    request(`/analytics/by-demographics?period=${period}`),
  getMembershipAnalytics: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/analytics/membership${qs ? `?${qs}` : ""}`);
  },
  getTimeSeries: (compareBy = "month") =>
    request(`/analytics/time-series?compareBy=${compareBy}`),
  exportReport: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/analytics/export${qs ? `?${qs}` : ""}`);
  },
};

// ─── Advertisements ───────────────────────────────────────────────────────────
export const advertisementAPI = {
  getActive: (placement) => {
    const qs = placement ? `?placement=${placement}` : "";
    return request(`/advertisements${qs}`);
  },
  setStatus: (id, status) =>
    request(`/advertisements/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => request("/admin/stats"),
  getPendingApprovals: () => request("/admin/pending"),
  getPendingMemberships: () => request("/admin/memberships/pending"),
  approveMembership: (id) =>
    request(`/admin/memberships/${id}/approve`, { method: "PATCH" }),
  approveEmployer: (id) =>
    request(`/admin/employers/${id}/approve`, { method: "PATCH" }),
  approveAssociation: (id) =>
    request(`/admin/associations/${id}/approve`, { method: "PATCH" }),
  approveBusiness: (id) =>
    request(`/admin/businesses/${id}/approve`, { method: "PATCH" }),
  updateBusiness: (id, data) =>
    request(`/admin/businesses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  rejectBusiness: (id) =>
    request(`/admin/businesses/${id}/reject`, { method: "PATCH" }),
  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  updateUserStatus: (id, isActive) =>
    request(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    }),
  getMembers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/members${qs ? `?${qs}` : ""}`);
  },
  updateMember: (id, data) =>
    request(`/admin/members/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteMember: (id) => request(`/admin/members/${id}`, { method: "DELETE" }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  getBusinesses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/businesses${qs ? `?${qs}` : ""}`);
  },
  getInquiries: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/inquiries${qs ? `?${qs}` : ""}`);
  },
  updateInquiryStatus: (id, status, response) =>
    request(`/admin/inquiries/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, response }),
    }),
  getAuditLog: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/audit${qs ? `?${qs}` : ""}`);
  },
};

// ─── Stripe (legacy alias) ────────────────────────────────────────────────────
export const stripeAPI = {
  createCheckout: () => request("/payment/stripe/checkout", { method: "POST" }),
  createPaymentIntent: () =>
    request("/payment/stripe/checkout", { method: "POST" }),
};
