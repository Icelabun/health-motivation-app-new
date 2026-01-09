const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const activityLogger = require('./middleware/activityLogger');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(activityLogger); // Add activity logger middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', 'Connected to MongoDB');
  })
  .catch((error) => {
    console.error('\x1b[31m%s\x1b[0m', 'MongoDB connection error:', error);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\x1b[31m%s\x1b[0m', 'Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `Server is running on port ${PORT}`);
  console.log('\x1b[33m%s\x1b[0m', 'User activity logging is enabled');
}); 