const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Secret key for JWT - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Login route
const loginRoute = (db) => {
  return (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.getUserByUsername(username, (err, user) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      if (!user.active) {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      // Compare password
      bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error('Error comparing passwords:', bcryptErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      });
    });
  };
};

// Get current user route
const getCurrentUserRoute = (db) => {
  return (req, res) => {
    db.getUserById(req.user.id, (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active
      });
    });
  };
};

// Change password route
const changePasswordRoute = (db) => {
  return (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get user with password
    db.getUserByUsername(req.user.username, (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      bcrypt.compare(currentPassword, user.password, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error('Error comparing passwords:', bcryptErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update password
        db.updateUserPassword(user.id, hashedPassword, function(updateErr) {
          if (updateErr) {
            console.error('Error updating password:', updateErr);
            return res.status(500).json({ error: 'Failed to update password' });
          }

          res.json({ message: 'Password updated successfully' });
        });
      });
    });
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  loginRoute,
  getCurrentUserRoute,
  changePasswordRoute,
  JWT_SECRET
};
