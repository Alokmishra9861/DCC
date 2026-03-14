const { ApiError } = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Wrap unknown errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(message, statusCode);
  }

  // Prisma known errors
  if (err.code === "P2002") {
    error = ApiError.conflict(`Duplicate field: ${err.meta?.target}`);
  }
  if (err.code === "P2025") {
    error = ApiError.notFound("Record not found");
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors?.length && { errors: error.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  return res.status(error.statusCode).json(response);
};

// Async wrapper to avoid try/catch in every controller
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };
