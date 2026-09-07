const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, requireRole } = require("../utils/middlewares");

const { verifyToken } = require("../utils/middlewares.js");

// Controllers
const committeeController = require("../controllers/committee.controller");

// Collect all committees — public (leaderboard)
router.get("/", wrapAsync(committeeController.getAllCommittees));

// Approve a committee — admin only
router.post("/approve", isLoggedIn, requireRole("admin"), wrapAsync(committeeController.approveCommitteee));
router.post("/approve/:cid", isLoggedIn, requireRole("admin"), wrapAsync(committeeController.approveCommitteee));

// Reject a committee — admin only
router.post("/reject", isLoggedIn, requireRole("admin"), wrapAsync(committeeController.rejectCommittee));
router.post("/reject/:cid", isLoggedIn, requireRole("admin"), wrapAsync(committeeController.rejectCommittee));

// Register a new committee — any logged-in user
router.post("/register", isLoggedIn, wrapAsync(committeeController.registerCommittee));

// Committee login — public (uses JWT)
router.post("/login", wrapAsync(committeeController.loginCommittee));

// Get committee details — committee JWT protected
router.get("/committee", verifyToken, wrapAsync(committeeController.getCommitteeProfile));

// Check committee registration status — public
router.get("/:id/status", wrapAsync(committeeController.getCommitteeStatus));

// get committee data — committee JWT protected
router.get("/:id/data", verifyToken, wrapAsync(committeeController.getCommitteeData));

// get committee users — committee JWT protected
router.get("/:id/users", verifyToken, wrapAsync(committeeController.getCommitteeUsers));

module.exports = router;
