const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'shared_expenses.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initialize = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Expenses table
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paidBy TEXT NOT NULL,
      category TEXT,
      usedFromBudget INTEGER DEFAULT 0,
      expenseMonth TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (paidBy) REFERENCES users(id)
    )`);

    // Monthly budgets table
    db.run(`CREATE TABLE IF NOT EXISTS monthly_budgets (
      month TEXT PRIMARY KEY,
      total REAL NOT NULL,
      remaining REAL NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Expense participants (for split tracking)
    db.run(`CREATE TABLE IF NOT EXISTS expense_participants (
      id TEXT PRIMARY KEY,
      expenseId TEXT NOT NULL,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      splitType TEXT DEFAULT 'equal',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (expenseId) REFERENCES expenses(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assignedTo TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      dueDate DATETIME,
      completedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    // Task history table
    db.run(`CREATE TABLE IF NOT EXISTS task_history (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      status TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks(id)
    )`);

    // Settlements table
    db.run(`CREATE TABLE IF NOT EXISTS settlements (
      id TEXT PRIMARY KEY,
      fromUser TEXT NOT NULL,
      toUser TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      settledAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fromUser) REFERENCES users(id),
      FOREIGN KEY (toUser) REFERENCES users(id)    )`);

    // Household Members table
    db.run(`CREATE TABLE IF NOT EXISTS household_members (
      id TEXT PRIMARY KEY,
      householdId TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(householdId, name),
      FOREIGN KEY (householdId) REFERENCES users(id)    )`);

    // Lightweight schema migrations for existing databases.
    db.run('ALTER TABLE expenses ADD COLUMN usedFromBudget INTEGER DEFAULT 0', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Migration error (usedFromBudget):', err.message);
      }
    });

    db.run('ALTER TABLE expenses ADD COLUMN expenseMonth TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Migration error (expenseMonth):', err.message);
      }
    });

    // Add password column to users if it doesn't exist
    db.run('ALTER TABLE users ADD COLUMN password TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Migration error (password):', err.message);
      }
    });

    // Migration: Add name column to household_members if it doesn't exist
    db.run('ALTER TABLE household_members ADD COLUMN name TEXT', (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Migration info (household_members name):', err.message);
      }
    });

    // Migration: Drop old household_members table if schema is wrong, recreate it
    db.all("PRAGMA table_info(household_members)", (err, columns) => {
      if (err) {
        console.error('Error checking household_members schema:', err.message);
      } else if (columns) {
        const columnNames = columns.map(c => c.name);
        console.log('Current household_members schema:', columnNames);
        
        // If the table has userId but not name, we need to recreate it
        if (columnNames.includes('userId') && !columnNames.includes('name')) {
          console.log('Recreating household_members table with correct schema...');
          db.run('DROP TABLE IF EXISTS household_members', (dropErr) => {
            if (!dropErr) {
              db.run(`CREATE TABLE household_members (
                id TEXT PRIMARY KEY,
                householdId TEXT NOT NULL,
                name TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(householdId, name),
                FOREIGN KEY (householdId) REFERENCES users(id)
              )`, (createErr) => {
                if (createErr) console.error('Error recreating household_members:', createErr.message);
                else console.log('Successfully recreated household_members table');
              });
            }
          });
        }
      }
    });

    console.log('Database tables initialized');
  });
};

module.exports = {
  db,
  initialize,
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};
