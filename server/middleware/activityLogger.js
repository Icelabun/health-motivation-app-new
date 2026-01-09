const UserActivity = require('../models/UserActivity');

const activityLogger = async (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    const result = res.send.call(this, data);

    // Only log if the request was successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const logActivity = async () => {
        try {
          let activityType = '';
          let userId = null;

          // Determine activity type based on the route
          if (req.path === '/api/auth/register' && req.method === 'POST') {
            activityType = 'REGISTER';
            const responseData = JSON.parse(data);
            userId = responseData.user?._id;
          } else if (req.path === '/api/auth/login' && req.method === 'POST') {
            activityType = 'LOGIN';
            const responseData = JSON.parse(data);
            userId = responseData.user?._id;
          } else if (req.path === '/api/auth/logout' && req.method === 'POST') {
            activityType = 'LOGOUT';
            userId = req.user?._id;
          } else if (req.path.startsWith('/api/exercises')) {
            activityType = 'EXERCISE_VIEW';
            userId = req.user?._id;
          } else if (req.path.startsWith('/api/reading')) {
            activityType = 'READING_VIEW';
            userId = req.user?._id;
          } else if (req.path.startsWith('/api/nutrition')) {
            activityType = 'NUTRITION_VIEW';
            userId = req.user?._id;
          } else if (req.path.startsWith('/api/progress')) {
            activityType = 'PROGRESS_VIEW';
            userId = req.user?._id;
          }

          if (activityType && userId) {
            const activity = new UserActivity({
              userId,
              activityType,
              deviceInfo: {
                platform: req.headers['user-agent'],
                userAgent: req.headers['user-agent']
              },
              ipAddress: req.ip,
              details: {
                method: req.method,
                path: req.path,
                query: req.query,
                body: activityType === 'REGISTER' ? { email: req.body.email } : undefined
              }
            });

            await activity.save();

            // Log to console with colors
            const timestamp = new Date().toISOString();
            const userEmail = activityType === 'REGISTER' ? req.body.email : 'N/A';
            console.log('\x1b[36m%s\x1b[0m', `[${timestamp}] User Activity:`);
            console.log('\x1b[33m%s\x1b[0m', `Type: ${activityType}`);
            console.log('\x1b[32m%s\x1b[0m', `User: ${userEmail}`);
            console.log('\x1b[35m%s\x1b[0m', `IP: ${req.ip}`);
            console.log('\x1b[34m%s\x1b[0m', `Device: ${req.headers['user-agent']}`);
            console.log('----------------------------------------');
          }
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      };

      logActivity();
    }

    return result;
  };

  next();
};

module.exports = activityLogger; 