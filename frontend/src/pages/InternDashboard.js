import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:4022/api';

const InternDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All'
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE}/projects/intern/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching intern tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getDeadlineState = (task) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadline = new Date(task.deadline);
    const taskDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    
    if (task.status === 'Completed') return 'completed';
    
    if (taskDeadline < today) return 'overdue';
    
    if (taskDeadline.getTime() === today.getTime()) return 'today';
    
    return 'upcoming';
  };

  const getDeadlineBadgeClass = (state) => {
    switch (state) {
      case 'overdue': return 'badge bg-danger text-white';
      case 'today': return 'badge bg-warning text-dark';
      case 'completed': return 'badge bg-success text-white';
      default: return 'badge bg-info text-white';
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE}/projects/intern/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
      }

      await fetchTasks();
    } catch (error) {
      console.error('Status update error:', error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status !== 'All' && task.status !== filters.status) return false;
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, filters]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const overdue = tasks.filter(t => getDeadlineState(t) === 'overdue').length;

    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks
      .filter(task => {
        if (task.status === 'Completed') return false;
        const deadline = new Date(task.deadline);
        const taskDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
        return taskDay >= today && taskDay <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [tasks]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" 
           style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <div className="navbar-brand fw-bold fs-3 p-0" 
               style={{ 
                 background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', 
                 WebkitBackgroundClip: 'text', 
                 WebkitTextFillColor: 'transparent' 
               }}>
            Intern Dashboard
          </div>
          <div className="d-flex align-items-center">
            <span className="me-3 text-muted small">
              Welcome, <strong>{user?.userName}</strong>
              <span className="badge bg-success ms-2">Intern</span>
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              <i className="fas fa-sign-out-alt me-1"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row g-3 mb-5">
          <div className="col-sm-6 col-md-3 col-lg-2">
            <div className="card border-0 shadow-sm h-100 text-center hover:shadow-lg transition-all">
              <div className="card-body py-4">
                <div className="text-muted text-uppercase small fw-semibold mb-2">Total Tasks</div>
                <div className="fs-3 fw-bold text-primary">{summary.total}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-2">
            <div className="card border-0 shadow-sm h-100 text-center hover:shadow-lg transition-all bg-warning bg-opacity-10">
              <div className="card-body py-4">
                <div className="text-muted text-uppercase small fw-semibold mb-2">Pending</div>
                <div className="fs-3 fw-bold text-warning">{summary.pending}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-2">
            <div className="card border-0 shadow-sm h-100 text-center hover:shadow-lg transition-all bg-info bg-opacity-10">
              <div className="card-body py-4">
                <div className="text-muted text-uppercase small fw-semibold mb-2">In Progress</div>
                <div className="fs-3 fw-bold text-info">{summary.inProgress}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-2">
            <div className="card border-0 shadow-sm h-100 text-center hover:shadow-lg transition-all bg-success bg-opacity-10">
              <div className="card-body py-4">
                <div className="text-muted text-uppercase small fw-semibold mb-2">Completed</div>
                <div className="fs-3 fw-bold text-success">{summary.completed}</div>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-2">
            <div className="card border-0 shadow-sm h-100 text-center hover:shadow-lg transition-all bg-danger bg-opacity-10">
              <div className="card-body py-4">
                <div className="text-muted text-uppercase small fw-semibold mb-2">Overdue</div>
                <div className="fs-3 fw-bold text-danger">{summary.overdue}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg mb-4">
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">My Tasks ({filteredTasks.length})</h5>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm shadow-sm"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <select
                      className="form-select form-select-sm shadow-sm"
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="All">All Priority</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No tasks found</h5>
                    <p className="text-muted mb-0">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {filteredTasks.map((task) => {
                      const deadlineState = getDeadlineState(task);
                      const deadlineLabel = deadlineState === 'overdue' ? 'Overdue' : 
                                          deadlineState === 'today' ? 'Due Today' : 
                                          deadlineState === 'completed' ? 'Completed' : 'Upcoming';
                      
                      return (
                        <div key={task._id} className="list-group-item px-4 py-3 border-bottom">
                          <div className="row align-items-center g-3">
                            <div className="col-md-8">
                              <div className="d-flex align-items-start mb-2">
                                <div className={`me-3 mt-1 ${deadlineState === 'overdue' ? 'text-danger' : 
                                              deadlineState === 'today' ? 'text-warning' : ''}`}>
                                  <i className={`fas fa-circle fa-lg ${deadlineState === 'overdue' ? 'opacity-75' : ''}`}></i>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1 fw-bold">{task.title}</h6>
                                  <p className="small text-muted mb-2">{task.description}</p>
                                  <div className="d-flex flex-wrap gap-2 small">
                                    <span className={`badge ${task.priority === 'High' ? 'bg-danger' : 
                                                   task.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                      {task.priority}
                                    </span>
                                    <span className={getDeadlineBadgeClass(deadlineState)}>
                                      {deadlineLabel} • {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                    <span className="badge bg-light text-dark">
                                      {task.projectName || 'No Project'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <select
                                className="form-select form-select-sm"
                                value={task.status}
                                disabled={updatingTaskId === task._id}
                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                              {updatingTaskId === task._id && (
                                <div className="mt-1 text-center">
                                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Updating...</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-transparent border-0 pb-0">
                <h6 className="fw-bold mb-0">Upcoming Deadlines</h6>
              </div>
              <div className="card-body py-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-calendar-check fa-2x mb-2"></i>
                    <p className="small mb-0">No deadlines in next 7 days</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {upcomingDeadlines.map((task) => (
                      <div key={task._id} className="list-group-item px-0 py-2 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold small mb-0">{task.title}</div>
                            <div className="text-muted small">{task.projectName || 'No Project'}</div>
                          </div>
                          <span className="badge bg-light text-dark small">
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 pb-0">
                <h6 className="fw-bold mb-2">Status Legend</h6>
              </div>
              <div className="card-body py-3 small">
                <div className="mb-2">
                  <span className="badge bg-danger me-2">●</span>
                  <span className="text-muted">Overdue</span>
                </div>
                <div className="mb-2">
                  <span className="badge bg-warning text-dark me-2">●</span>
                  <span className="text-muted">Due Today</span>
                </div>
                <div className="mb-2">
                  <span className="badge bg-success me-2">●</span>
                  <span className="text-muted">Completed</span>
                </div>
                <div>
                  <span className="badge bg-info me-2">●</span>
                  <span className="text-muted">Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
