import { obtenerPedidosPorFecha, obtenerIngresosPorCliente } from '../repositories/pedido.repository.js';

export const reporteDiario = async (fecha) => {
  const pedidos = await obtenerPedidosPorFecha(fecha);
  
  const clientesMap = new Map();
  pedidos.forEach(pedido => {
    const cliente = pedido.nombreCliente || 'Cliente anónimo';
    if (!clientesMap.has(cliente)) {
      clientesMap.set(cliente, {
        cliente,
        pedidos: [],
      });
    }
    clientesMap.get(cliente).pedidos.push(pedido);
  });

  return Array.from(clientesMap.values());
};

export const reporteIngresos = async (fechaInicio, fechaFin) => {
  return obtenerIngresosPorCliente(fechaInicio, fechaFin);
};