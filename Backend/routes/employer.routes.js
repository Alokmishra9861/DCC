const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/employer.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect);
router.use(authorize("EMPLOYER"));

router.get("/dashboard", ctrl.getDashboard);
router.get("/employees", ctrl.getEmployees);
router.post("/employees", ctrl.uploadEmployees);

module.exports = router;
