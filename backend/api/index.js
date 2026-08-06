import app from '../src/app.js';
import env from '../src/config/env.js';

// Exportar la app como función serverless para Vercel
export default async function handler(req, res) {
  // Para Vercel, necesitamos pasar req y res directamente
  await app(req, res);
}