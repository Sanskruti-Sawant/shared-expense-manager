import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ExpenseTracker from './components/ExpenseTracker';
import TaskTracker from './components/TaskTracker';
import SettlementSummary from './components/SettlementSummary';
import ProfilePage from './components/ProfilePage';
import Footer from './components/Footer';

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://shared-expense-backend.onrender.com/api'
  : 'http://localhost:5000/api';

function MainApp() {
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [settlements, setSettlements] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, expensesRes, tasksRes, settlementsRes] = await Promise.all([
        fetch(`${API_BASE}/users`, { headers }),
        fetch(`${API_BASE}/expenses`, { headers }),
        fetch(`${API_BASE}/tasks`, { headers }),
        fetch(`${API_BASE}/settlements/balances`, { headers })
      ]);

      if (usersRes.ok) {
        const userData = await usersRes.json();
        console.log('Users fetched:', userData.length, 'members -', userData.map(u => u.name).join(', '));
        setUsers(userData);
      } else {
        console.error('Users API error:', usersRes.status);
        setUsers([]);
      }
      
      if (expensesRes.ok) setExpenses(await expensesRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (settlementsRes.ok) setSettlements(await settlementsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchData();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'members', label: 'Members' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'settlements', label: 'Settlements' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard scrollY={scrollY} users={users} expenses={expenses} settlements={settlements} loading={loading} />;
      case 'members':
        return <UserManagement scrollY={scrollY} users={users} onUsersChange={handleRefresh} />;
      case 'expenses':
        return <ExpenseTracker scrollY={scrollY} expenses={expenses} users={users} onExpensesChange={handleRefresh} />;
      case 'tasks':
        return <TaskTracker scrollY={scrollY} tasks={tasks} users={users} onTasksChange={handleRefresh} />;
      case 'settlements':
        return <SettlementSummary scrollY={scrollY} settlements={settlements} />;
      default:
        return <Dashboard scrollY={scrollY} users={users} expenses={expenses} settlements={settlements} loading={loading} />;
    }
  };

  return (
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/*"
        element={
          <div className="App">
            <Header scrollY={scrollY} userCount={users.length} onRefresh={handleRefresh} />
            
            <div className="tabs-container">
              <div className="tabs-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tab-content">
              {renderContent()}
            </div>

            <Footer />
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}

export default App;
