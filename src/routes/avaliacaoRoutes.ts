import { Router } from 'express';
import { criarAvaliacao, listarAvaliacoes } from '../controllers/AvaliacaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas de avaliação precisam de login!
router.use(authMiddleware);

router.post('/', criarAvaliacao);
router.get('/usuario/:usuario_id', listarAvaliacoes);

export default router;