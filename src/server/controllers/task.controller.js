const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Filter options
    const filterOptions = {
      // Only show tasks assigned to the current user
      assignedTo: req.user.id
    };
    
    // Filter by status if provided
    if (req.query.status) {
      filterOptions.status = req.query.status;
    }
    
    // Filter by priority if provided
    if (req.query.priority) {
      filterOptions.priority = req.query.priority;
    }
    
    // Filter by due date if provided
    if (req.query.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setDate(nextMonth.getDate() + 30);
      
      switch (req.query.dueDate) {
        case 'today':
          filterOptions.dueDate = {
            $gte: today,
            $lt: tomorrow
          };
          break;
        case 'week':
          filterOptions.dueDate = {
            $gte: today,
            $lt: nextWeek
          };
          break;
        case 'month':
          filterOptions.dueDate = {
            $gte: today,
            $lt: nextMonth
          };
          break;
        case 'overdue':
          filterOptions.dueDate = { $lt: today };
          filterOptions.status = { $ne: 'completed' };
          break;
      }
    }

    // Count total documents
    const total = await Task.countDocuments(filterOptions);

    // Get tasks
    const tasks = await Task.find(filterOptions)
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .populate({
        path: 'comments.user',
        select: 'name email'
      });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private (admin, manager)
exports.createTask = async (req, res) => {
  // // Only admin or manager can create tasks
  // if (!['admin', 'manager'].includes(req.user.role)) {
  //   return res.status(403).json({ success: false, message: 'Not authorized to create tasks' });
  // }

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Create task with user as creator
    const newTask = new Task({
      ...req.body,
      createdBy: req.user.id
    });

    // If task is assigned to someone
    if (req.body.assignedTo) {
      // Check if user exists
      const user = await User.findById(req.body.assignedTo);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Create notification
      if (req.body.assignedTo.toString() !== req.user.id.toString()) {
        const notification = new Notification({
          recipient: req.body.assignedTo,
          sender: req.user.id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${newTask.title}`,
          task: newTask._id
        });
        
        await notification.save();
        
        // Send email notification if user has email notifications enabled
        if (user.notificationPreferences.email && !user.notificationPreferences.muted) {
          try {
            await sendEmail({
              email: user.email,
              subject: 'New Task Assigned',
              message: `You have been assigned a new task: ${newTask.title}\n\nDescription: ${newTask.description}\n\nDue Date: ${new Date(newTask.dueDate).toLocaleDateString()}\n\nPriority: ${newTask.priority}`
            });
          } catch (err) {
            console.error('Email could not be sent', err);
          }
        }
      }
    }

    const task = await newTask.save();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // If status is being updated to completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      // Create notification for task creator
      if (task.createdBy.toString() !== req.user.id) {
        const creator = await User.findById(task.createdBy);
        
        if (creator && !creator.notificationPreferences.muted) {
          const notification = new Notification({
            recipient: task.createdBy,
            sender: req.user.id,
            type: 'task_completed',
            title: 'Task Completed',
            message: `Task "${task.title}" has been marked as completed`,
            task: task._id
          });
          
          await notification.save();
          
          // Send email notification if user has email notifications enabled
          if (creator.notificationPreferences.email) {
            try {
              await sendEmail({
                email: creator.email,
                subject: 'Task Completed',
                message: `Task "${task.title}" has been marked as completed by ${req.user.name}`
              });
            } catch (err) {
              console.error('Email could not be sent', err);
            }
          }
        }
      }
    }

    // If task is being reassigned
    if (req.body.assignedTo && 
        (!task.assignedTo || task.assignedTo.toString() !== req.body.assignedTo)) {
      const user = await User.findById(req.body.assignedTo);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Create notification
      if (req.body.assignedTo.toString() !== req.user.id) {
        const notification = new Notification({
          recipient: req.body.assignedTo,
          sender: req.user.id,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `You have been assigned to task: ${task.title}`,
          task: task._id
        });
        
        await notification.save();
        
        // Send email notification if user has email notifications enabled
        if (user.notificationPreferences.email && !user.notificationPreferences.muted) {
          try {
            await sendEmail({
              email: user.email,
              subject: 'Task Assigned',
              message: `You have been assigned to task: ${task.title}\n\nDescription: ${task.description}\n\nDue Date: ${new Date(task.dueDate).toLocaleDateString()}\n\nPriority: ${task.priority}`
            });
          } catch (err) {
            console.error('Email could not be sent', err);
          }
        }
      }
    }

    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate({
      path: 'createdBy',
      select: 'name email'
    }).populate({
      path: 'assignedTo',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (admin or creator)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Only admin or the creator can delete
    if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Assign task to user
// @route   PUT /api/tasks/:id/assign
// @access  Private
exports.assignTask = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check if user exists
    const user = await User.findById(req.body.assignedTo);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo },
      { new: true, runValidators: true }
    ).populate({
      path: 'createdBy',
      select: 'name email'
    }).populate({
      path: 'assignedTo',
      select: 'name email'
    });

    // Create notification
    if (req.body.assignedTo.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: req.body.assignedTo,
        sender: req.user.id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `You have been assigned to task: ${task.title}`,
        task: task._id
      });
      
      await notification.save();
      
      // Send email notification if user has email notifications enabled
      if (user.notificationPreferences.email && !user.notificationPreferences.muted) {
        try {
          await sendEmail({
            email: user.email,
            subject: 'Task Assigned',
            message: `You have been assigned to task: ${task.title}\n\nDescription: ${task.description}\n\nDue Date: ${new Date(task.dueDate).toLocaleDateString()}\n\nPriority: ${task.priority}`
          });
        } catch (err) {
          console.error('Email could not be sent', err);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Create comment
    const newComment = {
      text: req.body.text,
      user: req.user.id
    };

    // Add comment to task
    task.comments.unshift(newComment);
    await task.save();

    // If comment is added by someone who is not the assignee, notify the assignee
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      const assignee = await User.findById(task.assignedTo);
      
      if (assignee && !assignee.notificationPreferences.muted) {
        const notification = new Notification({
          recipient: task.assignedTo,
          sender: req.user.id,
          type: 'comment_added',
          title: 'New Comment',
          message: `New comment on task "${task.title}": ${req.body.text.substring(0, 50)}...`,
          task: task._id
        });
        
        await notification.save();
        
        // Send email notification if user has email notifications enabled
        if (assignee.notificationPreferences.email) {
          try {
            await sendEmail({
              email: assignee.email,
              subject: 'New Comment on Task',
              message: `New comment on task "${task.title}": ${req.body.text}\n\nBy: ${req.user.name}`
            });
          } catch (err) {
            console.error('Email could not be sent', err);
          }
        }
      }
    }

    // If comment is added by someone who is not the creator, notify the creator
    if (task.createdBy.toString() !== req.user.id) {
      const creator = await User.findById(task.createdBy);
      
      if (creator && !creator.notificationPreferences.muted) {
        const notification = new Notification({
          recipient: task.createdBy,
          sender: req.user.id,
          type: 'comment_added',
          title: 'New Comment',
          message: `New comment on task "${task.title}": ${req.body.text.substring(0, 50)}...`,
          task: task._id
        });
        
        await notification.save();
        
        // Send email notification if user has email notifications enabled
        if (creator.notificationPreferences.email) {
          try {
            await sendEmail({
              email: creator.email,
              subject: 'New Comment on Task',
              message: `New comment on task "${task.title}": ${req.body.text}\n\nBy: ${req.user.name}`
            });
          } catch (err) {
            console.error('Email could not be sent', err);
          }
        }
      }
    }

    const updatedTask = await Task.findById(req.params.id)
      .populate({
        path: 'comments.user',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      data: updatedTask.comments
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Search tasks
// @route   GET /api/tasks/search
// @access  Private
exports.searchTasks = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
      return res.status(400).json({ success: false, message: 'Please provide a search term' });
    }

    const tasks = await Task.find(
      { 
        $and: [
          { assignedTo: req.user.id }, // Only search tasks assigned to the current user
          { $text: { $search: searchTerm } }
        ]
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/filter/overdue
// @access  Private
exports.getOverdueTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/filter/assigned
// @access  Private
exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get tasks created by current user
// @route   GET /api/tasks/filter/created
// @access  Private
exports.getCreatedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}; 