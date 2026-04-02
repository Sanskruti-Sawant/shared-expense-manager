import React, { useState } from 'react';
import { userAPI } from '../utils/api';

function UserManagement({ scrollY, users, onUsersChange }) {
  const [newUserName, setNewUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      // Add member to backend
      const response = await userAPI.create({ name: newUserName });
      console.log('Member added successfully:', response.data);
      
      // Clear input
      setNewUserName('');
      
      // Wait a moment then refresh data to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      onUsersChange();
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setError('Error adding member: ' + errorMsg);
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="categories">
      <h2 className="section-title" style={{ marginBottom: '1rem' }}>👥 Household Members</h2>
      
      {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleAddUser} style={{ maxWidth: '600px', margin: '0 auto 2rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Enter member name..."
          style={{
            flex: 1,
            padding: '0.8rem 1rem',
            border: '1px solid #D4A5A5',
            borderRadius: '4px',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.9rem'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.8rem 1.5rem',
            background: '#9B7FB8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s'
          }}
        >
          {loading ? '⏳' : '➕ Add'}
        </button>
      </form>

      <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {users.map((user) => (
          <div key={user.id} className="category-card">
            <h3>👤</h3>
            <h3 style={{ fontSize: '1.3rem' }}>{user.name}</h3>
            <p>Member</p>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9B8A95' }}>
            No members yet. Add one to get started! 👆
          </div>
        )}
      </div>
    </section>
  );
}

export default UserManagement;
