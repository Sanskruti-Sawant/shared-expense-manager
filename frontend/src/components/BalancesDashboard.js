import React, { useState, useEffect } from 'react';
import { settlementAPI, userAPI } from '../utils/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import '../styles/Dashboard.css';

const BalancesDashboard = () => {
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balancesRes, settlesRes, usersRes] = await Promise.all([
        settlementAPI.getBalances(),
        settlementAPI.getSuggestions(),
        userAPI.getAll()
      ]);
      setBalances(balancesRes.data);
      setSettlements(settlesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (fromUser, toUser, amount) => {
    try {
      await settlementAPI.create({ fromUser, toUser, amount });
      alert('Payment recorded!');
      fetchData();
    } catch (error) {
      alert('Error recording payment');
    }
  };

  const chartData = users.map(user => ({
    name: user.name,
    balance: balances[user.id]?.balance || 0
  }));

  const totalExpenses = chartData.reduce((sum, item) => sum + Math.abs(item.balance), 0);
  const yourBalance = chartData.reduce((sum, item) => sum + item.balance, 0);
  const completedTasks = settlements.length;
  const totalTransactions = users.length + settlements.length;

  const trendData = [
    { month: 'Jan', amount: 2200 },
    { month: 'Feb', amount: 1800 },
    { month: 'Mar', amount: 3200 },
    { month: 'Apr', amount: 2100 },
    { month: 'May', amount: 2800 },
    { month: 'Jun', amount: 3600 }
  ];

  const categoryData = [
    { name: 'Rent', value: 75, color: '#3E1444' },
    { name: 'Utilities', value: 12, color: '#260C35' },
    { name: 'Groceries', value: 8, color: '#8A6492' },
    { name: 'Food', value: 3, color: '#B492B5' },
    { name: 'Other', value: 2, color: '#D5B0D8' }
  ];

  if (loading) return <div className="loading">Loading balances...</div>;

  return (
    <div className="balances-dashboard">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's your overview</p>
        </div>
        <div className="page-header-meta">
          Current Period
          <strong>March 2026</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <p className="stats-card-label">Total Expenses</p>
          <p className="stats-card-value">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">Your Balance</p>
          <p className="stats-card-value" style={{ color: '#D5B0D8' }}>₹{Math.abs(yourBalance).toFixed(2)}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">Completed Tasks</p>
          <p className="stats-card-value">{completedTasks}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">Total Transactions</p>
          <p className="stats-card-value">{totalTransactions}</p>
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: '1rem' }}>
        <div className="chart-section">
          <h3>Spending Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(213,176,216,0.22)" />
              <XAxis dataKey="month" stroke="#D5B0D8" />
              <YAxis stroke="#D5B0D8" />
              <Tooltip contentStyle={{ background: '#260C35', border: '1px solid rgba(213,176,216,0.45)' }} />
              <Line type="monotone" dataKey="amount" stroke="#B492B5" strokeWidth={3} dot={{ r: 6, fill: '#B492B5', stroke: '#B492B5' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#260C35', border: '1px solid rgba(213,176,216,0.45)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="balances-grid">
        {users.map(user => {
          const balance = balances[user.id]?.balance || 0;
          const isDebt = balance < 0;
          
          return (
            <div key={user.id} className="balance-card">
              <h3>{user.name}</h3>
              <div className={`balance-amount ${isDebt ? 'debt' : 'credit'}`}>
                {isDebt ? 'Owes: ' : 'Gets back: '}₹{Math.abs(balance).toFixed(2)}
              </div>
              <p className="balance-status">
                {balance === 0 ? 'All settled' : isDebt ? 'Needs to pay' : 'Should receive'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="chart-section">
        <h3>User Balances</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(213,176,216,0.22)" />
            <XAxis dataKey="name" stroke="#D5B0D8" />
            <YAxis stroke="#D5B0D8" />
            <Tooltip 
              formatter={(value) => `₹${value.toFixed(2)}`}
              contentStyle={{ background: '#260C35', border: '1px solid rgba(213,176,216,0.45)' }}
            />
            <Bar dataKey="balance" fill="#B492B5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="settlements-section">
        <h3>Settlement Suggestions</h3>
        {settlements.length === 0 ? (
          <p className="no-data">Everyone is settled!</p>
        ) : (
          <div className="settlements-list">
            {settlements.map((settlement, idx) => {
              const fromUser = users.find(u => u.id === settlement.from);
              const toUser = users.find(u => u.id === settlement.to);
              
              return (
                <div key={idx} className="settlement-card">
                  <div className="settlement-info">
                    <p>
                      <strong>{fromUser?.name}</strong> owes <strong>₹{settlement.amount.toFixed(2)}</strong> to <strong>{toUser?.name}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRecordPayment(settlement.from, settlement.to, settlement.amount)}
                    className="btn btn-success"
                  >
                    Mark as Paid
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BalancesDashboard;
