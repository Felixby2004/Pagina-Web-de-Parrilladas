import cors from 'cors';

// Configuración CORS permisiva: refleja el origin del navegador para
// permitir que el frontend estático llegue al backend en cualquier dominio.
export const handleCors = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});