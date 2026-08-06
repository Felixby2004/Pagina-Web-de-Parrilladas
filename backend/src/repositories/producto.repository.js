import prisma from '../config/db.js';

export const crearProducto = async (data) => {
  return prisma.producto.create({ data });
};

export const obtenerProductos = async (filtros = {}, paginacion = {}) => {
  const { page = 1, limit = 10, search = '', tipo, sort = 'nombre', order = 'asc' } = paginacion;
  const skip = (page - 1) * limit;

  const where = {
    visible: true,
    ...(search && {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ]
    }),
    ...(tipo && { tipo }),
  };

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
    }),
    prisma.producto.count({ where }),
  ]);

  return {
    data: productos,
    paginacion: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  };
};

export const obtenerProductoPorId = async (id) => {
  return prisma.producto.findUnique({
    where: { id, visible: true },
    include: { detalles: true },
  });
};

export const actualizarProducto = async (id, data) => {
  return prisma.producto.update({
    where: { id: Number(id) },
    data,
  });
};

export const eliminarProducto = async (id) => {
  return prisma.producto.update({
    where: { id: Number(id) },
    data: { visible: false },
  });
};

export const obtenerProductosPorTipo = async (tipo) => {
  return prisma.producto.findMany({
    where: { tipo, disponible: true, visible: true },
    orderBy: { nombre: 'asc' },
  });
};

export const buscarTaperYPapa = async () => {
  const [taper, papaFrita] = await Promise.all([
    prisma.producto.findFirst({ where: { tipo: 'TAPER', disponible: true, visible: true }, orderBy: { id: 'asc' } }),
    prisma.producto.findFirst({ where: { tipo: 'PAPA_FRITA', disponible: true, visible: true }, orderBy: { id: 'asc' } }),
  ]);
  return { taper, papaFrita };
};