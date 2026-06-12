// Backend/routes/category.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/category.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Public routes (no auth needed — anyone can browse categories)

// GET /api/categories        — all categories with live deal counts
router.get("/", ctrl.getCategories);

// GET /api/categories/:slug  — single category with its businesses
router.get("/:slug", ctrl.getCategoryBySlug);

// Admin-only CRUD routes
router.post("/", protect, authorize("ADMIN"), ctrl.createCategory);
router.put("/:id", protect, authorize("ADMIN"), ctrl.updateCategory);
router.delete("/:id", protect, authorize("ADMIN"), ctrl.deleteCategory);

module.exports = router;

