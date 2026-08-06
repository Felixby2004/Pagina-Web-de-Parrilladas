import prisma from '../config/db.js';

export const crearNota = async (data) => {
  return prisma.nota.create({ data });
};

export const crearNotas = async (notas) => {
  return prisma.nota.createMany({ data: notas });
};

export const obtenerNotasPorPedido = async (pedidoId) => {
  return prisma.nota.findMany({
    where: { pedidoId },
    orderBy: { createdAt: 'asc' },
  });
};

export const actualizarNota = async (id, data) => {
  return prisma.nota.update({
    where: { id },
    data,
  });
};

export const eliminarNota = async (id) => {
  return prisma.nota.delete({
    where: { id },
  });
};

export const eliminarNotasPorPedido = async (pedidoId) => {
  return prisma.nota.deleteMany({
    where: { pedidoId },
  });
};