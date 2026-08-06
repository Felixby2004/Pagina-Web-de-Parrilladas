import cors from 'cors';

const frontendUrl = process.env.FRONTEND_URL;
const frontendUrls = process.env.FRONTEND_URLS;

// Si no está definida, usamos valores por defecto para desarrollo
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://parrillasapp.onrender.com',
  ...(frontendUrl ? [frontendUrl] : []),
  ...(frontendUrls ? frontendUrls.split(',').map((origin) => origin.trim()).filter(Boolean) : []),
];

// Configuración CORS más permisiva para asegurar que funcione
export const handleCors = cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS bloqueado para: ${origin}`);
      callback(new Error(`No permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});