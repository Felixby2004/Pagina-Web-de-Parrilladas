import { buscarPorId, actualizarUsuario } from '../repositories/usuario.repository.js';

export const obtenerPerfil = async (id) => {
  const usuario = await buscarPorId(id);
  if (!usuario) {
    throw { statusCode: 404, message: 'Usuario no encontrado' };
  }
  // Eliminar contraseña del objeto de respuesta
  const { contraseña, ...perfil } = usuario;
  return perfil;
};

export const actualizarPerfil = async (id, data) => {
  const { nombre } = data;
  const usuario = await actualizarUsuario(id, { nombre });
  const { contraseña, ...perfil } = usuario;
  return perfil;
};