import prisma from '../config/db.js';

export const crearPedido = async (data) => {
  return prisma.pedido.create({
    data,
    include: {
      detalles: {
        include: { producto: true }
      },
      notas: true,
    }
  });
};

export const obtenerPedidos = async (filtros = {}, paginacion = {}) => {
  const { page = 1, limit = 10, fechaInicio, fechaFin, estado, search } = paginacion;
  const skip = (page - 1) * limit;

  const where = {
    visible: true,
    ...(fechaInicio && (() => {
      const [y, m, d] = fechaInicio.split('-').map(Number);
      const inicio = new Date(Date.UTC(y, m - 1, d, 5, 0, 0, 0));
      return { fecha: { gte: inicio } };
    })()),
    ...(fechaFin && (() => {
      const [y, m, d] = fechaFin.split('-').map(Number);
      const fin = new Date(Date.UTC(y, m - 1, d + 1, 4, 59, 59, 999));
      return { fecha: { lte: fin } };
    })()),
    ...(estado && { estado }),
    ...(search && {
      OR: [
        { nombreCliente: { contains: search, mode: 'insensitive' } },
      ]
    }),
  };

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fecha: 'desc' },
      include: {
        detalles: {
          include: { producto: true }
        },
        notas: true,
      }
    }),
    prisma.pedido.count({ where }),
  ]);

  return {
    data: pedidos,
    paginacion: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  };
};

export const obtenerPedidoPorId = async (id) => {
  return prisma.pedido.findUnique({
    where: { id, visible: true },
    include: {
      detalles: {
        include: { producto: true }
      },
      notas: true,
    }
  });
};

export const actualizarPedido = async (id, data) => {
  return prisma.pedido.update({
    where: { id },
    data,
    include: {
      detalles: {
        include: { producto: true }
      },
      notas: true,
    }
  });
};

// ELIMINACIÓN LÓGICA
export const eliminarPedido = async (id) => {
  return prisma.pedido.update({
    where: { id },
    data: { visible: false },
  });
};

// ========== FUNCIONES PARA REPORTES ==========

export const obtenerPedidosPorFecha = async (fecha) => {
  // Interpretar la fecha como día en zona Perú (America/Lima, UTC-5)
  // Convertir rango local (00:00:00 - 23:59:59.999 en Lima) a UTC para búsquedas en DB
  const [y, m, d] = fecha.split('-').map(Number);
  // Lima está en UTC-5, por lo tanto la medianoche en Lima corresponde a 05:00:00 UTC
  const inicio = new Date(Date.UTC(y, m - 1, d, 5, 0, 0, 0));
  // Fin del día en Lima corresponde al siguiente día 04:59:59.999 UTC
  const fin = new Date(Date.UTC(y, m - 1, d + 1, 4, 59, 59, 999));

  return prisma.pedido.findMany({
    where: {
      fecha: {
        gte: inicio,
        lte: fin,
      },
      visible: true,
      estado: { in: ['PAGADO', 'ABIERTO'] }
    },
    include: {
      usuario: {
        select: { id: true, nombre: true }
      },
      detalles: {
        include: { producto: true }
      },
      notas: true,
    },
    orderBy: { fecha: 'asc' },
  });
};

export const obtenerIngresosPorCliente = async (fechaInicio, fechaFin) => {
  const [y1, m1, d1] = fechaInicio.split('-').map(Number);
  const [y2, m2, d2] = fechaFin.split('-').map(Number);
  const inicio = new Date(Date.UTC(y1, m1 - 1, d1, 5, 0, 0, 0));
  const fin = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 4, 59, 59, 999));

  const pedidos = await prisma.pedido.findMany({
    where: {
      fecha: {
        gte: inicio,
        lte: fin,
      },
      visible: true,
      estado: 'PAGADO',
    },
    include: {
      detalles: true,
      notas: {
        where: { tipo: 'ADICIONAL' }
      },
    },
  });

  // Agrupar por cliente
  const clientesMap = new Map();
  pedidos.forEach(pedido => {
    const cliente = pedido.nombreCliente || 'Cliente anónimo';
    if (!clientesMap.has(cliente)) {
      clientesMap.set(cliente, {
        cliente,
        cantidadPedidos: 0,
        ingresoTotal: 0,
        pedidos: [],
      });
    }
    const data = clientesMap.get(cliente);
    data.cantidadPedidos += 1;
    const totalDetalles = pedido.detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    const totalNotas = pedido.notas.reduce((sum, n) => sum + Number(n.subtotal || 0), 0);
    data.ingresoTotal += totalDetalles + totalNotas;
    data.pedidos.push(pedido.fecha);
  });

  return Array.from(clientesMap.values());
};