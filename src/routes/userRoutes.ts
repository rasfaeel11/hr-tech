import { Router } from 'express';
import { createUser } from '../controllers/UserController';

const router = Router();

// Quando alguém mandar um POST para /, chamamos a função createUser
router.post('/', createUser);

export default router;