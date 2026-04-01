import React, { useState, useEffect } from 'react';
import { userAPI, settlementAPI } from '../utils/api';
import '../styles/Dashboard.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState({});
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, balancesRes] = await Promise.all([
        userAPI.getAll(),
        settlementAPI.getBalances()
      ]);
      setUsers(usersRes.data);
      setBalances(balancesRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name) {
      alert('Please enter a name');
      return;
    }

    try {
      await userAPI.create(newUser);
      setNewUser({ name: '', email: '' });
      fetchUsers();
    } catch (error) {
      alert('Error creating user: ' + error.response?.data?.error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await userAPI.delete(id);
        fetchUsers();
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  const balanceData = users.map((user) => ({
    name: user.name,
    balance: balances[user.id]?.balance || 0
  }));

  const totalPositive = balanceData
    .filter((item) => item.balance > 0)
    .reduce((sum, item) => sum + item.balance, 0);
  const totalNegative = Math.abs(
    balanceData.filter((item) => item.balance < 0).reduce((sum, item) => sum + item.balance, 0)
  );

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h2>Balance Overview</h2>
          <p>Track who owes whom and settle balances</p>
        </div>
      </div>

      <div className="stats-grid task-stats-grid">
        <div className="stats-card">
          <p className="stats-card-label">Active Users</p>
          <p className="stats-card-value">{users.length}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">Total Owing You</p>
          <p className="stats-card-value" style={{ color: '#D5B0D8' }}>₹{totalPositive.toFixed(2)}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">Total You Owe</p>
          <p className="stats-card-value" style={{ color: '#B492B5' }}>₹{totalNegative.toFixed(2)}</p>
        </div>
      </div>

      <div className="user-list-section">
        <h3>Member Details</h3>
      </div>

      <div className="page-header" style={{ marginTop: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Manage Members</h2>
          <p>Add or remove household members</p>
        </div>
      </div>
      
      <form onSubmit={handleAddUser} className="add-user-form">
        <input
          type="text"
          placeholder="Member Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="input-field"
        />
        <button type="submit" className="btn btn-primary">+ Add Member</button>
      </form>

      <div className="users-list">
        {users.length === 0 ? (
          <p className="no-data">No members added yet.</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <h3>{user.name}</h3>
                {user.email && <p>{user.email}</p>}
              </div>
              <button 
                onClick={() => handleDeleteUser(user.id)}
                className="btn btn-danger"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;
