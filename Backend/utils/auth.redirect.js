/**
 * Builds the post-auth response with redirectTo logic
 * Computes appropriate redirect based on user role and association type
 */
const buildAuthResponse = (tokens, user, association, membership) => {
  // Determine redirectTo based on role and association type
  let redirectTo = "/member-dashboard"; // default

  if (user.role === "MEMBER") {
    redirectTo = "/member-dashboard";
  } else if (user.role === "EMPLOYER") {
    redirectTo = "/employer-dashboard";
  } else if (user.role === "BUSINESS") {
    redirectTo = "/business-dashboard";
  } else if (user.role === "B2B") {
    redirectTo = "/b2b-dashboard";
  } else if (user.role === "ADMIN") {
    redirectTo = "/admin";
  } else if (user.role === "ASSOCIATION") {
    // Route based on association type
    if (association && association.associationType === "BUSINESS") {
      redirectTo = "/association-dashboard";
    } else {
      // Default to association-dashboard for MEMBER type or unspecified
      redirectTo = "/association-dashboard";
    }
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    redirectTo, // Frontend will use this for navigation
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      associationType: association?.associationType || null, // Pass association type
      membershipStatus: membership?.status || null,
    },
  };
};

module.exports = { buildAuthResponse };
