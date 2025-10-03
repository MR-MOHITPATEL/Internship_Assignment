const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { taskValidation, handleValidationErrors } = require('../utils/validation');
const mongoose = require('mongoose');

const router = express.Router();

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics for dashboard
// @access  Private
// NOTE: This route MUST come before /:id route to avoid conflicts
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ user: userId });
    const recentTasks = await Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      totalTasks,
      statusCounts,
      recentTasks
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const tasks = await Task.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTasks: total,
        hasNext: skip + tasks.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    res.status(500).json({ message: 'Server error fetching task' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, taskValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = new Task({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      tags: tags || [],
      user: req.user._id
    });

    await task.save();
    await task.populate('user', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, taskValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title,
        description,
        status,
        priority,
        dueDate,
        tags
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    res.status(500).json({ message: 'Server error updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task deleted successfully',
      taskId: req.params.id
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
});

module.exports = router;


