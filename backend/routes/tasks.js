const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await db.all(`
      SELECT t.*, 
             COALESCE(u.name, hm.name) as assignedToName 
      FROM tasks t 
      LEFT JOIN users u ON t.assignedTo = u.id 
      LEFT JOIN household_members hm ON t.assignedTo = hm.id
      WHERE t.createdBy = ? OR t.assignedTo = ?
      ORDER BY t.dueDate ASC, t.createdAt DESC
    `, [userId, userId]);
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const task = await db.get(`
      SELECT t.*, 
             COALESCE(u.name, hm.name) as assignedToName 
      FROM tasks t 
      LEFT JOIN users u ON t.assignedTo = u.id 
      LEFT JOIN household_members hm ON t.assignedTo = hm.id
      WHERE t.id = ? AND (t.createdBy = ? OR t.assignedTo = ?)
    `, [req.params.id, userId, userId]);
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const history = await db.all(
      'SELECT * FROM task_history WHERE taskId = ? ORDER BY updatedAt DESC',
      [req.params.id]
    );
    task.history = history;
    
    res.json(task);
  } catch (err) {
    console.error('Get task by ID error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, assignedTo, priority, dueDate } = req.body;
    
    if (!title || !assignedTo) {
      return res.status(400).json({ error: 'Title and assignedTo are required' });
    }

    // Verify assignedTo exists (user or household member)
    const user = await db.get('SELECT id FROM users WHERE id = ?', [assignedTo]);
    const member = !user ? await db.get('SELECT id FROM household_members WHERE id = ?', [assignedTo]) : null;
    
    if (!user && !member) {
      return res.status(400).json({ error: 'Invalid assignedTo: user or household member not found' });
    }

    const id = uuidv4();
    await db.run(
      'INSERT INTO tasks (id, title, description, assignedTo, createdBy, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, assignedTo, userId, priority, dueDate]
    );

    res.status(201).json({ id, title, description, assignedTo, priority, dueDate, status: 'pending' });
  } catch (err) {
    console.error('Create task error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    // Record status change in history
    if (status) {
      const historyId = uuidv4();
      await db.run(
        'INSERT INTO task_history (id, taskId, status) VALUES (?, ?, ?)',
        [historyId, req.params.id, status]
      );
    }

    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    
    await db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, completedAt = ? WHERE id = ?',
      [title, description, status, priority, dueDate, completedAt, req.params.id]
    );
    
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.run('DELETE FROM task_history WHERE taskId = ?', [req.params.id]);
    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get tasks by user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const ownerId = req.user.userId;
    
    // Allow users to view tasks assigned to them or created by them
    if (userId !== ownerId && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const tasks = await db.all(
      'SELECT * FROM tasks WHERE (assignedTo = ? OR createdBy = ?) ORDER BY dueDate ASC',
      [userId, userId]
      [req.params.userId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
