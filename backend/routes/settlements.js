const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Calculate who owes whom
router.get('/balances', authMiddleware, async (req, res) => {
  try {
    const users = await db.all('SELECT id, name FROM users');
    const members = await db.all('SELECT id, name FROM household_members');
    const allPeople = [...users, ...members];
    const balances = {};

    // Initialize balances
    for (let person of allPeople) {
      balances[person.id] = { name: person.name, balance: 0, owes: {} };
    }

    // Calculate expenses paid by each user
    const expenses = await db.all('SELECT * FROM expenses');
    for (let expense of expenses) {
      // Get participants
      const participants = await db.all(
        'SELECT * FROM expense_participants WHERE expenseId = ?',
        [expense.id]
      );

      // Each participant owes the payer their share
      for (let participant of participants) {
        if (participant.userId !== expense.paidBy) {
          if (!balances[expense.paidBy]) {
            balances[expense.paidBy] = { name: expense.paidByName, balance: 0, owes: {} };
          }
          if (!balances[expense.paidBy].owes[participant.userId]) {
            balances[expense.paidBy].owes[participant.userId] = 0;
          }
          balances[expense.paidBy].owes[participant.userId] += participant.amount;
        }
      }
    }

    // Calculate net balances
    for (let userId in balances) {
      let total = 0;
      for (let otherUserId in balances[userId].owes) {
        total -= balances[userId].owes[otherUserId];
      }

      // Check what others owe to this user
      for (let otherUserId in balances) {
        if (balances[otherUserId].owes[userId]) {
          total += balances[otherUserId].owes[userId];
        }
      }
      balances[userId].balance = total;
    }

    res.json(balances);
  } catch (err) {
    console.error('Get balances error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get settlement suggestions
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const users = await db.all('SELECT id, name FROM users');
    const members = await db.all('SELECT id, name FROM household_members');
    const allPeople = [...users, ...members];
    
    const expenses = await db.all('SELECT * FROM expenses');
    const graph = {};

    // Initialize graph
    for (let person of allPeople) {
      graph[person.id] = {};
      for (let other of allPeople) {
        if (person.id !== other.id) {
          graph[person.id][other.id] = 0;
        }
      }
    }

    // Build graph of who owes whom
    for (let expense of expenses) {
      const participants = await db.all(
        'SELECT * FROM expense_participants WHERE expenseId = ?',
        [expense.id]
      );

      for (let participant of participants) {
        if (participant.userId !== expense.paidBy) {
          if (!graph[participant.userId]) {
            graph[participant.userId] = {};
          }
          if (!graph[participant.userId][expense.paidBy]) {
            graph[participant.userId][expense.paidBy] = 0;
          }
          graph[participant.userId][expense.paidBy] += participant.amount;
        }
      }
    }

    // Generate settlement suggestions
    const settlements = [];
    for (let debtor in graph) {
      for (let creditor in graph[debtor]) {
        if (graph[debtor][creditor] > 0) {
          settlements.push({
            from: debtor,
            to: creditor,
            amount: graph[debtor][creditor]
          });
        }
      }
    }

    res.json(settlements);
  } catch (err) {
    console.error('Get suggestions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Record a settlement
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { fromUser, toUser, amount } = req.body;
    
    if (!fromUser || !toUser || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = uuidv4();
    await db.run(
      'INSERT INTO settlements (id, fromUser, toUser, amount, status) VALUES (?, ?, ?, ?, ?)',
      [id, fromUser, toUser, amount, 'pending']
    );

    res.status(201).json({ id, fromUser, toUser, amount, status: 'pending' });
  } catch (err) {
    console.error('Create settlement error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark settlement as completed
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const settledAt = new Date().toISOString();
    await db.run(
      'UPDATE settlements SET status = ?, settledAt = ? WHERE id = ?',
      ['completed', settledAt, req.params.id]
    );

    const settlement = await db.get('SELECT * FROM settlements WHERE id = ?', [req.params.id]);
    res.json(settlement);
  } catch (err) {
    console.error('Complete settlement error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
