const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const isValidMonth = (month) => /^\d{4}-\d{2}$/.test(month);

// Get all expenses for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const expenses = await db.all(`
      SELECT e.*
      FROM expenses e 
      WHERE e.paidBy = ? OR e.id IN (
        SELECT expenseId FROM expense_participants WHERE userId = ?
      )
      ORDER BY e.date DESC
    `, [userId, userId]);
    
    // Get participants for each expense
    for (let expense of expenses) {
      expense.participants = await db.all(`
        SELECT ep.id, ep.expenseId, ep.userId, ep.amount, ep.splitType,
               COALESCE(u.name, hm.name) as name
        FROM expense_participants ep 
        LEFT JOIN users u ON ep.userId = u.id 
        LEFT JOIN household_members hm ON ep.userId = hm.id
        WHERE ep.expenseId = ?
      `, [expense.id]);
    }
    
    res.json(expenses);
  } catch (err) {
    console.error('Get expenses error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get monthly budget
router.get('/budget/:month?', authMiddleware, async (req, res) => {
  try {
    const month = req.params.month || getCurrentMonth();
    if (!isValidMonth(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const budget = await db.get('SELECT * FROM monthly_budgets WHERE month = ?', [month]);
    if (!budget) {
      return res.json({ month, total: 0, remaining: 0 });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update monthly budget
router.put('/budget/:month', authMiddleware, async (req, res) => {
  try {
    const month = req.params.month;
    const total = parseFloat(req.body.total);

    if (!isValidMonth(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    if (Number.isNaN(total) || total < 0) {
      return res.status(400).json({ error: 'Total budget must be a non-negative number' });
    }

    const spentRow = await db.get(
      'SELECT COALESCE(SUM(amount), 0) AS spent FROM expenses WHERE expenseMonth = ? AND usedFromBudget = 1',
      [month]
    );
    const spent = spentRow?.spent || 0;
    const remaining = Math.max(total - spent, 0);

    await db.run(
      `INSERT INTO monthly_budgets (month, total, remaining, updatedAt)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(month) DO UPDATE SET
         total = excluded.total,
         remaining = excluded.remaining,
         updatedAt = CURRENT_TIMESTAMP`,
      [month, total, remaining]
    );

    const budget = await db.get('SELECT * FROM monthly_budgets WHERE month = ?', [month]);
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expense by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const expense = await db.get(`
      SELECT e.*, u.name as paidByName 
      FROM expenses e 
      LEFT JOIN users u ON e.paidBy = u.id 
      WHERE e.id = ? AND (e.paidBy = ? OR e.id IN (
        SELECT expenseId FROM expense_participants WHERE userId = ?
      ))
    `, [req.params.id, userId, userId]);
    
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    
    expense.participants = await db.all(`
      SELECT ep.*, u.name 
      FROM expense_participants ep 
      LEFT JOIN users u ON ep.userId = u.id 
      WHERE ep.expenseId = ?
    `, [req.params.id]);
    
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { description, amount, paidBy, category, splitWith, useBudget, expenseMonth } = req.body;
    const parsedAmount = parseFloat(amount);
    const month = expenseMonth || getCurrentMonth();
    const shouldUseBudget = Boolean(useBudget);
    
    if (!description || !parsedAmount || !paidBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isValidMonth(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    // Look up who paid (could be user or household member)
    let paidByName = null;
    const user = await db.get('SELECT name FROM users WHERE id = ?', [paidBy]);
    if (user) {
      paidByName = user.name;
    } else {
      // Try to find in household_members
      const member = await db.get('SELECT name FROM household_members WHERE id = ?', [paidBy]);
      if (member) {
        paidByName = member.name;
      } else {
        return res.status(400).json({ error: 'Invalid paidBy: user or household member not found' });
      }
    }

    if (shouldUseBudget) {
      const budget = await db.get('SELECT * FROM monthly_budgets WHERE month = ?', [month]);
      if (!budget) {
        return res.status(400).json({ error: `No monthly budget set for ${month}` });
      }

      if (budget.remaining < parsedAmount) {
        return res.status(400).json({ error: `Insufficient budget. Remaining: ${budget.remaining.toFixed(2)}` });
      }
    }

    const expenseId = uuidv4();
    await db.run(
      'INSERT INTO expenses (id, description, amount, paidBy, paidByName, category, usedFromBudget, expenseMonth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [expenseId, description, parsedAmount, paidBy, paidByName, category, shouldUseBudget ? 1 : 0, month]
    );

    if (shouldUseBudget) {
      await db.run(
        'UPDATE monthly_budgets SET remaining = remaining - ?, updatedAt = CURRENT_TIMESTAMP WHERE month = ?',
        [parsedAmount, month]
      );
    }

    // Add participants
    if (splitWith && splitWith.length > 0) {
      const splitAmount = parsedAmount / splitWith.length;
      for (let userId of splitWith) {
        const participantId = uuidv4();
        await db.run(
          'INSERT INTO expense_participants (id, expenseId, userId, amount, splitType) VALUES (?, ?, ?, ?, ?)',
          [participantId, expenseId, userId, splitAmount, 'equal']
        );
      }
    }

    res.status(201).json({
      id: expenseId,
      description,
      amount: parsedAmount,
      paidBy,
      paidByName,
      category,
      usedFromBudget: shouldUseBudget,
      expenseMonth: month
    });
  } catch (err) {
    console.error('Expense creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update expense
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { description, amount, category } = req.body;
    const parsedAmount = parseFloat(amount);
    const existingExpense = await db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only allow if user is the payer
    if (existingExpense.paidBy !== userId) {
      return res.status(403).json({ error: 'Only the payer can edit this expense' });
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (existingExpense.usedFromBudget === 1 && existingExpense.expenseMonth) {
      const diff = parsedAmount - existingExpense.amount;
      const budget = await db.get('SELECT * FROM monthly_budgets WHERE month = ?', [existingExpense.expenseMonth]);

      if (budget) {
        if (diff > 0 && budget.remaining < diff) {
          return res.status(400).json({ error: 'Insufficient remaining budget for updated amount' });
        }

        const updatedRemaining = diff > 0
          ? budget.remaining - diff
          : Math.min(budget.remaining + Math.abs(diff), budget.total);

        await db.run(
          'UPDATE monthly_budgets SET remaining = ?, updatedAt = CURRENT_TIMESTAMP WHERE month = ?',
          [updatedRemaining, existingExpense.expenseMonth]
        );
      }
    }

    await db.run(
      'UPDATE expenses SET description = ?, amount = ?, category = ? WHERE id = ?',
      [description, parsedAmount, category, req.params.id]
    );
    
    const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only allow if user is the payer
    if (expense.paidBy !== userId) {
      return res.status(403).json({ error: 'Only the payer can delete this expense' });
    }

    await db.run('DELETE FROM expense_participants WHERE expenseId = ?', [req.params.id]);
    await db.run('DELETE FROM expenses WHERE id = ?', [req.params.id]);

    if (expense.usedFromBudget === 1 && expense.expenseMonth) {
      const budget = await db.get('SELECT * FROM monthly_budgets WHERE month = ?', [expense.expenseMonth]);
      if (budget) {
        const refundedRemaining = Math.min(budget.remaining + expense.amount, budget.total);
        await db.run(
          'UPDATE monthly_budgets SET remaining = ?, updatedAt = CURRENT_TIMESTAMP WHERE month = ?',
          [refundedRemaining, expense.expenseMonth]
        );
      }
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expenses by category
router.get('/category/:category', async (req, res) => {
  try {
    const expenses = await db.all(
      'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC',
      [req.params.category]
    );
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
