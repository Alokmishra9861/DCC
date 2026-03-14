// Bridge: re-exports config/db.js
// Many controllers import from "../config/database" — this shim satisfies them.
module.exports = require("./db");
