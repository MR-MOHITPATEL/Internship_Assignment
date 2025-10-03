import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, taskAPI } from '../services/api';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Profile from './Profile';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchTasks();
    fetchStats();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filterStatus]);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const params = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50
      };
      
      const response = await taskAPI.getTasks(params);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      const code = error.status ? ` (status ${error.status})` : '';
      const msg = error.message || 'Failed to load tasks';
      setError(`${msg}${code}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await taskAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      setTasks([response.data.task, ...tasks]);
      setShowTaskForm(false);
      setError('');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to add task:', error);
      const code = error.status ? ` (status ${error.status})` : '';
      const msg = error.message || 'Failed to create task';
      setError(`${msg}${code}`);
    }
  };

  const handleEditTask = async (taskId, taskData) => {
    try {
      const response = await taskAPI.updateTask(taskId, taskData);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      setEditingTask(null);
      setShowTaskForm(false);
      setError('');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to edit task:', error);
      const code = error.status ? ` (status ${error.status})` : '';
      const msg = error.message || 'Failed to update task';
      setError(`${msg}${code}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.deleteTask(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
        setError('');
        fetchStats(); // Refresh stats
      } catch (error) {
        console.error('Failed to delete task:', error);
        const code = error.status ? ` (status ${error.status})` : '';
        const msg = error.message || 'Failed to delete task';
        setError(`${msg}${code}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Dashboard</h1>
        <div className="header-actions">
          <div className="user-profile-section">
            <div className="user-avatar" onClick={() => navigate('/profile')}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div 
              className="welcome-section"
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/profile'); }}
            >
              <span className="welcome-text">
                Welcome back, {user?.name || 'User'}!
              </span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <Profile user={user} stats={stats} />
        </div>

        <div className="dashboard-main">
          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Your Tasks</h2>
              <button 
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
                className="add-task-button"
              >
                + Add Task
              </button>
            </div>

            <div className="tasks-filters">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <TaskList
              tasks={filteredTasks}
              onEdit={startEditTask}
              onDelete={handleDeleteTask}
            />
            {user && filteredTasks.length === 0 && (
              <div>No tasks found.</div>
            )}
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleEditTask(editingTask._id, data) : 
            handleAddTask
          }
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
