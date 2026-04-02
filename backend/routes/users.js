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

// Get all household members (protected route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get current user
    const currentUser = await db.get('SELECT id, name, email, createdAt FROM users WHERE id = ?', [userId]);
    
    if (!currentUser) {
      console.warn('Current user not found:', userId);
      return res.json([]);
    }
    
    // Get all household members
    const members = await db.all(`
      SELECT id, name, createdAt
      FROM household_members
      WHERE householdId = ?
      ORDER BY createdAt ASC
    `, [userId]);
    
    // Combine current user with household members
    const allMembers = [
      { 
        id: currentUser.id, 
        name: currentUser.name,
        email: currentUser.email,
        createdAt: currentUser.createdAt,
        isCurrentUser: true
      },
      ...(members || [])
    ];
    
    console.log('GET /users returning members:', allMembers.map(m => m.name));
    res.json(allMembers);
  } catch (err) {
    console.error('Error in GET /users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create/add household member (protected route) - just a name, no account needed
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const currentUserId = req.user.userId;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if member already exists in this household
    const existingMember = await db.get(
      'SELECT id FROM household_members WHERE householdId = ? AND name = ?',
      [currentUserId, name.trim()]
    );
    if (existingMember) {
      return res.status(409).json({ error: 'This member already exists in your household' });
    }

    // Add the member (no account required!)
    const memberId = require('uuid').v4();
    
    await db.run(
      'INSERT INTO household_members (id, householdId, name) VALUES (?, ?, ?)',
      [memberId, currentUserId, name.trim()]
    );

    res.status(201).json({
      message: 'Member added successfully',
      id: memberId,
      name: name.trim()
    });
  } catch (err) {
    console.error('Error in POST /users:', err);
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

// Delete household member (protected route)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const memberId = req.params.id;

    // If deleting themselves, delete the account
    if (currentUserId === memberId) {
      await db.run('DELETE FROM household_members WHERE householdId = ?', [currentUserId]);
      await db.run('DELETE FROM users WHERE id = ?', [currentUserId]);
      res.json({ message: 'Account deleted successfully' });
    } else {
      // Remove household member
      const member = await db.get(
        'SELECT id FROM household_members WHERE id = ? AND householdId = ?',
        [memberId, currentUserId]
      );
      
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      
      await db.run('DELETE FROM household_members WHERE id = ?', [memberId]);
      res.json({ message: 'Member removed from household' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
