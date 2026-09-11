const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, requireRole } = require("../utils/middlewares");

const shopController = require('../controllers/shop.controller.js');

// Browse shop — public
router.get('/', wrapAsync(shopController.getAllItems));
router.get('/:id', wrapAsync(shopController.getSpecificItem));

// Cart & orders — any logged-in user
router.get('/user-cart', isLoggedIn, wrapAsync(shopController.getUserCart));
router.delete('/empty-cart', isLoggedIn, wrapAsync(shopController.emptyUserCart));
router.post('/:id/add-to-cart', isLoggedIn, wrapAsync(shopController.addItemToCart));
router.post('/:id/remove-from-cart', isLoggedIn, wrapAsync(shopController.removeItemFromCart));
router.patch('/:id/increase-qty', isLoggedIn, wrapAsync(shopController.increaseItemQty));
router.patch('/:id/decrease-qty', isLoggedIn, wrapAsync(shopController.decreaseItemQty));

// Payments — any logged-in user
router.post('/checkout', isLoggedIn, wrapAsync(shopController.checkout));
router.post('/create-rzp-order', isLoggedIn, wrapAsync(shopController.createRazorpayOrder));
router.post('/verify-rzp-payment', isLoggedIn, wrapAsync(shopController.verifyRazorpayOrder));
router.post('/place-order', isLoggedIn, wrapAsync(shopController.placeOrder));

module.exports = router;