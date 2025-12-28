import React, { useState } from 'react';

const ProjectModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE = process.env.REACT_APP_BASE_URL || 'http://localhost:4022/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating project:', formData);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Create failed');
      }

      const result = await response.json();
      console.log('Project created:', result.project._id);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Project creation error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-xl">
          <div className="modal-header border-0 pb-0">
            <div className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-gradient text-white me-3 shadow" 
                   style={{background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'}}>
                <i className="fas fa-project-diagram fs-3"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" 
                    style={{background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  New Project
                </h5>
                <small className="text-muted">Create a new project for your team</small>
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

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Project Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg shadow-sm"
                    placeholder="Enter a unique project name (e.g., Website Redesign)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                  <div className="form-text">
                    {formData.name.length}/100 characters
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Project Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control shadow-sm"
                    rows="4"
                    placeholder="Describe the project goals, scope, and deliverables... (e.g., Build responsive e-commerce site with payment integration)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    maxLength={500}
                  />
                  <div className="form-text">
                    {formData.description.length}/500 characters
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
                className="btn px-5 shadow-lg"
                style={{ 
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)', 
                  border: 'none',
                  color: 'white'
                }}
                disabled={loading || !formData.name.trim() || !formData.description.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-2"></i>
                    Create Project
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

export default ProjectModal;
