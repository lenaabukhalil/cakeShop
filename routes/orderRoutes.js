const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
console.log('authMiddleware export:', authMiddleware);

console.log('isAuthenticated type:', typeof authMiddleware.isAuthenticated); // function
console.log('createOrder type:', typeof orderController.createOrder); // function

router.get('/', orderController.getUserOrders);
router.post('/', authMiddleware.isAuthenticated, orderController.createOrder);
router.put('/:id/cancel', authMiddleware.isAuthenticated, orderController.cancelOrder);

module.exports = router;
