import {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  obtenerProductosPorTipo,
  buscarTaperYPapa,
} from '../repositories/producto.repository.js';

export const crearProductoService = async (data) => {
  return crearProducto(data);
};

export const obtenerProductosService = async (filtros, paginacion) => {
  return obtenerProductos(filtros, paginacion);
};

export const obtenerProductoPorIdService = async (id) => {
  const producto = await obtenerProductoPorId(id);
  if (!producto) {
    throw { statusCode: 404, message: 'Producto no encontrado' };
  }
  return producto;
};

export const eliminarProductoService = async (id) => {
  await obtenerProductoPorIdService(id);
  return eliminarProducto(id);
};

export const actualizarProductoService = async (id, data) => {
  await obtenerProductoPorIdService(id);
  return actualizarProducto(id, data);
};

export const obtenerProductosPorTipoService = async (tipo) => {
  return obtenerProductosPorTipo(tipo);
};

export const obtenerTaperYPapaService = async () => {
  return buscarTaperYPapa();
};