import {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  actualizarEstadosPedidos,
  eliminarPedido,
} from '../repositories/pedido.repository.js';
import {
  obtenerProductoPorIdService,
  obtenerTaperYPapaService,
} from './producto.service.js';
import prisma from '../config/db.js';
import { calcularDetalle, calcularTotalPedido, redondearDinero } from '../utils/preciosPedido.js';

const calcularSubtotalDetalle = async (detalle) => {
  const producto = await obtenerProductoPorIdService(detalle.productoId);
  if (!producto.disponible) {
    throw { statusCode: 400, message: `${producto.nombre} no está disponible` };
  }
  const { taper } = await obtenerTaperYPapaService();
  return calcularDetalle(detalle, producto, taper);
};

const convertirFechaPedido = (fecha) => {
  if (!fecha) return undefined;
  const [year, month, day] = fecha.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0));
};

export const crearPedidoService = async (data, usuarioId) => {
  const { nombreCliente, fecha, detalles, notas, costoDelivery } = data;
  const notasArray = Array.isArray(notas) ? notas : [];
  const fechaPedido = convertirFechaPedido(fecha) || new Date();

  // Calcular subtotales de cada detalle
  const detallesCalculados = await Promise.all(detalles.map(calcularSubtotalDetalle));

  // Preparar datos de las notas
  const notasData = notasArray.map(nota => {
    if (nota.tipo === 'ADICIONAL') {
      return {
        tipo: 'ADICIONAL',
        cantidad: nota.cantidad,
        descripcion: nota.descripcion,
        precio: nota.precio,
        subtotal: redondearDinero(nota.cantidad * nota.precio),
      };
    }
    return {
      tipo: 'OBSERVACION',
      texto: nota.texto,
    };
  });

  return crearPedido({
    usuarioId,
    nombreCliente: nombreCliente || null,
    fecha: fechaPedido,
    costoDelivery: costoDelivery ?? null,
    detalles: { create: detallesCalculados },
    notas: { create: notasData },
    total: calcularTotalPedido(detallesCalculados, notasData, costoDelivery),
  });
};

export const obtenerPedidosService = async (filtros, paginacion) => {
  return obtenerPedidos(filtros, paginacion);
};

export const obtenerPedidoPorIdService = async (id) => {
  const pedido = await obtenerPedidoPorId(id);
  if (!pedido) {
    throw { statusCode: 404, message: 'Pedido no encontrado' };
  }
  return pedido;
};

export const actualizarPedidoService = async (id, data) => {
  // Obtener pedido existente
  const pedidoExistente = await obtenerPedidoPorIdService(id);

  // No permitir editar pedidos ya cerrados
  if (pedidoExistente.estado === 'PAGADO' || pedidoExistente.estado === 'CANCELADO') {
    throw { statusCode: 400, message: 'No se puede editar un pedido que ya está pagado o cancelado' };
  }

  const { nombreCliente, fecha, detalles, notas, costoDelivery } = data;
  const notasArray = Array.isArray(notas) ? notas : [];

  const detallesCalculados = await Promise.all(detalles.map(calcularSubtotalDetalle));

  const notasData = notasArray.map((nota) => {
    if (nota.tipo === 'ADICIONAL') {
      return {
        tipo: 'ADICIONAL',
        cantidad: nota.cantidad,
        descripcion: nota.descripcion,
        precio: nota.precio,
        subtotal: redondearDinero(nota.cantidad * nota.precio),
      };
    }
    return {
      tipo: 'OBSERVACION',
      texto: nota.texto,
    };
  });

  const deliveryActualizado = costoDelivery === undefined ? pedidoExistente.costoDelivery : costoDelivery;
  const total = calcularTotalPedido(detallesCalculados, notasData, deliveryActualizado);
  const nombreClienteActualizado = nombreCliente ?? pedidoExistente.nombreCliente;

  return actualizarPedido(id, {
    nombreCliente: nombreClienteActualizado ?? null,
    ...(fecha && { fecha: convertirFechaPedido(fecha) }),
    estado: data.estado ?? pedidoExistente.estado,
    costoDelivery: deliveryActualizado,
    detalles: {
      deleteMany: {},
      create: detallesCalculados,
    },
    notas: {
      deleteMany: {},
      create: notasData,
    },
    total,
  });
};

export const cerrarPedidoService = async (id) => {
  const pedido = await obtenerPedidoPorIdService(id);
  if (pedido.estado === 'PAGADO' || pedido.estado === 'CANCELADO') {
    throw { statusCode: 400, message: 'El pedido ya está cerrado' };
  }

  const pedidoActualizado = await actualizarPedido(id, {
    estado: 'PAGADO',
  });

  return pedidoActualizado;
};

export const actualizarEstadosPedidosService = async (cambios) => {
  try {
    const pedidos = await actualizarEstadosPedidos(cambios);
    return pedidos.length;
  } catch (error) {
    if (error.code === 'P2025') {
      throw {
        statusCode: 409,
        message: 'Algún pedido seleccionado ya no está disponible. Quita su selección e inténtalo de nuevo.',
      };
    }
    throw error;
  }
};

export const eliminarPedidoService = async (id) => {
  const pedido = await obtenerPedidoPorIdService(id);
  if (pedido.estado === 'PAGADO' || pedido.estado === 'CANCELADO') {
    throw { statusCode: 400, message: 'No se puede eliminar un pedido que ya está pagado o cancelado' };
  }
  return eliminarPedido(id);
};

// Una sola escritura agrega los extras y su importe sin recalcular los productos anteriores.
export const agregarExtrasService = async (id, extras) => {
  const notas = await Promise.all(extras.map(async ({ productoId, cantidad }) => {
    const producto = await obtenerProductoPorIdService(productoId);
    if (!producto.disponible) {
      throw { statusCode: 400, message: `${producto.nombre} no está disponible` };
    }
    return { tipo: 'ADICIONAL', descripcion: producto.nombre, cantidad,
      precio: Number(producto.precio), subtotal: redondearDinero(cantidad * Number(producto.precio)) };
  }));
  try {
    return await prisma.pedido.update({
      where: { id, visible: true, estado: { in: ['ABIERTO', 'PAGADO'] } },
      data: {
        estado: 'ABIERTO',
        total: { increment: calcularTotalPedido([], notas) },
        notas: { create: notas },
      },
      include: { detalles: { include: { producto: true } }, notas: true },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw { statusCode: 409, message: 'El pedido no está disponible o está cancelado' };
    }
    throw error;
  }
};
