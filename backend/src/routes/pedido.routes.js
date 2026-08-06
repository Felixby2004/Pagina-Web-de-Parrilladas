import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import {
  pedidoSchema,
  pedidoIdSchema,
  pedidoQuerySchema,
} from '../validators/pedido.validator.js';
import {
  crearPedido,
  listarPedidos,
  obtenerPedido,
  actualizarPedido,
  cerrarPedido,
  eliminarPedido,
} from '../controllers/pedido.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

router.get('/', validate(pedidoQuerySchema, 'query'), listarPedidos);
router.get('/:id', validate(pedidoIdSchema, 'params'), obtenerPedido);
router.post('/', validate(pedidoSchema), crearPedido);
router.put('/:id', validate(pedidoIdSchema, 'params'), actualizarPedido);
router.post('/:id/cerrar', validate(pedidoIdSchema, 'params'), cerrarPedido);
router.delete('/:id', validate(pedidoIdSchema, 'params'), eliminarPedido);

export default router;
