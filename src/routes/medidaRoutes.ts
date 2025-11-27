import { Router } from 'express';
import { aplicarMedida, listarMedidasPorUsuario } from '../controllers/MedidaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware); // Protege todas as rotas


router.post('/', aplicarMedida);


router.get('/usuario/:usuario_id', listarMedidasPorUsuario);

export default router;