const express = require('express');
const router = express.Router();
const cakeController = require('../controllers/cakeController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Create a new cake
router.post('/', cakeController.createCake);

// Get all cakes
router.get('/', cakeController.getAllCakes);

// Get a single cake by ID
router.get('/:id', cakeController.getCakeById);

// Update a cake
router.put('/:id', cakeController.updateCake);

// Delete a cake
router.delete('/:id', cakeController.deleteCake);

// Search cakes with filters
router.get('/search', cakeController.searchCakes);

// Rate a cake
router.post('/:id/rate', isAuthenticated, cakeController.rateCake);

module.exports = router;
