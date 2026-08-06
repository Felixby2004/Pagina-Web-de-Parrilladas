import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { buscarPorId } from '../repositories/usuario.repository.js';

export const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const usuario = await buscarPorId(decoded.id);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido' });
    }

    console.error('❌ Error en autenticación:', error);
    return res.status(500).json({ error: 'Error al validar la autenticación' });
  }
};

// Middleware para verificar rol de administrador
export const esAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};