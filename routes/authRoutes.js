const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// تسجيل مستخدم جديد
router.post('/register', authController.register);

// تسجيل دخول
router.post('/login', authController.login);

// تسجيل خروج
router.get('/logout', authController.logout);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Add this route for token verification
const { verifyToken } = require('../controllers/authController');
router.get('/verify-token', verifyToken);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: '/profile' // أو أي رابط مناسب لفرونت إند
  })
);

module.exports = router;
