const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, requireRole } = require("../utils/middlewares");
const ospController = require('../controllers/osp.controller');

// GET -> /osp/active — admin & official can see active OSPs
router.get("/active", isLoggedIn, requireRole("admin", "official"), wrapAsync(ospController.getActiveOsps));

// POST -> /osp/toggle-duty — osp only
router.post("/toggle-duty", isLoggedIn, requireRole("osp"), wrapAsync(ospController.toggleDuty));

module.exports = router;
