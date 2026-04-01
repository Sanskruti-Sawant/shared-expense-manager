const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

// Validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// SIGNUP endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingEmail = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(409).json({ error: 'This email is already registered. Please use a different email or login instead.' });
    }

    const existingName = await db.get('SELECT id FROM users WHERE name = ?', [name]);
    if (existingName) {
      return res.status(409).json({ error: 'This username is already taken. Please choose a different username.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    await db.run(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [userId, name, email, hashedPassword]
    );

    // Generate token
    const token = generateToken(userId, email, name);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        name,
        email
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup', details: err.message });
  }
});

// LOGIN endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.name);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login', details: err.message });
  }
});

// Get all users (protected route - requires authentication)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await db.all('SELECT id, name, email, createdAt FROM users ORDER BY createdAt DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (protected route)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (protected route)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { name, email } = req.body;

    // Check if email is already taken
    if (email) {
      const existingUser = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    await db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name || null, email || null, req.params.id]
    );
    const user = await db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password (protected route)
router.post('/:id/change-password', authMiddleware, async (req, res) => {
  try {
    // Users can only change their own password
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'You can only change your own password' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Get user
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Users can only delete their own account
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'You can only delete your own account' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
