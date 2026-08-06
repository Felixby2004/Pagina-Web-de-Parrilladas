import {
  crearProductoService,
  obtenerProductosService,
  obtenerProductoPorIdService,
  actualizarProductoService,
  eliminarProductoService,
  obtenerProductosPorTipoService,
  obtenerTaperYPapaService,
} from '../services/producto.service.js';

export const crearProducto = async (req, res, next) => {
  try {
    const producto = await crearProductoService(req.body);
    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto });
  } catch (error) {
    next(error);
  }
};

export const listarProductos = async (req, res, next) => {
  try {
    const { page, limit, search, tipo, sort, order } = req.query;
    const paginacion = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || '',
      tipo: tipo || undefined,
      sort: sort || 'nombre',
      order: order || 'asc',
    };

    const resultado = await obtenerProductosService({}, paginacion);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await obtenerProductoPorIdService(Number(id));
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await actualizarProductoService(Number(id), req.body);
    res.json({ mensaje: 'Producto actualizado', producto });
  } catch (error) {
    next(error);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params; // Ya viene como número gracias al validador
    const producto = await eliminarProductoService(id);
    res.json({ mensaje: 'Producto eliminado correctamente', producto });
  } catch (error) {
    next(error);
  }
};

export const listarPorTipo = async (req, res, next) => {
  try {
    const { tipo } = req.params;
    const productos = await obtenerProductosPorTipoService(tipo);
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

export const obtenerTaperYPapa = async (req, res, next) => {
  try {
    const precios = await obtenerTaperYPapaService();
    res.json(precios);
  } catch (error) {
    next(error);
  }
};