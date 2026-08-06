import {
  crearNota,
  obtenerNotasPorPedido,
  actualizarNota,
  eliminarNota,
} from '../repositories/nota.repository.js';

export const crearNotaService = async (pedidoId, data) => {
  const notaData = { ...data, pedidoId };
  if (data.tipo === 'ADICIONAL') {
    notaData.subtotal = data.cantidad * data.precio;
  }
  return crearNota(notaData);
};

export const obtenerNotasPorPedidoService = async (pedidoId) => {
  return obtenerNotasPorPedido(pedidoId);
};

export const actualizarNotaService = async (id, data) => {
  if (data.tipo === 'ADICIONAL') {
    data.subtotal = data.cantidad * data.precio;
  }
  return actualizarNota(id, data);
};

export const eliminarNotaService = async (id) => {
  return eliminarNota(id);
};