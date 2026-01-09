const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: ['REGISTER', 'LOGIN', 'LOGOUT', 'EXERCISE_VIEW', 'READING_VIEW', 'NUTRITION_VIEW', 'PROGRESS_VIEW'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    platform: String,
    userAgent: String
  },
  ipAddress: String,
  details: {
    type: mongoose.Schema.Types.Mixed
  }
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity; 