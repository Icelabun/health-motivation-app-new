const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all user activities
router.get('/activities', isAdmin, async (req, res) => {
  try {
    const activities = await UserActivity.find()
      .sort({ timestamp: -1 })
      .populate('userId', 'username email');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/statistics', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalActivities = await UserActivity.countDocuments();
    
    const activityTypes = await UserActivity.aggregate([
      { $group: { _id: '$activityType', count: { $sum: 1 } } }
    ]);

    const recentRegistrations = await UserActivity.find({ activityType: 'REGISTER' })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'username email');

    const recentLogins = await UserActivity.find({ activityType: 'LOGIN' })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'username email');

    res.json({
      totalUsers,
      totalActivities,
      activityTypes,
      recentRegistrations,
      recentLogins
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activity by ID
router.get('/activities/:userId', isAdmin, async (req, res) => {
  try {
    const activities = await UserActivity.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .populate('userId', 'username email');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 