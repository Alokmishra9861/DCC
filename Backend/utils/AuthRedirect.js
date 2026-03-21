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

export const ROLE_ROUTES = {
  MEMBER: "/member-dashboard",
  EMPLOYER: "/employer-dashboard",
  BUSINESS: "/business-dashboard",
  ADMIN: "/admin",
  B2B: "/b2b-dashboard",
  // ASSOCIATION is handled by getAssociationRoute — do NOT add it here
};

/**
 * Always return the role's dashboard — no membership check here.
 */
const getRedirectPath = (user, assoc = null) => {
  if (user.role === "ASSOCIATION") {
    // assoc is passed in from the controller — already loaded via include
    const type = assoc?.associationType ?? "MEMBER";
    return type === "BUSINESS"
      ? "/association-business-dashboard"
      : "/association-member-dashboard";
  }
  return ROLE_ROUTES[user.role] ?? "/";
};

/**
 * Standard auth response payload.
 * Include membershipStatus so the frontend dashboard can show
 * "Active" / "Inactive" badge without an extra API call.
 */
const buildAuthResponse = (tokens, user, assoc = null, membership = null) => {
  const { accessToken, refreshToken } = tokens;

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      // Only included for ASSOCIATION — lets frontend route without extra API call
      ...(user.role === "ASSOCIATION" && {
        associationType: assoc?.associationType ?? "MEMBER",
      }),
    },
    // Lets the dashboard show Active/Inactive badge without an extra API call
    membershipStatus: membership?.status ?? null,
    // Computed here on the backend — frontend just calls navigate(data.redirectTo)
    redirectTo: getRedirectPath(user, assoc),
  };
};

// export const getAssociationRoute = (user) => {
//   const type = getAssociationType(user);
//   return type === "BUSINESS"
//     ? "/association-business-dashboard"
//     : "/association-member-dashboard";
// };

module.exports = { buildAuthResponse, getRedirectPath, ROLE_ROUTES };

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
