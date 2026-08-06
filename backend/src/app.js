import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { handleCors } from './middlewares/cors.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import productoRoutes from './routes/producto.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import notaRoutes from './routes/nota.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import configuracionRoutes from './routes/configuracion.routes.js';

const app = express();

// Seguridad
app.use(helmet());
app.use(handleCors);

// Rate limiting general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, inténtelo de nuevo más tarde.',
});
app.use('/api', limiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/pedidos/:pedidoId/notas', notaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejador de errores global
app.use(errorHandler);

export default app;