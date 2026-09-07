const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, requireRole } = require("../utils/middlewares");

const wasteSubmissionController = require("../controllers/wasteSubmission.controller");

// READ ALL — admin only
router.get("/", isLoggedIn, requireRole("admin"), wrapAsync(wasteSubmissionController.getAllSubmissions));

// ── Vendor-only routes ──────────────────────────────────────────────────────
router.get('/vendor/near-me', isLoggedIn, requireRole("vendor"), wrapAsync(wasteSubmissionController.getNearbyVendorEvents));
router.post('/vendor/events', isLoggedIn, requireRole("vendor"), wasteSubmissionController.createVendorEvent);
router.get('/vendor/events/all', isLoggedIn, requireRole("vendor"), wrapAsync(wasteSubmissionController.getAllVendorEvents));
router.post('/vendor/settlement', isLoggedIn, requireRole("vendor"), wrapAsync(wasteSubmissionController.createSettlement));

// Get waste assignments for logged-in vendor
router.get("/assigned", isLoggedIn, requireRole("vendor"), wrapAsync(wasteSubmissionController.getVendorAssignments));

// ── Admin/Official actions ──────────────────────────────────────────────────
router.patch(
  "/requests/:id/verify",
  isLoggedIn, requireRole("admin", "official"),
  wrapAsync(wasteSubmissionController.verifySubmission)
);

router.patch(
  "/requests/:id/pay",
  isLoggedIn, requireRole("admin"),
  wrapAsync(wasteSubmissionController.payVendor)
);

// ── Vendor marks collected ──────────────────────────────────────────────────
router.patch("/requests/:id/collected", isLoggedIn, requireRole("vendor"), wrapAsync(wasteSubmissionController.markCollected));

// READ ONE — admin, official, or vendor
router.get("/:id", isLoggedIn, requireRole("admin", "official", "vendor"), wrapAsync(wasteSubmissionController.getSubmissionById));

// DELETE — admin only
router.delete("/:id", isLoggedIn, requireRole("admin"), wrapAsync(wasteSubmissionController.deleteSubmission));

module.exports = router;
