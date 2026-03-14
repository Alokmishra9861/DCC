/**
 * auth.redirect.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Used in auth.controller.js after login and signup.
 *
 * Rules:
 *   After SIGNUP  → always go to role dashboard (no membership gate)
 *   After LOGIN   → same, always go to role dashboard
 *
 *   Membership status is shown INSIDE the dashboard.
 *   The /membership gate is only enforced at the point of REDEEMING,
 *   not at login/signup time.
 */

const ROLE_ROUTES = {
  MEMBER: "/member-dashboard",
  BUSINESS: "/business-dashboard",
  EMPLOYER: "/employer-dashboard",
  ASSOCIATION: "/association-dashboard",
  B2B: "/b2b-dashboard",
  ADMIN: "/admin",
};

/**
 * Always return the role's dashboard — no membership check here.
 */
const getRedirectPath = (user) => {
  return ROLE_ROUTES[user.role] ?? "/";
};

/**
 * Standard auth response payload.
 * Include membershipStatus so the frontend dashboard can show
 * "Active" / "Inactive" badge without an extra API call.
 */
const buildAuthResponse = (token, user, membership = null) => {
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    membershipStatus: membership?.status ?? null,
    redirectTo: getRedirectPath(user),
  };
};

module.exports = { getRedirectPath, buildAuthResponse, ROLE_ROUTES };

/* ─────────────────────────────────────────────────────────────────────────────
 * HOW TO USE IN auth.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * const { buildAuthResponse } = require("../utils/auth.redirect");
 *
 * // Login handler:
 * const member = user.role === "MEMBER"
 *   ? await prisma.member.findUnique({
 *       where: { userId: user.id },
 *       include: { membership: true },
 *     })
 *   : null;
 * const token = generateToken(user.id);
 * return res.status(200).json({
 *   success: true,
 *   data: buildAuthResponse(token, user, member?.membership),
 * });
 *
 * // Signup handler — membership is null at this point, that's fine:
 * return res.status(201).json({
 *   success: true,
 *   data: buildAuthResponse(token, newUser, null),
 * });
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FRONTEND — after login or signup
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * const data = await authAPI.login(email, password);
 * setToken(data.token);
 * setUser(data.user);
 * localStorage.setItem("membershipStatus", data.membershipStatus ?? "");
 * navigate(data.redirectTo);   // always the role dashboard
 */
