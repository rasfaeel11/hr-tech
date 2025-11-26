import { Router } from 'express';
import { createUser, listUsers } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Quando alguém mandar um POST para /, chamamos a função createUser
router.post('/', createUser);
router.get('/', authMiddleware, listUsers);

export default router;