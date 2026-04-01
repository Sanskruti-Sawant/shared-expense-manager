import React, { useState } from 'react';
import { MdAdd, MdHourglassBottom, MdCheckCircle, MdDateRange, MdEmojiEvents } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import { taskAPI } from '../utils/api';

function TaskTracker({ scrollY, tasks, users, onTasksChange }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await taskAPI.create(formData);
      setFormData({ title: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      setShowForm(false);
      onTasksChange();
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = tasks.filter(task => task.status !== 'completed');

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#E89B9B';
      case 'Medium': return '#D4A5A5';
      case 'Low': return '#C9B0D4';
      default: return '#D4A5A5';
    }
  };

  return (
    <section className="newsletter" id="tasks" style={{ backgroundColor: 'rgba(26, 10, 46, 0.6)' }}>
      <h2 className="section-title"><MdCheckCircle style={{ marginRight: '0.5rem', display: 'inline' }} />Household Tasks</h2>
      <p className="section-subtitle">Keep everyone organized and on track</p>

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
              <label>Task Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Clean the kitchen"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Assign To:</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
              >
                <option value="">Select member...</option>
                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Priority:</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Due Date:</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid rgba(192, 132, 168, 0.5)', backgroundColor: 'rgba(10, 0, 21, 0.7)', color: '#ffffff' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: '#9B7FB8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {loading ? <><MdHourglassBottom style={{ display: 'inline', marginRight: '0.3rem' }} />Adding...</> : <><MdCheckCircle style={{ display: 'inline', marginRight: '0.3rem' }} />Create Task</>}
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
          <MdAdd style={{ display: 'inline', marginRight: '0.3rem' }} />Add New Task
        </button>
      </div>

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {activeTasks.map((task, idx) => {
          const assignee = users.find(u => u.id === parseInt(task.assignedTo));
          return (
            <div key={idx} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: `3px solid ${getPriorityColor(task.priority)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#5B4B8A', marginBottom: '0.5rem' }}>
                {task.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9B8A95', marginBottom: '0.5rem' }}>
                <FaUser style={{ display: 'inline', marginRight: '0.3rem' }} />
                {assignee?.name || 'Unassigned'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9B8A95', marginBottom: '0.5rem' }}>
                <MdDateRange style={{ display: 'inline', marginRight: '0.3rem' }} />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <div style={{
                display: 'inline-block',
                padding: '0.3rem 0.8rem',
                background: getPriorityColor(task.priority),
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {task.priority} Priority
              </div>
            </div>
          );
        })}
      </div>

      {activeTasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9B8A95' }}>
          <MdEmojiEvents style={{ display: 'inline', marginRight: '0.3rem', fontSize: '2rem' }} />
          All tasks completed! Or add one to get started.
        </div>
      )}
    </section>
  );
}

export default TaskTracker;
