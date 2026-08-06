import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { notaIdSchema, actualizarNotaSchema } from '../validators/nota.validator.js';
import {
  crearNota,
  listarNotasPorPedido,
  actualizarNota,
  eliminarNota,
} from '../controllers/nota.controller.js';

const router = Router({ mergeParams: true });

router.use(autenticar);

router.get('/', listarNotasPorPedido);
router.post('/', crearNota);
router.put('/:id', validate(notaIdSchema, 'params'), validate(actualizarNotaSchema), actualizarNota);
router.delete('/:id', validate(notaIdSchema, 'params'), eliminarNota);

export default router;