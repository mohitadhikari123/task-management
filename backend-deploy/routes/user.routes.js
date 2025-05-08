const express = require('express');
const router = express.Router();

// Controllers
const {
  getUsers,
  getUser
} = require('../controllers/user.controller');

// Middleware
const { protect, authorize } = require('../middleware/auth');

// Get all users (available to all authenticated users)
router.get('/', protect, getUsers);

// Get specific user
router.get('/:id', protect, getUser);

module.exports = router; 