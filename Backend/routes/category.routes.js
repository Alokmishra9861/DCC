// Backend/routes/category.routes.js  — FULL REPLACEMENT
// Public routes (no auth needed — anyone can browse categories)

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/category.controller");

// GET /api/categories        — all categories with live deal counts
router.get("/", ctrl.getCategories);

// GET /api/categories/:slug  — single category with its businesses
router.get("/:slug", ctrl.getCategoryBySlug);

module.exports = router;
