import React, { useState } from 'react';
import { expenseAPI } from '../utils/api';

function ExpenseTracker({ scrollY, expenses, users, onExpensesChange }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: 'Food',
    participants: []
  });

  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Transport', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.paidBy || formData.participants.length === 0) {
      alert('Please fill all fields and select participants');
      return;
    }

    try {
      setLoading(true);
      await expenseAPI.create(formData);
      setFormData({ description: '', amount: '', paidBy: '', category: 'Food', participants: [] });
      setShowForm(false);
      onExpensesChange();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentExpenses = expenses.slice(0, 4);

  return (
    <section className="products" id="expenses">
      <h2 className="section-title">📊 Recent Expenses</h2>
      <p className="section-subtitle">Tracking household spending</p>

      {showForm && (
        <div style={{
          background: '#F5DDE0',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Groceries"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #D4A5A5' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Amount:</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #D4A5A5' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Paid By:</label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #D4A5A5' }}
              >
                <option value="">Select member...</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #D4A5A5' }}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Split with:</label>
              {users.map(user => (
                <label key={user.id} style={{ display: 'block', margin: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, participants: [...formData.participants, user.id] });
                      } else {
                        setFormData({ ...formData, participants: formData.participants.filter(p => p !== user.id) });
                      }
                    }}
                  />
                  {' '}{user.name}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: '#9B7FB8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? '⏳ Adding...' : '✅ Add Expense'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.8rem', background: '#C9B0D4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.8rem 2rem',
            background: '#9B7FB8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ➕ Add New Expense
        </button>
      </div>

      <div className="product-grid">
        {recentExpenses.map((expense, idx) => (
          <div key={idx} className="product-card">
            <div className="product-image">
              <div style={{ fontSize: '2rem' }}>💸</div>
            </div>
            <div className="product-info">
              <div className="product-name">{expense.description}</div>
              <div style={{ fontSize: '0.85rem', color: '#9B8A95', marginBottom: '0.5rem' }}>
                {expense.category}
              </div>
              <div className="product-price">${expense.amount}</div>
              <div style={{ fontSize: '0.75rem', color: '#9B8A95', marginTop: '0.5rem' }}>
                {new Date(expense.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      {expenses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9B8A95' }}>
          No expenses recorded yet. Add one to get started! 👆
        </div>
      )}
    </section>
  );
}

export default ExpenseTracker;
