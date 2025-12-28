import express from 'express';
import { authMiddleware } from '../middleware/Auth.js';
import { 
  createProject, getProjects, updateProject, deleteProject,
  createTask, updateTask, deleteTask, getInterns ,updateTaskStatus,getInternTasks
} from '../controllers/projectController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/interns', getInterns);
router.post('/',createProject);
router.get('/',getProjects);
router.put('/:id' ,updateProject);
router.delete('/:id', deleteProject);
router.post('/:projectId/tasks', createTask);
router.put('/:projectId/tasks/:taskId', updateTask);
router.delete('/:projectId/tasks/:taskId', deleteTask);
router.patch('/intern/tasks/:taskId/status', updateTaskStatus);
router.get('/intern/tasks', getInternTasks);


export default router;  
