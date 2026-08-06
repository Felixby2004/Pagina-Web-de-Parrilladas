import cors from 'cors';

// Variable de entorno para el frontend (URL permitida)
// Ejemplo: FRONTEND_URL=https://misitio.com
const frontendUrl = process.env.FRONTEND_URL;

// Si no está definida, usamos valores por defecto para desarrollo
const allowedOrigins = frontendUrl
  ? [frontendUrl]
  : ['http://localhost:3000', 'http://localhost:5173'];

export const handleCors = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ej. Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    // Verificar si el origin está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`No permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});