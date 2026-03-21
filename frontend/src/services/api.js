const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_LOCALHOST_URL)
    return import.meta.env.VITE_LOCALHOST_URL;

  if (typeof window !== "undefined") {
    const { hostname, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      const backendPort = port === "5173" ? "5000" : port;
      return `http://${hostname}:${backendPort}/api`;
    }
  }
  return "https://dcc-backend-ej8n.onrender.com/api";
};

const BASE_URL = resolveBaseUrl();
console.log("[API Config] BASE_URL:", BASE_URL);

// ─── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("dcc_token");
export const setToken = (token) => localStorage.setItem("dcc_token", token);
export const removeToken = () => localStorage.removeItem("dcc_token");

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("dcc_user"));
  } catch {
    return null;
  }
};
export const setUser = (user) =>
  localStorage.setItem("dcc_user", JSON.stringify(user));
export const removeUser = () => {
  localStorage.removeItem("dcc_user");
  localStorage.removeItem("dcc_association_type");
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log(`[API Request] ${options.method || "GET"} ${fullUrl}`);

    const response = await fetch(fullUrl, { ...options, headers });

    const contentType = response.headers.get("content-type");
    const json =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : { message: `HTTP ${response.status}` };

    if (!response.ok) {
      throw new Error(
        json.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
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
// ASSOCIATION is intentionally absent — routing is handled by getAssociationRoute()
// which reads associationType and returns the correct typed dashboard path.
export const ROLE_ROUTES = {
  MEMBER: "/member-dashboard",
  BUSINESS: "/business-dashboard",
  EMPLOYER: "/employer-dashboard",
  B2B: "/b2b-dashboard",
  ADMIN: "/admin",
  // lowercase aliases
  member: "/member-dashboard",
  business: "/business-dashboard",
  employer: "/employer-dashboard",
  b2b: "/b2b-dashboard",
  admin: "/admin",
};

// ─── Association type helpers ─────────────────────────────────────────────────

/**
 * Returns "MEMBER" | "BUSINESS"
 * Priority: user object → localStorage → default "MEMBER"
 */
export const getAssociationType = (user) => {
  if (user?.associationType) return user.associationType;
  const stored = localStorage.getItem("dcc_association_type");
  if (stored) return stored;
  return "MEMBER";
};

/**
 * Returns the correct dashboard path for an ASSOCIATION user.
 *   MEMBER  → /association-member-dashboard
 *   BUSINESS → /association-business-dashboard
 *
 * Pass the user object right after login for the freshest value.
 * Without a user object it reads from localStorage (works on page refresh).
 */
export const getAssociationRoute = (user) => {
  const type = getAssociationType(user);
  return type === "BUSINESS"
    ? "/association-business-dashboard"
    : "/association-member-dashboard";
};

// ─── Auth data persistence ────────────────────────────────────────────────────
/**
 * Saves tokens + user from the login/register response.
 * Also persists associationType separately for quick guard checks
 * without having to parse the full user object.
 */
export const saveAuthData = (data) => {
  const token = data.accessToken || data.token;
  const user = data.user || data;

  localStorage.setItem("dcc_token", token);
  localStorage.setItem("dcc_user", JSON.stringify(user));

  if (user.role === "ASSOCIATION" && user.associationType) {
    localStorage.setItem("dcc_association_type", user.associationType);
  } else {
    localStorage.removeItem("dcc_association_type");
  }
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
  getMyQR: () => request("/member/qr"),
  getSavings: (period) => request(`/member/savings?period=${period}`),
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/member/transactions${qs ? `?${qs}` : ""}`);
  },

  // NEW: Member enters association join code to self-link
  // Backend route: POST /api/association/join  (requires MEMBER auth)
  // Returns: { associationName: string }
  joinAssociation: (joinCode) =>
    request("/association/join", {
      method: "POST",
      body: JSON.stringify({ joinCode }),
    }),
};

// ─── Employer ─────────────────────────────────────────────────────────────────
export const employerAPI = {
  getProfile: () => request("/employer/profile"),
  bulkPurchase: (data) =>
    request("/employer/bulk-purchase", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDashboard: () => request("/employer/dashboard"),
  getEmployees: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/employer/employees${qs ? `?${qs}` : ""}`);
  },
  addEmployee: (data) =>
    request("/employer/employees", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkAddEmployees: (data) =>
    request("/employer/employees/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resendInvite: (id) =>
    request(`/employer/employees/${id}/resend-invite`, { method: "POST" }),
  removeEmployee: (id) =>
    request(`/employer/employees/${id}`, { method: "DELETE" }),
  acceptInvite: (token, password) =>
    request(`/employer/employees/accept-invite/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};

// ─── Association ──────────────────────────────────────────────────────────────
export const associationAPI = {
  // Profile & dashboard
  getProfile: () => request("/association/profile"),
  getDashboard: () => request("/association/dashboard"),

  // Join code (MEMBER-type)
  generateJoinCode: () =>
    request("/association/join-code/generate", { method: "POST" }),
  toggleJoinCode: (enabled) =>
    request("/association/join-code/toggle", {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),

  // Members (MEMBER-type)
  getMembers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/association/members${qs ? `?${qs}` : ""}`);
  },
  addMember: (name, email) =>
    request("/association/members", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    }),
  bulkAddMembers: (members) =>
    request("/association/members/bulk", {
      method: "POST",
      body: JSON.stringify({ members }),
    }),
  resendMemberInvite: (id) =>
    request(`/association/members/${id}/resend-invite`, { method: "POST" }),
  removeMember: (id) =>
    request(`/association/members/${id}`, { method: "DELETE" }),

  // Businesses (BUSINESS-type)
  getLinkedBusinesses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/association/businesses${qs ? `?${qs}` : ""}`);
  },
  linkBusiness: (businessId) =>
    request("/association/businesses/link", {
      method: "POST",
      body: JSON.stringify({ businessId }),
    }),
  inviteBusiness: (businessName, email) =>
    request("/association/businesses/invite", {
      method: "POST",
      body: JSON.stringify({ businessName, email }),
    }),
  removeBusiness: (id) =>
    request(`/association/businesses/${id}`, { method: "DELETE" }),

  // Read-only detail of a linked business — offers + certificates (view only, no purchase)
  getLinkedBusinessDetail: (linkId) =>
    request(`/association/businesses/${linkId}/detail`),
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
  getMyOffers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/discounts/my/offers${qs ? `?${qs}` : ""}`);
  },
  getById: (id) => request(`/discounts/${id}`),
  redeemAttempt: (offerId) =>
    request(`/discounts/${offerId}/redeem-attempt`, { method: "POST" }),
};

// ─── Membership ───────────────────────────────────────────────────────────────
export const membershipAPI = {
  getPlans: () => request("/membership/plans"),
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
  purchase: (
    certificateId,
    paymentProvider = "STRIPE",
    successUrl,
    cancelUrl,
  ) =>
    request("/certificates/purchase", {
      method: "POST",
      body: JSON.stringify({
        certificateId,
        paymentProvider,
        ...(successUrl && { successUrl }),
        ...(cancelUrl && { cancelUrl }),
      }),
    }),
  redeem: (claimCode) =>
    request("/certificates/redeem", {
      method: "POST",
      body: JSON.stringify({ claimCode }),
    }),
  redeemByCode: (uniqueCode) =>
    request("/certificates/redeem-by-code", {
      method: "POST",
      body: JSON.stringify({ uniqueCode }),
    }),
  getRedemptions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/certificates/redemptions${qs ? `?${qs}` : ""}`);
  },
  create: (data) =>
    request("/certificates", { method: "POST", body: JSON.stringify(data) }),
  checkRedeemEligibility: () =>
    request("/certificates/redeem-check", { method: "POST" }),
};

// ─── Travel ───────────────────────────────────────────────────────────────────
export const travelAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/travel${qs ? `?${qs}` : ""}`);
  },
  // search maps to getAll — /api/travel/search does not exist
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
  createStripeCheckout: (data = {}) =>
    request("/payments/stripe/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verifyStripeSession: (sessionId) =>
    request(
      `/payments/stripe/verify?session_id=${encodeURIComponent(sessionId)}`,
    ),
  createPayPalCheckout: (data = {}) =>
    request("/payments/paypal/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  capturePayPal: (orderId, membershipId) =>
    request("/payments/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId, membershipId }),
    }),
  createOrder: () => request("/payment/paypal/checkout", { method: "POST" }),
  captureOrder: (orderId) =>
    request("/payment/paypal/capture", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),
};

// ─── Analytics (Admin) ────────────────────────────────────────────────────────
export const analyticsAPI = {
  getRoleStats: (period = "month_to_date") =>
    request(`/analytics/role-stats?period=${period}`),
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
  exportReport: async (params = {}) => {
    try {
      const token = getToken();
      const qs = new URLSearchParams(params).toString();
      const url = `${BASE_URL}/analytics/export${qs ? `?${qs}` : ""}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Export failed" }));
        throw new Error(
          error.message || `Export failed with status ${response.status}`,
        );
      }

      const blob = await response.blob();
      const contentDisposition =
        response.headers.get("content-disposition") || "";
      const filename =
        contentDisposition.match(/filename="?(.+?)"?$/)?.[1] ||
        `dcc-report-${Date.now()}.xlsx`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      return { success: true, filename };
    } catch (error) {
      throw new Error(error.message || "Export failed");
    }
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

  // Membership
  approveMembership: (id) =>
    request(`/admin/memberships/${id}/approve`, { method: "PATCH" }),

  // Employer
  approveEmployer: (id) =>
    request(`/admin/employers/${id}/approve`, { method: "PATCH" }),
  rejectEmployer: (id, reason) =>
    request(`/admin/employers/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  // Association
  approveAssociation: (id) =>
    request(`/admin/associations/${id}/approve`, { method: "PATCH" }),
  rejectAssociation: (id, reason) =>
    request(`/admin/associations/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  // Business
  approveBusiness: (id) =>
    request(`/admin/businesses/${id}/approve`, { method: "PATCH" }),
  rejectBusiness: (id) =>
    request(`/admin/businesses/${id}/reject`, { method: "PATCH" }),
  updateBusiness: (id, data) =>
    request(`/admin/businesses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Users
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
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),

  // Members
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

  // Businesses list
  getBusinesses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/businesses${qs ? `?${qs}` : ""}`);
  },

  // Inquiries
  getInquiries: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/inquiries${qs ? `?${qs}` : ""}`);
  },
  updateInquiryStatus: (id, status, response) =>
    request(`/admin/inquiries/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, response }),
    }),

  // Audit log
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
