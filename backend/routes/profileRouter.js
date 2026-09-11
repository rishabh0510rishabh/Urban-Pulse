const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, requireRole } = require("../utils/middlewares");

const {
  getCurrentUserProfile,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/profile.controller");

// Get logged-in user profile
router.get("/", isLoggedIn, wrapAsync(getCurrentUserProfile));

// Get user profile — any logged-in user
router.get("/:id", isLoggedIn, wrapAsync(getUserProfile));

// Update user profile — any logged-in user (controller enforces own-user check)
router.put("/:id", isLoggedIn, wrapAsync(updateUserProfile));

module.exports = router;
