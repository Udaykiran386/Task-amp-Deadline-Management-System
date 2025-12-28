import express from 'express';
import { authMiddleware } from '../middleware/Auth.js';
import { registerAuth,loginAuth,getMe } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/register', registerAuth);
router.post('/login', loginAuth);
router.get('/me', authMiddleware, getMe);

export default router;