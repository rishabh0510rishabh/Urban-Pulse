const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const multer = require('multer');
const { storage } = require("../utils/cloudconfig");
const uploadImgCloudinary = multer({ storage });
const { isLoggedIn, requireRole } = require("../utils/middlewares");

// Controllers
const {
  getAllEvents,
  createEvent,
  getEventById,
  registerForEvent,
  updateEvent,
  unregisterFromEvent,
} = require("../controllers/events.controller");

// Upload middleware
const uploadFields = uploadImgCloudinary.fields([
  { name: "image", maxCount: 1 },
  { name: "image2", maxCount: 1 },
]);

// Get all events — public
router.get("/", wrapAsync(getAllEvents));

// Create a new event — admin or official only
router.post("/", isLoggedIn, requireRole("admin", "official"), uploadFields, wrapAsync(createEvent));

// Get event by ID — public
router.get("/:id", wrapAsync(getEventById));

// Register user for event — any logged-in user
router.post("/:id", isLoggedIn, wrapAsync(registerForEvent));
router.post("/:id/rsvp", isLoggedIn, wrapAsync(registerForEvent));

// Update event — admin or official only
router.put("/:id", isLoggedIn, requireRole("admin", "official"), wrapAsync(updateEvent));

// Unregister user from event — any logged-in user
router.post("/:id/unregister", isLoggedIn, wrapAsync(unregisterFromEvent));

module.exports = router;
