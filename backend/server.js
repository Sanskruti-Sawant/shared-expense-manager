require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const expenseRoutes = require('./routes/expenses');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const settlementRoutes = require('./routes/settlements');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
db.initialize();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settlements', settlementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Debug endpoint - check database state
app.get('/api/debug/db-schema', (req, res) => {
  try {
    // Check all table schemas
    db.db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `, (err, tables) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const schemas = {};
      let completed = 0;
      
      tables.forEach(table => {
        db.db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
          if (err) {
            schemas[table.name] = { error: err.message };
          } else {
            schemas[table.name] = columns.map(c => ({ name: c.name, type: c.type }));
          }
          completed++;
          
          if (completed === tables.length) {
            res.json({ tables: schemas });
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/users-count', (req, res) => {
  try {
    db.db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ users_count: row.count });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/members-count', (req, res) => {
  try {
    db.db.get('SELECT COUNT(*) as count FROM household_members', (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ members_count: row.count });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
