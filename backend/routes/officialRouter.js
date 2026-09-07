const express = require("express");
const router = express.Router();
const officialController = require("../controllers/official.controller");
const { isLoggedIn, requireRole } = require("../utils/middlewares");

// Admin/Official: Create franchisee
router.post("/franchisee/create", isLoggedIn, requireRole("admin", "official"), officialController.createFranchisee);

module.exports = router;
