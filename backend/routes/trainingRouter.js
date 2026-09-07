const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/training.controller");
const { isLoggedIn } = require("../utils/middlewares");

// Record quiz points — any logged-in user
router.post('/quiz', isLoggedIn, trainingController.recordQuizPoints);

module.exports = router;