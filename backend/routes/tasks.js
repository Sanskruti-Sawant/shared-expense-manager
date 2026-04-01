const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await db.all(`
      SELECT t.*, u.name as assignedToName 
      FROM tasks t 
      LEFT JOIN users u ON t.assignedTo = u.id 
      ORDER BY t.dueDate ASC, t.createdAt DESC
    `);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await db.get(`
      SELECT t.*, u.name as assignedToName 
      FROM tasks t 
      LEFT JOIN users u ON t.assignedTo = u.id 
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const history = await db.all(
      'SELECT * FROM task_history WHERE taskId = ? ORDER BY updatedAt DESC',
      [req.params.id]
    );
    task.history = history;
    
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    
    if (!title || !assignedTo) {
      return res.status(400).json({ error: 'Title and assignedTo are required' });
    }

    const id = uuidv4();
    await db.run(
      'INSERT INTO tasks (id, title, description, assignedTo, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, description, assignedTo, priority, dueDate]
    );

    res.status(201).json({ id, title, description, assignedTo, priority, dueDate, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM task_history WHERE taskId = ?', [req.params.id]);
    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tasks by user
router.get('/user/:userId', async (req, res) => {
  try {
    const tasks = await db.all(
      'SELECT * FROM tasks WHERE assignedTo = ? ORDER BY dueDate ASC',
      [req.params.userId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
