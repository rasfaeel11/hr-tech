import { Router } from 'express';
import { createUser, listUsers, getUserById, updateUser, deleteUser } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();


router.post('/', createUser);
router.use(authMiddleware);
router.get('/', listUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;