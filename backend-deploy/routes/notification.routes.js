const express = require('express');
const router = express.Router();

// Controllers
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateNotificationPreferences
} = require('../controllers/notification.controller');

// Middleware
const { protect } = require('../middleware/auth');

// Get all notifications for the logged in user
router.get('/', protect, getNotifications);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Update notification preferences
router.put('/preferences', protect, updateNotificationPreferences);

module.exports = router; 