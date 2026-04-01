import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard({ scrollY, users, expenses, settlements, loading }) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const averagePerPerson = users.length > 0 ? (totalExpenses / users.length).toFixed(2) : 0;

  // Prepare data for balance chart
  const balanceData = users.map(user => ({
    name: user.name,
    balance: settlements[user.name] || 0
  }));

  return (
    <section className="dashboard-page">
      <div className="dashboard-stats">
        <div className="stats-card">
          <div className="stats-card-label">Total Members</div>
          <div className="stats-card-value">{users.length}</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-label">Total Expenses</div>
          <div className="stats-card-value">₹{totalExpenses.toFixed(2)}</div>
        </div>
        <div className="stats-card">
          <div className="stats-card-label">Per Person Avg</div>
          <div className="stats-card-value">₹{averagePerPerson}</div>
        </div>
      </div>

      <div className="balances-section">
        <h2 className="section-title">User Balances</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={balanceData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(192, 132, 168, 0.2)" />
              <XAxis dataKey="name" tick={{ fill: '#d8b3d0' }} />
              <YAxis tick={{ fill: '#d8b3d0' }} />
              <Tooltip 
                contentStyle={{ background: 'rgba(30, 20, 50, 0.9)', border: '2px solid #c084a8', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(192, 132, 168, 0.1)' }}
              />
              <Bar dataKey="balance" fill="#d8a4b8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
