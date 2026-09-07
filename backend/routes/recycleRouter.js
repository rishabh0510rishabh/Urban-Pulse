const express = require('express');
const router = express.Router();
const recycleController = require('../controllers/recycle.controller');
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, requireRole } = require("../utils/middlewares");

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/franchisees', wrapAsync(recycleController.getAllFranchisees));
router.get('/franchisees/near-me', wrapAsync(recycleController.getNearbyFranchisees));
router.get('/types', wrapAsync(recycleController.getWasteTypes));

// ── Any logged-in user ──────────────────────────────────────────────────────
router.post('/create', isLoggedIn, wrapAsync(recycleController.createRecycleRequest));
router.get('/my-requests', isLoggedIn, wrapAsync(recycleController.getMySubmissions));

// ── Admin-only: CRUD on waste types ────────────────────────────────────────
router.post('/types', isLoggedIn, requireRole("admin"), wrapAsync(recycleController.createWasteType));
router.patch('/types/:id', isLoggedIn, requireRole("admin"), wrapAsync(recycleController.updateWasteType));
router.delete('/types/:id', isLoggedIn, requireRole("admin"), wrapAsync(recycleController.deleteWasteType));

// ── Franchisee (vendor role) ────────────────────────────────────────────────
router.get('/franchisee/waste-types', isLoggedIn, requireRole("vendor"), wrapAsync(recycleController.getFranchiseeWasteTypes));
router.post('/franchisee/waste-types', isLoggedIn, requireRole("vendor"), wrapAsync(recycleController.updateFranchiseeWasteTypes));
router.get('/franchisee/requests', isLoggedIn, requireRole("vendor"), wrapAsync(recycleController.getFranchiseeRequests));
router.patch('/franchisee/requests/:id/assign-vendor', isLoggedIn, requireRole("vendor"), wrapAsync(recycleController.assignVendor));
router.patch('/franchisee/requests/:id/approve', isLoggedIn, requireRole("vendor"), wrapAsync(recycleController.approveSubmission));
router.patch('/franchisee/requests/:id/reject', isLoggedIn, requireRole("vendor"), wrapAsync(recycleController.rejectSubmission));

module.exports = router;