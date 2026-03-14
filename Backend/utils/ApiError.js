// Bridge: ApiError lives in utils/ApiResponse.js — this shim lets files that
// import from "../utils/ApiError" keep working without changing those imports.
const { ApiError } = require("./ApiResponse");
module.exports = { ApiError };
