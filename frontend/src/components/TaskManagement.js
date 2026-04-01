import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI } from '../utils/api';
import '../styles/Dashboard.css';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        taskAPI.getAll(),
        userAPI.getAll()
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignedTo) {
      alert('Please fill required fields');
      return;
    }

    try {
      await taskAPI.create(newTask);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: ''
      });
      fetchData();
    } catch (error) {
      alert('Error creating task: ' + error.response?.data?.error);
    }
  };

  const handleUpdateTaskStatus = async (id, newStatus) => {
    try {
      const task = tasks.find(t => t.id === id);
      await taskAPI.update(id, { ...task, status: newStatus });
      fetchData();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Error deleting task');
      }
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      const statusMatch = filter === 'all' || task.status === filter;
      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  };

  const getPriorityClass = (priority) => `priority-${priority}`;

  if (loading) return <div className="loading">Loading tasks...</div>;

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const pendingCount = tasks.filter((task) => task.status !== 'completed').length;
  const highPriorityCount = tasks.filter((task) => task.priority === 'high').length;

  return (
    <div className="task-management">
      <div className="page-header">
        <div>
          <h2>Task Manager</h2>
          <p>Manage and track shared responsibilities</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
          + Add Task
        </button>
      </div>

      <div className="form-row">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select-field">
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="select-field">
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      <div className="stats-grid task-stats-grid">
        <div className="stats-card">
          <p className="stats-card-label">Completed</p>
          <p className="stats-card-value">{completedCount}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">Pending</p>
          <p className="stats-card-value">{pendingCount}</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-label">High Priority</p>
          <p className="stats-card-value">{highPriorityCount}</p>
        </div>
      </div>

      {showForm && (
      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="input-field"
          />
          <select
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            className="select-field"
          >
            <option value="">Assign to</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <textarea
          placeholder="Description (optional)"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="textarea-field"
          rows="2"
        />

        <div className="form-row">
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            className="select-field"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="input-field"
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Task</button>
      </form>
      )}

      <div className="tasks-list">
        {getFilteredTasks().length === 0 ? (
          <p className="no-data">No tasks to display.</p>
        ) : (
          getFilteredTasks().map(task => (
            <div key={task.id} className={`task-card ${task.status}`}>
              <div className="task-header">
                <div>
                  <h3>{task.title}</h3>
                  <p className="assigned-to">Assigned to: {task.assignedToName}</p>
                </div>
                <span className={`badge ${getPriorityClass(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-footer">
                {task.dueDate && (
                  <p className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                )}
                <div className="task-actions">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    className="select-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManagement;
