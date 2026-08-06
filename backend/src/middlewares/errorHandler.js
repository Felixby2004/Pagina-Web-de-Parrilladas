import env from '../config/env.js';

// Manejador de errores global
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err?.message || err);
  if (err?.stack) {
    console.error(err.stack);
  }

  const statusCode = err?.statusCode || 500;
  const mensaje = err?.message || 'Error interno del servidor';

  // Errores de validación de Zod (si se lanzan)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    });
  }

  // Errores de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflicto',
      mensaje: `El campo ${err.meta?.target?.join(', ')} ya existe.`,
    });
  }

  // Para producción no mostrar detalles internos
  if (env.NODE_ENV === 'production' && statusCode === 500) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  res.status(statusCode).json({ error: mensaje });
};