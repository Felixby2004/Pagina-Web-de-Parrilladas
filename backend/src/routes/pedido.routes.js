import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import {
  pedidoSchema,
  pedidoIdSchema,
  pedidoQuerySchema,
  estadosPedidosSchema,
  extrasPedidoSchema,
} from '../validators/pedido.validator.js';
import {
  crearPedido,
  listarPedidos,
  obtenerPedido,
  actualizarPedido,
  actualizarEstadosPedidos,
  cerrarPedido,
  eliminarPedido,
  agregarExtras,
} from '../controllers/pedido.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

router.get('/', validate(pedidoQuerySchema, 'query'), listarPedidos);
router.get('/:id', validate(pedidoIdSchema, 'params'), obtenerPedido);
router.post('/', validate(pedidoSchema), crearPedido);
router.patch('/estados', validate(estadosPedidosSchema), actualizarEstadosPedidos);
router.put('/:id', validate(pedidoIdSchema, 'params'), validate(pedidoSchema), actualizarPedido);
router.post('/:id/extras', validate(pedidoIdSchema, 'params'), validate(extrasPedidoSchema), agregarExtras);
router.post('/:id/cerrar', validate(pedidoIdSchema, 'params'), cerrarPedido);
router.delete('/:id', validate(pedidoIdSchema, 'params'), eliminarPedido);

export default router;
