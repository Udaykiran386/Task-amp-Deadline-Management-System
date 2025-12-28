import Project from '../models/Project.js';
import User from '../models/User.js';

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = new Project({
      name: name.trim(),
      description: description.trim(),
      createdBy: req.user._id
    });

    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create project'
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'userName email')
      .populate('tasks.assignedIntern', 'userName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { name: name.trim(), description: description.trim() },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with ID: ${projectId}`
      });
    }

    const { title, description, priority, deadline, assignedIntern } = req.body;

    const intern = await User.findById(assignedIntern);
    if (!intern || intern.role !== 'intern') {
      return res.status(400).json({
        success: false,
        message: 'Invalid intern selected'
      });
    }

    project.tasks.push({
      title: title.trim(),
      description: description.trim() || '',
      priority: priority || 'Medium',
      deadline: new Date(deadline),
      assignedIntern,
      assignedBy: req.user._id,
      status: 'Pending'
    });

    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const updates = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = project.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    Object.assign(task, updates);
    if (updates.deadline) {
      task.deadline = new Date(updates.deadline);
    }

    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.tasks.pull(taskId);
    await project.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

export const getInterns = async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern' })
      .select('userName email _id')
      .sort('userName');

    res.json({
      success: true,
      count: interns.length,
      interns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interns'
    });
  }
};

export const getInternTasks = async (req, res) => {
  try {
    const internId = req.user._id;

    const projects = await Project.find({
      "tasks.assignedIntern": internId
    })
      .populate('createdBy', 'userName')
      .lean();

    const tasks = [];

    projects.forEach(project => {
      project.tasks.forEach(task => {
        if (task.assignedIntern?.toString() === internId.toString()) {
          tasks.push({
            _id: task._id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            deadline: task.deadline,
            status: task.status,
            projectId: project._id,
            projectName: project.name,
            assignedBy: project.createdBy,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          });
        }
      });
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get intern tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const internId = req.user._id;

    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const project = await Project.findOne({
      "tasks._id": taskId,
      "tasks.assignedIntern": internId
    });

    if (!project) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = project.tasks.id(taskId);
    task.status = status;
    task.updatedAt = new Date();

    await project.save();

    res.json({ message: 'Status updated', task });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};