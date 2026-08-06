import { Router } from 'express';
import { autenticar, esAdmin } from '../middlewares/auth.middleware.js';
import { uploadConfiguracionImagenes } from '../middlewares/multer.js';
import {
  obtenerConfiguracion,
  actualizarConfiguracion,
  obtenerListaProductosImagen,
} from '../controllers/configuracion.controller.js';

const router = Router();

router.get('/', autenticar, obtenerConfiguracion);
router.get('/lista-productos/imagen', autenticar, obtenerListaProductosImagen);
router.put('/', autenticar, esAdmin, uploadConfiguracionImagenes, actualizarConfiguracion);

export default router;
