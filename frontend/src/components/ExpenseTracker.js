import React, { useState } from 'react';
import { MdAdd, MdHourglassBottom, MdCheckCircle, MdBarChart, MdTrendingUp, MdRestaurant, MdHome, MdLightbulb, MdMovie, MdDirectionsCar, MdLocalShipping } from 'react-icons/md';
import { expenseAPI } from '../utils/api';

function ExpenseTracker({ scrollY, expenses, users, onExpensesChange }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [budgetInputValue, setBudgetInputValue] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expensesBudgetMap, setExpensesBudgetMap] = useState({});
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: 'Food',
    participants: [],
    deductFromBudget: true
  });

  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Transport', 'Other'];

  const categoryIcons = {
    Food: <MdRestaurant />,
    Rent: <MdHome />,
    Utilities: <MdLightbulb />,
    Entertainment: <MdMovie />,
    Transport: <MdDirectionsCar />,
    Other: <MdLocalShipping />
  };

  const calculateByCategory = () => {
    const byCategory = {};
    categories.forEach(cat => byCategory[cat] = 0);

    expenses.forEach(exp => {
      if (byCategory.hasOwnProperty(exp.category)) {
        byCategory[exp.category] += parseFloat(exp.amount || 0);
      }
    });

    return byCategory;
  };

  const calculateBudgetRemaining = () => {
    const totalDeductions = expenses.reduce((sum, exp) => {
      return (expensesBudgetMap[exp.id] !== false) ? sum + parseFloat(exp.amount || 0) : sum;
    }, 0);
    return monthlyBudget - totalDeductions;
  };

  const getPaidByName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.paidBy || formData.participants.length === 0) {
      alert('Please fill all fields and select participants');
      return;
    }

    try {
      setLoading(true);
      const newExpense = await expenseAPI.create(formData);
      if (formData.deductFromBudget) {
        setExpensesBudgetMap({
          ...expensesBudgetMap,
          [newExpense.data.id]: true
        });
      }
      setFormData({ description: '', amount: '', paidBy: '', category: 'Food', participants: [], deductFromBudget: true });
      setShowForm(false);
      onExpensesChange();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const recentExpenses = expenses.slice(0, 4);

  return (
    <section className="products" id="expenses">
      {/* Monthly Budget Section */}
      <div style={{
        background: 'rgba(155, 127, 184, 0.1)',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        borderLeft: '4px solid #9B7FB8'
      }}>
        <h2 className="section-title"><MdTrendingUp style={{ marginRight: '0.5rem', display: 'inline' }} />Monthly Budget</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d8b3d0', fontWeight: '600' }}>Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #9B7FB8',
                backgroundColor: '#2a1f3d',
                color: '#fff',
                fontSize: '1rem'
              }}
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d8b3d0', fontWeight: '600' }}>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #9B7FB8',
                backgroundColor: '#2a1f3d',
                color: '#fff',
                fontSize: '1rem'
              }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="number"
              value={budgetInputValue}
              onChange={(e) => setBudgetInputValue(e.target.value)}
              placeholder="Enter monthly budget amount"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #9B7FB8',
                backgroundColor: '#2a1f3d',
                color: '#fff',
                fontSize: '1rem'
              }}
            />
          </div>
          <button
            onClick={() => {
              if (budgetInputValue && !isNaN(budgetInputValue)) {
                setMonthlyBudget(parseFloat(budgetInputValue));
                setBudgetInputValue('');
              }
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#9B7FB8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Set Budget
          </button>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#a89aad' }}>
          Selected: {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth]} {selectedYear}
        </div>
        {monthlyBudget > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '1rem', color: '#d8b3d0', marginBottom: '0.5rem' }}>
              Budget: <span style={{ fontWeight: '700', color: '#9B7FB8' }}>₹{monthlyBudget.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: '1rem', color: '#d8b3d0', marginBottom: '0.5rem' }}>
              Spent: <span style={{ fontWeight: '700', color: '#c084a8' }}>₹{(monthlyBudget - calculateBudgetRemaining()).toFixed(2)}</span>
            </div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '700',
              color: calculateBudgetRemaining() >= 0 ? '#4CAF50' : '#ff6b6b'
            }}>
              Remaining: ₹{calculateBudgetRemaining().toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <h2 className="section-title"><MdBarChart style={{ marginRight: '0.5rem', display: 'inline' }} />Recent Expenses</h2>
      <p className="section-subtitle">Tracking household spending</p>

      {showForm && (
        <div style={{
          background: 'rgba(155, 127, 184, 0.2)',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          border: '1px solid rgba(192, 132, 168, 0.3)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Groceries"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
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
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Paid By:</label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
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
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Split with:</label>
              {users.map(user => (
                <label key={user.id} style={{ display: 'block', margin: '0.5rem 0', color: '#d8b3d0' }}>
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
            <div style={{ marginBottom: '1rem', color: '#d8b3d0' }}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.deductFromBudget}
                  onChange={(e) => setFormData({ ...formData, deductFromBudget: e.target.checked })}
                />
                {' '}Deduct from Monthly Budget
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: '#9B7FB8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? <><MdHourglassBottom style={{ display: 'inline', marginRight: '0.3rem' }} />Adding...</> : <><MdCheckCircle style={{ display: 'inline', marginRight: '0.3rem' }} />Add Expense</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.8rem', background: '#C9B0D4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {recentExpenses.length > 0 && (
          <div>
            {recentExpenses.map((expense, index) => (
              <div key={index} style={{
                background: 'rgba(192, 132, 168, 0.1)',
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                borderLeft: '4px solid #c084a8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{expense.description}</div>
                  <div style={{ fontSize: '0.9rem', color: '#d8b3d0' }}>{expense.category}</div>
                  <div style={{ fontSize: '0.85rem', color: '#9B7FB8', marginTop: '0.3rem' }}>Paid by: <span style={{ fontWeight: '600' }}>{getPaidByName(expense.paidBy)}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#c084a8' }}>₹{parseFloat(expense.amount).toFixed(2)}</div>
                  <div style={{ fontSize: '0.8rem', color: '#d8b3d0' }}>{new Date(expense.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <MdAdd style={{ display: 'inline', marginRight: '0.3rem' }} />Add New Expense
        </button>
      </div>

      {/* Budget Overview Section */}
      <section className="budget-section" style={{ marginTop: '3rem', background: 'rgba(155, 127, 184, 0.1)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #9B7FB8' }}>
        <h2 className="section-title"><MdTrendingUp style={{ marginRight: '0.5rem', display: 'inline' }} />Spending by Category</h2>
        <p className="section-subtitle">Where your money goes</p>

        <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '2rem' }}>
          {categories.map(cat => {
            const byCategory = calculateByCategory();
            const amount = byCategory[cat] || 0;
            const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;

            return (
              <div key={cat} className="category-card" style={{
                background: 'rgba(192, 132, 168, 0.1)',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '3px solid #9B7FB8'
              }}>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{categoryIcons[cat] || <MdBarChart />}</h3>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#d8b3d0' }}>{cat}</h3>
                <p style={{ fontSize: '0.9rem', color: '#9B7FB8', fontWeight: '600', marginBottom: '0.3rem' }}>
                  ₹{amount.toFixed(2)}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#d8b3d0' }}>
                  {percentage}%
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1.5rem', background: 'rgba(212, 165, 165, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#9B8A95', marginBottom: '0.5rem' }}>Total Spending</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9B7FB8' }}>₹{Object.values(calculateByCategory()).reduce((a, b) => a + b, 0).toFixed(2)}</div>
        </div>
      </section>
    </section>
  );
}

export default ExpenseTracker;
