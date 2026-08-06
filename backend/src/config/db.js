import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import env from './env.js';

// Configurar el adapter con la URL de la base de datos
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

// Crear el cliente Prisma con el adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

export default prisma;