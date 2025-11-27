import { Router } from 'express';
import { promoverUsuario, demitirUsuario, listarHistorico } from '../controllers/HistoricoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware); // Protege tudo

// Rotas de Ação
router.post('/promover', promoverUsuario);
router.post('/demitir', demitirUsuario);

// Rota de Consulta
router.get('/:usuario_id', listarHistorico);

export default router;