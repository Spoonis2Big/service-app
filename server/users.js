const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (db) => {
  // Get all users (admin only)
  router.get('/', (req, res) => {
    db.getAllUsers((err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(users);
    });
  });

  // Get user by ID (admin only)
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.getUserById(id, (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    });
  });

  // Create new user (admin only)
  router.post('/', (req, res) => {
    const { username, email, password, role, active } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    db.getUserByUsername(username, (err, existingUser) => {
      if (err) {
        console.error('Error checking username:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email already exists
      db.getUserByEmail(email, (emailErr, existingEmail) => {
        if (emailErr) {
          console.error('Error checking email:', emailErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (existingEmail) {
          return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        const userData = {
          username,
          email,
          password: hashedPassword,
          role: role || 'user',
          active: active !== undefined ? active : 1
        };

        db.createUser(userData, function(createErr) {
          if (createErr) {
            console.error('Error creating user:', createErr);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          res.status(201).json({
            id: this.lastID,
            username,
            email,
            role: userData.role,
            active: userData.active,
            message: 'User created successfully'
          });
        });
      });
    });
  });

  // Update user (admin only)
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { username, email, role, active, password } = req.body;

    // Validation
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // First check if user exists
    db.getUserById(id, (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = {
        username,
        email,
        role: role || user.role,
        active: active !== undefined ? active : user.active
      };

      db.updateUser(id, userData, function(updateErr) {
        if (updateErr) {
          console.error('Error updating user:', updateErr);
          if (updateErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Failed to update user' });
        }

        // If password is provided, update it
        if (password) {
          if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
          }

          const hashedPassword = bcrypt.hashSync(password, 10);
          db.updateUserPassword(id, hashedPassword, (pwErr) => {
            if (pwErr) {
              console.error('Error updating password:', pwErr);
              return res.status(500).json({ error: 'User updated but failed to update password' });
            }
            res.json({ message: 'User updated successfully (including password)' });
          });
        } else {
          res.json({ message: 'User updated successfully' });
        }
      });
    });
  });

  // Delete user (admin only)
  router.delete('/:id', (req, res) => {
    const id = req.params.id;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.deleteUser(id, function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Failed to delete user' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    });
  });

  return router;
};
