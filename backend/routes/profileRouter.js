const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, requireRole } = require("../utils/middlewares");

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/profile.controller");

// Get user profile — any logged-in user
router.get("/:id", isLoggedIn, wrapAsync(getUserProfile));

// Update user profile — any logged-in user (controller enforces own-user check)
router.put("/:id", isLoggedIn, wrapAsync(updateUserProfile));

module.exports = router;
