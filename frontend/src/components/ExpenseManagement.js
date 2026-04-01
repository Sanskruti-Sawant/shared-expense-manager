import React, { useState, useEffect } from 'react';
import { expenseAPI, userAPI } from '../utils/api';
import '../styles/Dashboard.css';

const ExpenseManagement = () => {
  const initialMonth = new Date().toISOString().slice(0, 7);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [monthlyBudget, setMonthlyBudget] = useState({ month: initialMonth, total: 0, remaining: 0 });
  const [budgetInput, setBudgetInput] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: 'Food',
    splitWith: [],
    useBudget: false
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMonthlyBudget(selectedMonth);
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      const [expensesRes, usersRes] = await Promise.all([
        expenseAPI.getAll(),
        userAPI.getAll()
      ]);
      setExpenses(expensesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyBudget = async (month) => {
    try {
      const budgetRes = await expenseAPI.getMonthlyBudget(month);
      setMonthlyBudget(budgetRes.data);
      setBudgetInput(budgetRes.data.total ? String(budgetRes.data.total) : '');
    } catch (error) {
      console.error('Error fetching monthly budget:', error);
    }
  };

  const handleSaveBudget = async () => {
    if (budgetInput === '' || Number(budgetInput) < 0) {
      alert('Please enter a valid monthly budget amount');
      return;
    }

    try {
      const saved = await expenseAPI.setMonthlyBudget(selectedMonth, Number(budgetInput));
      setMonthlyBudget(saved.data);
      alert(`Monthly budget saved for ${selectedMonth}`);
    } catch (error) {
      alert('Error saving monthly budget: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.paidBy) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const splitWith = newExpense.splitWith.length > 0 
        ? newExpense.splitWith 
        : [newExpense.paidBy];
      
      await expenseAPI.create({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        splitWith,
        expenseMonth: selectedMonth,
        useBudget: newExpense.useBudget
      });
      
      setNewExpense({
        description: '',
        amount: '',
        paidBy: '',
        category: 'Food',
        splitWith: [],
        useBudget: false
      });
      fetchData();
      fetchMonthlyBudget(selectedMonth);
    } catch (error) {
      alert('Error creating expense: ' + error.response?.data?.error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        fetchData();
        fetchMonthlyBudget(selectedMonth);
      } catch (error) {
        alert('Error deleting expense');
      }
    }
  };

  const toggleSplit = (userId) => {
    setNewExpense(prev => ({
      ...prev,
      splitWith: prev.splitWith.includes(userId)
        ? prev.splitWith.filter(id => id !== userId)
        : [...prev.splitWith, userId]
    }));
  };

  const categories = ['Food', 'Utilities', 'Rent', 'Entertainment', 'Transportation', 'Other'];
  const totalBudget = Number(monthlyBudget.total || 0);
  const remainingBudget = Number(monthlyBudget.remaining || 0);
  const usedBudget = Math.max(totalBudget - remainingBudget, 0);
  const usagePercent = totalBudget > 0 ? Math.min((usedBudget / totalBudget) * 100, 100) : 0;
  const remainingPercent = totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0;
  const budgetStatusClass = remainingPercent <= 10
    ? 'budget-critical'
    : remainingPercent <= 30
      ? 'budget-warning'
      : 'budget-safe';
  
  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = filter === 'all' || expense.category === filter;
    const matchesSearch = expense.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="expense-management">
      <div className="page-header">
        <div>
          <h2>Expense Manager</h2>
          <p>Track and manage shared expenses</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          + Add Expense
        </button>
      </div>

      <div className="form-row">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Set monthly budget"
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          className="input-field"
          step="0.01"
          min="0"
        />
        <button type="button" className="btn btn-primary" onClick={handleSaveBudget}>
          Save Budget
        </button>
      </div>

      <div className="budget-summary-card">
        <p><strong>Month:</strong> {selectedMonth}</p>
        <p><strong>Total Budget:</strong> ₹{totalBudget.toFixed(2)}</p>
        <p><strong>Used:</strong> ₹{usedBudget.toFixed(2)}</p>
        <p><strong>Remaining:</strong> ₹{remainingBudget.toFixed(2)}</p>
        <div className={`budget-progress ${budgetStatusClass}`}>
          <div
            className="budget-progress-fill"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className={`budget-status-text ${budgetStatusClass}`}>
          {totalBudget === 0
            ? 'Set a budget to start tracking monthly usage.'
            : `${usagePercent.toFixed(1)}% used this month`}
        </p>
      </div>

      <div className="form-row">
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select-field">
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {showForm && (
      <form onSubmit={handleAddExpense} className="add-expense-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Expense description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            className="input-field"
            step="0.01"
          />
        </div>

        <div className="form-row">
          <select
            value={newExpense.paidBy}
            onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
            className="select-field"
          >
            <option value="">Who paid?</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>

          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            className="select-field"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="split-section">
          <p>Split with:</p>
          <div className="split-checkboxes">
            {users.map(user => (
              <label key={user.id}>
                <input
                  type="checkbox"
                  checked={newExpense.splitWith.includes(user.id)}
                  onChange={() => toggleSplit(user.id)}
                />
                {user.name}
              </label>
            ))}
          </div>
        </div>

        <div className="split-section">
          <label>
            <input
              type="checkbox"
              checked={newExpense.useBudget}
              onChange={(e) => setNewExpense({ ...newExpense, useBudget: e.target.checked })}
            />
            Use monthly budget for this expense (debits from remaining)
          </label>
        </div>

        <button type="submit" className="btn btn-primary">Add Expense</button>
      </form>
      )}

      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <p className="no-data">No expenses recorded yet.</p>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-info">
                <h3>{expense.description}</h3>
                <p className="category">{expense.category}</p>
                {expense.usedFromBudget === 1 && <p className="category">Debited from monthly budget</p>}
                <p className="date">{new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div className="expense-amount">
                <span className="amount">₹{expense.amount.toFixed(2)}</span>
                <p className="by">{expense.paidByName}</p>
              </div>
              <button 
                onClick={() => handleDeleteExpense(expense.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseManagement;
