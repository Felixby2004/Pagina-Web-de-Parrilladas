import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import {
  registroSchema,
  loginSchema,
  verificarSchema,
  recuperarSchema,
  cambiarPasswordSchema,
  cambiarPasswordPerfilSchema
} from '../validators/auth.validator.js';
import {
  registro,
  verificar,
  reenviarVerificacion,
  iniciarSesion,
  solicitarRecuperacionController,
  cambiarPasswordRecuperacion,
  cambiarPasswordPerfilController,
  obtenerPerfil
} from '../controllers/auth.controller.js';

const router = Router();

// Rutas públicas
router.post('/registro', validate(registroSchema), registro);
router.post('/verificar', validate(verificarSchema), verificar);
router.post('/reenviar-verificacion', validate(recuperarSchema), reenviarVerificacion);
router.post('/login', validate(loginSchema), iniciarSesion);
router.post('/recuperar-solicitar', validate(recuperarSchema), solicitarRecuperacionController);
router.post('/recuperar-cambiar', validate(cambiarPasswordSchema), cambiarPasswordRecuperacion);

// Rutas protegidas
router.get('/perfil', autenticar, obtenerPerfil);
router.put('/perfil/password', autenticar, validate(cambiarPasswordPerfilSchema), cambiarPasswordPerfilController);

export default router;