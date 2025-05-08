const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Controllers
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateDetails
} = require('../controllers/auth.controller');

// Middleware
const { protect } = require('../middleware/auth');

// Register user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  register
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  login
);

// Logout user
router.get('/logout', logout);

// Get current logged in user
router.get('/me', protect, getMe);

// Forgot password
router.post(
  '/forgotpassword',
  [body('email').isEmail().withMessage('Please include a valid email')],
  forgotPassword
);

// Reset password
router.put(
  '/resetpassword/:resettoken',
  [
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  resetPassword
);

// Update password
router.put(
  '/updatepassword',
  protect,
  [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  updatePassword
);

// Update user details
router.put(
  '/updatedetails',
  protect,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email')
  ],
  updateDetails
);

module.exports = router; 