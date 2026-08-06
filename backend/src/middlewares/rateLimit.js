import rateLimit from 'express-rate-limit';

// Rate limit general
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, inténtelo de nuevo más tarde.',
});

// Rate limit para autenticación (más restrictivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos, inténtelo de nuevo en 15 minutos.',
});

// Rate limit para recuperación de contraseña
export const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Demasiadas solicitudes, inténtelo de nuevo en 1 hora.',
});