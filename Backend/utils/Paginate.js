/**
 * Parse pagination params from query string
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page || "1"));
  const limit = Math.min(100, parseInt(query.limit || "20"));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination meta for response
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { getPagination, buildPaginationMeta };
