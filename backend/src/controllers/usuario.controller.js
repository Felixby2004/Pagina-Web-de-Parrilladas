import { obtenerPerfil, actualizarPerfil } from '../services/usuario.service.js';

export const getPerfil = async (req, res, next) => {
  try {
    const perfil = await obtenerPerfil(req.usuario.id);
    res.json(perfil);
  } catch (error) {
    next(error);
  }
};

export const updatePerfil = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const perfil = await actualizarPerfil(req.usuario.id, { nombre });
    res.json({ mensaje: 'Perfil actualizado', perfil });
  } catch (error) {
    next(error);
  }
};