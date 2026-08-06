import { Router } from 'express';
import { autenticar } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { reporteFechaSchema, reporteRangoSchema } from '../validators/reporte.validator.js';
import {
  obtenerReporteDiario,
  obtenerReporteIngresos,
} from '../controllers/reporte.controller.js';

const router = Router();

router.get('/diario', autenticar, validate(reporteFechaSchema, 'query'), obtenerReporteDiario);
router.get('/ingresos', autenticar, validate(reporteRangoSchema, 'query'), obtenerReporteIngresos);

export default router;