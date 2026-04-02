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

// CORS configuration
const corsOptions = {
  origin: [
    'https://shared-expense-manager-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
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
    res.json({ message: 'Debug endpoint - database schema check' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/users-count', (req, res) => {
  try {
    res.json({ message: 'Debug endpoint - users count' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/members-count', (req, res) => {
  try {
    res.json({ message: 'Debug endpoint - members count' });
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
