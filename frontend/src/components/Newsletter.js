import React, { useState } from 'react';

function TaskTracker({ scrollY, tasks, users, onTasksChange }) {
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        setNewTask({ title: '', assignedTo: '', priority: 'Medium', dueDate: '' });
        onTasksChange();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 3);

  return (
    <section className="newsletter" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
      <div className="newsletter-content">
        <h2>✓ Household Tasks</h2>
        <p>Keep track of chores and responsibilities. Assign tasks to stay organized together.</p>
        
        <form onSubmit={handleAddTask} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Task title (e.g., Clean kitchen)"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #D4A5A5', borderRadius: '4px', marginBottom: '0.5rem' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              style={{ padding: '0.8rem', border: '1px solid #D4A5A5', borderRadius: '4px' }}
            >
              <option value="">Assign to...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              style={{ padding: '0.8rem', border: '1px solid #D4A5A5', borderRadius: '4px' }}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #D4A5A5', borderRadius: '4px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              background: '#9B7FB8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Adding...' : '✅ Create Task'}
          </button>
        </form>

        <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Active Tasks</h3>
          {activeTasks.length > 0 ? (
            <ul style={{ color: 'white', listStyle: 'none' }}>
              {activeTasks.map((task, idx) => (
                <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  • {task.title}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>No active tasks yet!</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default TaskTracker;
