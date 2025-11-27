import { Router } from 'express';
import { getDashboardStats } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);


router.get('/', getDashboardStats);

export default router;