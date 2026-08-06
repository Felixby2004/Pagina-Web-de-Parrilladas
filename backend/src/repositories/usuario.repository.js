import prisma from '../config/db.js';

export const crearUsuario = async (data) => {
  return prisma.usuario.create({ data });
};

export const buscarPorCorreo = async (correo) => {
  return prisma.usuario.findUnique({
    where: { correo },
  });
};

export const buscarPorId = async (id) => {
  return prisma.usuario.findUnique({
    where: { id },
  });
};

export const actualizarUsuario = async (id, data) => {
  return prisma.usuario.update({
    where: { id },
    data,
  });
};

export const actualizarPorCorreo = async (correo, data) => {
  return prisma.usuario.update({
    where: { correo },
    data,
  });
};

export const guardarCodigoVerificacion = async (id, codigo, expiracion) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      codigoVerificacion: codigo,
      expiracionVerificacion: expiracion,
    },
  });
};

export const guardarCodigoRecuperacion = async (id, codigo, expiracion) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      codigoRecuperacion: codigo,
      expiracionRecuperacion: expiracion,
    },
  });
};

export const marcarVerificado = async (id) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      verificado: true,
      codigoVerificacion: null,
      expiracionVerificacion: null,
    },
  });
};

export const limpiarCodigosRecuperacion = async (id) => {
  return prisma.usuario.update({
    where: { id },
    data: {
      codigoRecuperacion: null,
      expiracionRecuperacion: null,
    },
  });
};