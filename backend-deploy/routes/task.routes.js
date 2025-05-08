const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Controllers
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  addComment,
  searchTasks,
  getOverdueTasks,
  getAssignedTasks,
  getCreatedTasks
} = require('../controllers/task.controller');

// Middleware
const { protect } = require('../middleware/auth');

// Get all tasks and create a task
router
  .route('/')
  .get(protect, getTasks)
  .post(
    protect,
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('description').notEmpty().withMessage('Description is required'),
      body('dueDate').isISO8601().withMessage('Valid due date is required')
    ],
    createTask
  );

// Search tasks - Moved before /:id route to prevent conflicts
router.get('/search', protect, searchTasks);

// Get overdue tasks
router.get('/filter/overdue', protect, getOverdueTasks);

// Get tasks assigned to current user
router.get('/filter/assigned', protect, getAssignedTasks);

// Get tasks created by current user
router.get('/filter/created', protect, getCreatedTasks);

// Get, update, delete a specific task
router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Assign task to user
router.put(
  '/:id/assign',
  protect,
  [body('assignedTo').isMongoId().withMessage('Valid user ID is required')],
  assignTask
);

// Add comment to task
router.post(
  '/:id/comments',
  protect,
  [body('text').notEmpty().withMessage('Comment text is required')],
  addComment
);

module.exports = router; 