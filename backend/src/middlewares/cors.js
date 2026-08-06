import cors from 'cors';

// Configuración CORS personalizada
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://tudominio.com'] // añadir dominios de producción
  : ['http://localhost:3000', 'http://localhost:5173']; // Vite por defecto

export const handleCors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});