import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';
import ProjectCard from '../components/ProjectCard';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null); 

  const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:4022/api';

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setProjects(data.projects || data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const fetchInterns = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/projects/interns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setInterns(data.interns || data || []);
    } catch (error) {
      console.error('Error fetching interns:', error);
      setInterns([]);
    }
  }, [API_BASE]);

  const handleDeleteProject = useCallback(async (projectId) => {
    try {
      setDeletingProject(projectId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      console.log(`Project ${projectId} deleted successfully`);
      fetchProjects();
    } catch (error) {
      console.error('Delete project error:', error);
      alert(`Failed to delete project: ${error.message}`);
    } finally {
      setDeletingProject(null);
    }
  }, [API_BASE, fetchProjects]);

  const handleEditTask = useCallback((taskData) => {
    console.log('🔄 Editing task:', taskData);
    setEditingTask(taskData);
    setSelectedProject(taskData.projectId ? projects.find(p => p._id === taskData.projectId) : null);
    setShowTaskModal(true);
  }, [projects]);

  const handleDeleteTask = useCallback(async (projectId, taskId) => {
    if (window.confirm(`Delete this task? This action cannot be undone.`)) {
      try {
        setDeletingTask({ projectId, taskId });
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Delete failed');
        }

        console.log(`Task ${taskId} deleted successfully`);
        fetchProjects();
      } catch (error) {
        console.error('Delete task error:', error);
        alert(`Failed to delete task: ${error.message}`);
      } finally {
        setDeletingTask(null);
      }
    }
  }, [API_BASE, fetchProjects]);

  useEffect(() => {
    fetchProjects();
    fetchInterns();
  }, [fetchProjects, fetchInterns]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
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
            Admin Panel
          </div>
          <div className="d-flex align-items-center">
            <span className="me-3 text-muted">
              Welcome, <strong>{user?.userName}</strong> 
              <span className="badge bg-primary ms-2">{projects.length} Projects</span>
            </span>
            <button className="btn btn-danger btn-sm" onClick={logout}>
              <i className="fas fa-sign-out-alt me-1"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-lg-8">
            <h1 className="display-5 fw-bold text-dark mb-2">Project Management</h1>
            <p className="lead text-muted">
              Manage projects and assign tasks to interns ({projects.length} total)
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <button
              className="btn btn-primary btn-lg px-4 shadow"
              style={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
              onClick={() => setShowProjectModal(true)}
            >
              <i className="fas fa-plus me-2"></i>New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="row justify-content-center">
            <div className="col-md-8 text-center py-5">
              <div className="display-4 text-muted mb-4">
                <i className="fas fa-tasks"></i>
              </div>
              <h3 className="fw-bold text-muted mb-3">No Projects Yet</h3>
              <p className="lead text-muted mb-4">Get started by creating your first project</p>
              <button
                className="btn btn-primary btn-lg px-5"
                style={{ background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                onClick={() => setShowProjectModal(true)}
              >
                <i className="fas fa-plus me-2"></i>Create First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {projects.map((project) => {
              const projectIsDeletingTask = deletingTask?.projectId === project._id;
              
              return (
                <div key={project._id} className="col-lg-6 col-xl-4">
                  <ProjectCard
                    project={project}
                    interns={interns}
                    onRefresh={fetchProjects}
                    onCreateTask={() => {
                      setSelectedProject(project);
                      setEditingTask(null);
                      setShowTaskModal(true);
                    }}
                    onEditTask={handleEditTask}
                    onDeleteProject={handleDeleteProject}
                    onDeleteTask={handleDeleteTask}
                    isDeleting={deletingProject === project._id}
                    isDeletingTask={projectIsDeletingTask} 
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={fetchProjects}
        />
      )}

      {showTaskModal && (
        <TaskModal
          project={selectedProject}
          editingTask={editingTask}
          interns={interns}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedProject(null);
            setEditingTask(null);
          }}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
