const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);

router.get('/', cartController.getUserCart);

router.post('/add', cartController.addToCart);

router.delete('/remove/:cakeId', cartController.removeFromCart);

router.put('/update/:cakeId', cartController.updateCartItem);

module.exports = router;
