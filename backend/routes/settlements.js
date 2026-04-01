const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

// Calculate who owes whom
router.get('/balances', async (req, res) => {
  try {
    const users = await db.all('SELECT id, name FROM users');
    const balances = {};

    // Initialize balances
    for (let user of users) {
      balances[user.id] = { name: user.name, balance: 0, owes: {} };
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
    res.status(500).json({ error: err.message });
  }
});

// Get settlement suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const balances = await db.all('SELECT id, name FROM users');
    const expenses = await db.all('SELECT * FROM expenses');
    const graph = {};

    // Initialize graph
    for (let user of balances) {
      graph[user.id] = {};
      for (let other of balances) {
        if (user.id !== other.id) {
          graph[user.id][other.id] = 0;
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
    res.status(500).json({ error: err.message });
  }
});

// Record a settlement
router.post('/', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// Mark settlement as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const settledAt = new Date().toISOString();
    await db.run(
      'UPDATE settlements SET status = ?, settledAt = ? WHERE id = ?',
      ['completed', settledAt, req.params.id]
    );

    const settlement = await db.get('SELECT * FROM settlements WHERE id = ?', [req.params.id]);
    res.json(settlement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
