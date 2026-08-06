import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { actualizarUsuarioSchema } from '../validators/usuario.validator.js';
import { getPerfil, updatePerfil } from '../controllers/usuario.controller.js';

const router = Router();

router.get('/perfil', autenticar, getPerfil);
router.put('/perfil', autenticar, validate(actualizarUsuarioSchema), updatePerfil);

export default router;