import {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
} from '../repositories/pedido.repository.js';
import {
  crearNotas,
} from '../repositories/nota.repository.js';
import {
  obtenerProductoPorIdService,
  obtenerTaperYPapaService,
} from './producto.service.js';
import prisma from '../config/db.js';

// Calcular subtotal de un detalle
const calcularSubtotalDetalle = async (detalle) => {
  const { cantidad, productoId, usaTaper, usaPapaFrita } = detalle;
  
  // Obtener producto usando el servicio
  const producto = await obtenerProductoPorIdService(productoId);
  if (!producto) {
    throw { statusCode: 404, message: `Producto con ID ${productoId} no encontrado` };
  }

  // Obtener precios de Taper y Papa Frita
  const { taper, papaFrita } = await obtenerTaperYPapaService();

  let subtotal = cantidad * Number(producto.precio);
  if (usaTaper && taper) {
    subtotal += cantidad * Number(taper.precio);
  }
  if (usaPapaFrita && papaFrita) {
    subtotal += cantidad * Number(papaFrita.precio);
  }

  return {
    productoId,
    cantidad,
    precioUnitario: Number(producto.precio),
    usaTaper,
    usaPapaFrita,
    subtotal: subtotal,
  };
};

// Calcular total del pedido
const calcularTotalPedido = (detalles, notas) => {
  const totalDetalles = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
  const totalNotas = notas
    .filter(n => n.tipo === 'ADICIONAL')
    .reduce((sum, n) => sum + Number(n.subtotal || 0), 0);
  return totalDetalles + totalNotas;
};

export const crearPedidoService = async (data, usuarioId) => {
  const { nombreCliente, detalles, notas } = data;
  const notasArray = Array.isArray(notas) ? notas : [];

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
        subtotal: nota.cantidad * nota.precio,
      };
    }
    return {
      tipo: 'OBSERVACION',
      texto: nota.texto,
    };
  });

  // Crear pedido
  const pedido = await crearPedido({
    usuarioId,
    nombreCliente: nombreCliente || null,
    detalles: {
      create: detallesCalculados,
    },
    total: 0, // Se actualizará después
  });

  // Crear notas
  if (notasData.length > 0) {
    await crearNotas(
      notasData.map(n => ({ ...n, pedidoId: pedido.id }))
    );
  }

  // Calcular total final
  const allNotas = await prisma.nota.findMany({
    where: { pedidoId: pedido.id }
  });
  const total = calcularTotalPedido(detallesCalculados, allNotas);

  // Actualizar pedido con total
  const pedidoActualizado = await actualizarPedido(pedido.id, {
    total,
  });

  return pedidoActualizado;
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

  const { nombreCliente, detalles, notas } = data;
  const notasArray = Array.isArray(notas) ? notas : [];

  const detallesCalculados = await Promise.all(detalles.map(calcularSubtotalDetalle));

  const notasData = notasArray.map((nota) => {
    if (nota.tipo === 'ADICIONAL') {
      return {
        tipo: 'ADICIONAL',
        cantidad: nota.cantidad,
        descripcion: nota.descripcion,
        precio: nota.precio,
        subtotal: nota.cantidad * nota.precio,
      };
    }
    return {
      tipo: 'OBSERVACION',
      texto: nota.texto,
    };
  });

  const total = calcularTotalPedido(detallesCalculados, notasData);
  const nombreClienteActualizado = nombreCliente ?? pedidoExistente.nombreCliente;

  return actualizarPedido(id, {
    nombreCliente: nombreClienteActualizado ?? null,
    estado: data.estado ?? pedidoExistente.estado,
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

export const eliminarPedidoService = async (id) => {
  const pedido = await obtenerPedidoPorIdService(id);
  if (pedido.estado === 'PAGADO' || pedido.estado === 'CANCELADO') {
    throw { statusCode: 400, message: 'No se puede eliminar un pedido que ya está pagado o cancelado' };
  }
  return eliminarPedido(id);
};
