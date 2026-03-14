class ApiResponse {
  static success(res, data = {}, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data = {}, message = "Created successfully") {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, data, pagination, message = "Success") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message, errors = []) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message = "Not found") {
    return new ApiError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new ApiError(message, 409);
  }

  static internal(message = "Internal server error") {
    return new ApiError(message, 500);
  }
}

module.exports = { ApiResponse, ApiError };
