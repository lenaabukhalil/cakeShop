const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// راوت التسجيل بدون حماية
router.post('/register', userController.register);

// راوت تسجيل الدخول بدون حماية
router.post('/login', userController.login);

// راوت تسجيل الدخول بـ Google بدون حماية
router.post('/google-login', userController.googleLogin);

// راوتات محمية بالميدلوير
router.get('/profile/:id', isAuthenticated, userController.getProfile);
router.put('/profile/:id', isAuthenticated, userController.updateProfile);
router.post('/favorites/:cakeId', isAuthenticated, userController.addToFavorites);
router.delete('/favorites/:cakeId', isAuthenticated, userController.removeFromFavorites);
router.get('/favorites', isAuthenticated, userController.getFavorites);

// راوت التحقق من التوكن
router.get('/verify-token', userController.verifyToken);

module.exports = router;
