const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, profile } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name) {
      return res.status(400).json({ 
        message: 'Username, email, password, and name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      name,
      profile: profile || {}
    });

    await user.save();

    // Log registration activity
    try {
      await UserActivity.create({
        userId: user._id,
        activityType: 'REGISTER',
        deviceInfo: {
          platform: req.headers['user-agent'] || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown'
        },
        ipAddress: req.ip,
        details: { registrationMethod: 'email' }
      });
    } catch (activityError) {
      console.error('Error logging registration activity:', activityError);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          profile: user.profile,
          registeredAt: user.registeredAt
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log login activity
    try {
      await UserActivity.create({
        userId: user._id,
        activityType: 'LOGIN',
        deviceInfo: {
          platform: req.headers['user-agent'] || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown'
        },
        ipAddress: req.ip,
        details: { loginMethod: 'email' }
      });
    } catch (activityError) {
      console.error('Error logging login activity:', activityError);
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          profile: user.profile,
          registeredAt: user.registeredAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        profile: req.user.profile,
        registeredAt: req.user.registeredAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { profile } = req.body;

    if (profile) {
      req.user.profile = { ...req.user.profile, ...profile };
      await req.user.save();
    }

    res.json({
      success: true,
      data: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        isAdmin: req.user.isAdmin,
        profile: req.user.profile,
        registeredAt: req.user.registeredAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout activity
    try {
      await UserActivity.create({
        userId: req.user._id,
        activityType: 'LOGOUT',
        deviceInfo: {
          platform: req.headers['user-agent'] || 'Unknown',
          userAgent: req.headers['user-agent'] || 'Unknown'
        },
        ipAddress: req.ip,
        details: { logoutMethod: 'manual' }
      });
    } catch (activityError) {
      console.error('Error logging logout activity:', activityError);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router;
