import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.middleware.js'; // solo autenticar, no esAdmin
import {
  productoSchema,
  productoIdSchema,
  productoQuerySchema,
} from '../validators/producto.validator.js';
import {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
  listarPorTipo,
  obtenerTaperYPapa,
} from '../controllers/producto.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(autenticar);

// Rutas públicas (o protegidas)
router.get('/', validate(productoQuerySchema, 'query'), listarProductos);
router.get('/tipos/:tipo', listarPorTipo);
router.get('/taper-papa', obtenerTaperYPapa);
router.get('/:id', validate(productoIdSchema, 'params'), obtenerProducto);

// Rutas de administración (solo admin) - CREAR sigue siendo solo admin
router.post('/', validate(productoSchema), crearProducto); // Quitamos esAdmin
router.put('/:id', validate(productoIdSchema, 'params'), validate(productoSchema), actualizarProducto); // Quitamos esAdmin
router.put('/:id/eliminar', validate(productoIdSchema, 'params'), eliminarProducto); // Quitamos esAdmin

export default router;