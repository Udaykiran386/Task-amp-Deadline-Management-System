import React, { useState, useEffect } from 'react';

const TaskModal = ({ project, editingTask, interns, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    deadline: '',
    assignedIntern: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:4022/api';

  useEffect(() => {
    console.log('TaskModal props:', { 
      projectId: project?._id, 
      projectName: project?.name,
      editingTask: editingTask?._id 
    });
    
    if (editingTask?.task && editingTask.projectId && editingTask.taskId) {
      setFormData({
        title: editingTask.task.title || '',
        description: editingTask.task.description || '',
        priority: editingTask.task.priority || 'Medium',
        deadline: editingTask.task.deadline ? new Date(editingTask.task.deadline).toISOString().split('T')[0] : '',
        assignedIntern: editingTask.task.assignedIntern?._id || editingTask.task.assignedIntern || ''
      });
    } else if (project?._id) {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        deadline: '',
        assignedIntern: ''
      });
    }
    setError('');
  }, [editingTask, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingTask && editingTask.projectId && editingTask.taskId) {
        console.log('Updating task:', editingTask.projectId, editingTask.taskId);
        const response = await fetch(`${API_BASE}/projects/${editingTask.projectId}/tasks/${editingTask.taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Update failed');
        }
      } else if (project?._id) {
        console.log('Creating task for project:', project._id, project.name);
        const response = await fetch(`${API_BASE}/projects/${project._id}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Create failed');
        }
      } else {
        throw new Error('Project information not available');
      }

      console.log('Task saved successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('TaskModal Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = {
    'Low': 'success',
    'Medium': 'warning',
    'High': 'danger'
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <div className="d-flex align-items-center">
              <div className={`me-3 p-2 rounded-circle bg-${priorityColor[formData.priority] || 'secondary'} text-white`}>
                <i className={`fas fa-tasks fs-5`}></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" 
                    style={{background: 'linear-gradient(45deg, #11998e 0%, #38ef7d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h5>
                <small className="text-muted">
                  Project: <strong>{project?.name}</strong>
                </small>
              </div>
            </div>
            <button className="btn-close" type="button" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}
              
              <div className="alert alert-info mb-4 shadow-sm">
                <div className="d-flex align-items-center">
                  <i className="fas fa-project-diagram text-info me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-1 fw-bold text-info">{project?.name}</h6>
                    <small className="text-muted">{project?.description}</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Task Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter a clear task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Priority</label>
                  <select
                    className={`form-select form-select-lg border-${priorityColor[formData.priority] || 'secondary'}`}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Deadline <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Assign Intern <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.assignedIntern}
                    onChange={(e) => setFormData({ ...formData, assignedIntern: e.target.value })}
                    required
                  >
                    <option value="">Select intern...</option>
                    {interns.length === 0 ? (
                      <option disabled>No interns available</option>
                    ) : (
                      interns.map((intern) => (
                        <option key={intern._id} value={intern._id}>
                          {intern.userName} - {intern.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide detailed instructions for the task..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={1000}
                  />
                  <div className="form-text">
                    {formData.description.length}/1000 characters
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer border-0 bg-light">
              <button 
                type="button" 
                className="btn btn-outline-secondary px-4"
                onClick={onClose}
                disabled={loading}
              >
                <i className="fas fa-times me-2"></i>Cancel
              </button>
              <button 
                type="submit" 
                className="btn px-4"
                style={{ 
                  background: 'linear-gradient(45deg, #11998e 0%, #38ef7d 100%)', 
                  border: 'none',
                  color: 'white'
                }}
                disabled={loading || !formData.title || !formData.deadline || !formData.assignedIntern}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : editingTask ? (
                  <>
                    <i className="fas fa-save me-2"></i>Update Task
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-2"></i>Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
