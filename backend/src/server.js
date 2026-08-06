import app from './app.js';
import env from './config/env.js';
import prisma from './config/db.js';

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📦 Entorno: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();