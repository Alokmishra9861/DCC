/**
 * Calculate savings from a discount offer
 */
const calcDiscountSavings = (saleAmount, offer) => {
  if (!offer) return 0;

  if (offer.type === "DISCOUNT") {
    // Percentage discount
    if (offer.discountValue <= 1) {
      return parseFloat((saleAmount * offer.discountValue).toFixed(2));
    }
    // Fixed amount discount
    return Math.min(offer.discountValue, saleAmount);
  }

  if (offer.type === "VALUE_ADDED_CERTIFICATE") {
    // e.g. $25 off purchases of $300+
    if (!offer.minSpend || saleAmount >= offer.minSpend) {
      return offer.discountValue || 0;
    }
    return 0;
  }

  return 0;
};

/**
 * Calculate ROI for a membership
 * Returns multiplier, e.g. 5.8 means 5.8× value
 */
const calcROI = (totalSavings, membershipCost) => {
  if (!membershipCost || membershipCost === 0) return 0;
  return parseFloat((totalSavings / membershipCost).toFixed(2));
};

/**
 * Build analytics summary for a member
 */
const buildMemberSummary = (member, membership) => {
  const cost = membership?.priceUSD || 0;
  const savings = member.totalSavings || 0;
  const roi = calcROI(savings, cost);

  return {
    membershipCost: cost,
    totalSavings: savings,
    roi,
    roiLabel: `${roi}× Value`,
    netBenefit: parseFloat((savings - cost).toFixed(2)),
  };
};

/**
 * Build analytics summary for an employer
 */
const buildEmployerSummary = (employer) => {
  const cost = employer.totalMembershipCost || 0;
  const savings = employer.totalSavings || 0;
  return {
    totalMembershipCost: cost,
    totalSavings: savings,
    roi: calcROI(savings, cost),
    roiLabel: `${calcROI(savings, cost)}× Value`,
  };
};

module.exports = {
  calcDiscountSavings,
  calcROI,
  buildMemberSummary,
  buildEmployerSummary,
};
