const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const multer = require("multer");
const { storage } = require("../utils/cloudconfig");
const uploadImgCloudinary = multer({ storage });
const upload = multer({ storage: multer.memoryStorage() });
const { isLoggedIn, requireRole } = require("../utils/middlewares");

// Controllers
const reportsController = require("../controllers/reports.controller");

// -- /reports --
// Get all reports — admin & official only
router.get("/", isLoggedIn, requireRole("admin", "official"), wrapAsync(reportsController.getAllReports));

// Create a new report (any logged-in user)
router.post(
  "/",
  isLoggedIn,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  wrapAsync(reportsController.createReport)
);

// Get reports created by logged-in user
router.get("/my-reports", isLoggedIn, wrapAsync(reportsController.getMyReports));

// Get all reports assigned to the logged-in OSP
router.get("/assigned", isLoggedIn, requireRole("osp"), wrapAsync(reportsController.getReportsAssignedToOsp));

// Get report by ID — admin, official, osp
router.get("/:id", isLoggedIn, requireRole("admin", "official", "osp"), wrapAsync(reportsController.getReportById));

// Toggle report status — admin only
router.post("/:id", isLoggedIn, requireRole("admin"), wrapAsync(reportsController.updateReportStatus));

// Assign a report to an OSP — official or admin
router.post("/:id/assign", isLoggedIn, requireRole("admin", "official"), wrapAsync(reportsController.assignReportToOsp));

// OSP marks report resolved
router.post(
  "/:id/resolve",
  isLoggedIn,
  requireRole("osp"),
  upload.single("resolvedImage"),
  wrapAsync(reportsController.ospResolveReport)
);

module.exports = router;
