import React, { useState, useCallback } from 'react';

const ProjectCard = ({ 
  project, 
  interns, 
  onCreateTask, 
  onEditTask, 
  onDeleteProject, 
  onDeleteTask, 
  isDeleting, 
  isDeletingTask 
}) => {
  const [showAllTasks, setShowAllTasks] = useState(false);

  const getInternName = useCallback((internId) => {
    if (!internId) return 'Unassigned';
    const intern = interns.find(i => i._id?.toString() === internId.toString());
    return intern ? intern.userName : 'Unassigned';
  }, [interns]);

  const getPriorityBadge = (priority) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm";
    const badges = {
      High: `${base} bg-red-100 text-red-800 border border-red-200`,
      Medium: `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`,
      Low: `${base} bg-green-100 text-green-800 border border-green-200`
    };
    return badges[priority] || `${base} bg-gray-100 text-gray-800 border border-gray-200`;
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full capitalize shadow-sm";
    const badges = {
      completed: `${base} bg-green-100 text-green-800 border border-green-200`,
      'in progress': `${base} bg-blue-100 text-blue-800 border border-blue-200`,
      'in-progress': `${base} bg-blue-100 text-blue-800 border border-blue-200`,
      pending: `${base} bg-orange-100 text-orange-800 border border-orange-200`
    };
    return badges[status?.toLowerCase()] || `${base} bg-gray-100 text-gray-800 border border-gray-200`;
  };

  const handleCreateTask = () => onCreateTask();

  const handleEditTask = useCallback((task) => {
    onEditTask({
      projectId: project._id,
      taskId: task._id,
      task
    });
  }, [onEditTask, project._id]);

  const handleDeleteProject = async () => {
    if (window.confirm(`Delete "${project.name}"?\nThis will also delete all ${project.tasks?.length || 0} tasks.`)) {
      try {
        await onDeleteProject(project._id);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete project');
      }
    }
  };

  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const tasksToShow = showAllTasks ? tasks : tasks.slice(0, 3);

  return (
    <div className="card h-100 shadow-xl border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50">
      <div className="card-body p-5">
        <div className="d-flex justify-content-between align-items-start mb-5 pb-4 border-bottom border-slate-100">
          <div className="flex-grow-1 pe-4">
            <div className="d-flex align-items-center mb-2">
              <h5 className="card-title fw-bold text-xl mb-1">{project.name}</h5>
              {totalTasks > 0 && (
                <span className="ms-3 px-2 py-1 bg-primary bg-opacity-10 text-primary text-xs fw-semibold rounded-pill shadow-sm">
                  {totalTasks} tasks
                </span>
              )}
            </div>
            <p className="text-muted mb-3 small">{project.description}</p>

            <div className="d-flex align-items-center text-xs bg-light p-2 rounded-3 shadow-sm">
              <div className="bg-gradient position-relative me-3 rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '32px', height: '32px' }}>
                <i className="fas fa-user text-white small"></i>
              </div>
              <div>
                <div className="fw-semibold text-dark small mb-0">
                  Created by {project.createdBy?.userName || 'Unknown'}
                </div>
                <div className="text-muted small">
                  {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-2 ms-3">
            <button className="btn btn-success btn-sm px-3 py-2 shadow fw-semibold text-xs" onClick={handleCreateTask} title="Add New Task">
              <i className="fas fa-plus me-1"></i>Add Task
            </button>
            <button 
              className="btn btn-outline-danger btn-sm px-3 py-2 shadow fw-semibold text-xs" 
              onClick={handleDeleteProject}
              disabled={isDeleting}
              title="Delete Project"
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }} />
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt me-1"></i>Delete
                </>
              )}
            </button>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-4 text-center p-3 bg-gradient rounded-3 shadow-sm border hover:shadow-lg transition-all">
            <div className="fs-3 fw-bold text-primary mb-1">{totalTasks}</div>
            <div className="small fw-semibold text-muted text-uppercase">Total Tasks</div>
          </div>
          <div className="col-4 text-center p-3 bg-warning bg-opacity-10 rounded-3 shadow-sm border hover:shadow-lg transition-all">
            <div className="fs-3 fw-bold text-warning mb-1">{pendingTasks}</div>
            <div className="small fw-semibold text-muted text-uppercase">Pending</div>
          </div>
          <div className="col-4 text-center p-3 bg-success bg-opacity-10 rounded-3 shadow-sm border hover:shadow-lg transition-all">
            <div className="fs-3 fw-bold text-success mb-1">{completedTasks}</div>
            <div className="small fw-semibold text-muted text-uppercase">Completed</div>
          </div>
        </div>
        
        <div className="border-top pt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mb-0 d-flex align-items-center">
              Recent Tasks
              {totalTasks > 0 && (
                <span className="ms-2 px-2 py-1 bg-light text-dark text-xs fw-semibold rounded-pill shadow-sm">
                  {totalTasks}
                </span>
              )}
            </h6>
            {totalTasks > 2 && (
              <button className="btn btn-link p-0 text-decoration-none text-muted small fw-semibold d-flex align-items-center" onClick={() => setShowAllTasks(!showAllTasks)}>
                {showAllTasks ? (
                  <>
                    <i className="fas fa-chevron-up me-1"></i>Show Less
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down me-1"></i>Show All ({totalTasks})
                  </>
                )}
              </button>
            )}
          </div>

          <div className={`${showAllTasks ? 'max-h-96 overflow-y-auto custom-scrollbar' : ''}`}>
            <div className="row g-3">
              {tasksToShow.map((task, index) => (
                <TaskItemAdvanced
                  key={task._id || `task-${index}`}
                  task={task}
                  internName={getInternName(task.assignedIntern?._id || task.assignedIntern)}
                  assignedBy={task.assignedBy}
                  onEdit={handleEditTask}
                  onDeleteTask={onDeleteTask}
                  getPriorityBadge={getPriorityBadge}
                  getStatusBadge={getStatusBadge}
                  project={project}
                  isDeletingTask={isDeletingTask}
                />
              ))}

              {totalTasks === 0 && (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="fas fa-tasks fa-3x mb-3 opacity-50"></i>
                  <p className="mb-4">No tasks yet</p>
                  <button className="btn btn-outline-primary btn-sm" onClick={handleCreateTask}>
                    <i className="fas fa-plus me-2"></i>Create First Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskItemAdvanced = ({ 
  task, 
  internName, 
  assignedBy, 
  onEdit, 
  onDeleteTask, 
  getPriorityBadge, 
  getStatusBadge, 
  project,
  isDeletingTask 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
    setShowDropdown(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowDropdown(false);
    
    if (window.confirm(`Delete "${task.title}"?`)) {
      try {
        await onDeleteTask(project._id, task._id);
      } catch (error) {
        console.error('Delete task error:', error);
        alert('Failed to delete task');
      }
    }
  };

  React.useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="col-12">
      <div className="card shadow-sm border-0 h-100 hover:shadow-md transition-all duration-300 position-relative overflow-hidden">
        <div className="card-body p-4 pb-3">
          <div className="d-flex justify-content-between align-items-start mb-3" onClick={() => setShowDropdown(false)}>
            <div>
              <div className="mb-2">
                <span className={`${getPriorityBadge(task.priority)} me-2 mb-1 d-inline-block`}>
                  {task.priority}
                </span>
                <span className={`${getStatusBadge(task.status)} d-inline-block`}>
                  {task.status}
                </span>
              </div>
              <h6 className="fw-bold mb-2">{task.title}</h6>
              <p className="small text-muted mb-0">{task.description}</p>
            </div>

            <div className="position-relative ms-3">
              <button
                className="btn btn-sm btn-outline-secondary p-2 shadow-sm border-0"
                onClick={toggleDropdown}
                disabled={isDeletingTask}
                style={{ minWidth: '40px' }}
                title="Task actions"
              >
                {isDeletingTask ? (
                  <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }} />
                ) : (
                  <i className="fas fa-ellipsis-v text-muted"></i>
                )}
              </button>

              {showDropdown && (
                <div className="position-absolute top-100 end-0 mt-1 shadow-lg border-0 bg-white rounded" style={{ minWidth: '300px',maxHeight: '250px', overflowY: 'auto'}}>
                  <button className="w-100 text-start px-3 py-2 border-0 bg-transparent text-dark fw-semibold hover:bg-light d-flex align-items-center" onClick={handleEdit} disabled={isDeletingTask}>
                    <i className="fas fa-edit text-primary me-2"></i>Edit Task
                  </button>
                  <hr className="my-0" />
                  <div className="px-3 py-2 small text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Priority:</span>
                      <span className="fw-semibold text-capitalize">{task.priority}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Due:</span>
                      <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('short') : 'No deadline'}</span>
                    </div>
                  </div>
                  <hr className="my-0" />
                  <button className="w-100 text-start px-3 py-2 border-0 bg-transparent text-danger fw-semibold hover:bg-danger-subtle d-flex align-items-center" onClick={handleDelete} disabled={isDeletingTask}>
                    {isDeletingTask ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" style={{ width: '12px', height: '12px' }} />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash me-2"></i>Delete Task
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center text-xs text-muted mt-3 pt-3 border-top border-light">
            <div className="d-flex align-items-center">
              <i className="fas fa-user-circle me-1 text-primary"></i>
              <span className="fw-semibold">{internName}</span>
            </div>
            {assignedBy && (
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle text-success me-1"></i>
                by {assignedBy.userName || 'Admin'}
              </div>
            )}
            <div className="text-end">
              <i className="fas fa-calendar me-1"></i>
              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
