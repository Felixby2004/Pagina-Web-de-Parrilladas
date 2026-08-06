import {
  crearPedidoService,
  obtenerPedidosService,
  obtenerPedidoPorIdService,
  actualizarPedidoService,
  cerrarPedidoService,
  eliminarPedidoService,
} from '../services/pedido.service.js';

export const crearPedido = async (req, res, next) => {
  try {
    const pedido = await crearPedidoService(req.body, req.usuario.id);
    res.status(201).json({ mensaje: 'Pedido creado exitosamente', pedido });
  } catch (error) {
    next(error);
  }
};

export const listarPedidos = async (req, res, next) => {
  try {
    const { page, limit, fechaInicio, fechaFin, estado, search } = req.query;
    const paginacion = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      estado: estado || undefined,
      search: search || '',
    };

    const resultado = await obtenerPedidosService({}, paginacion);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const obtenerPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await obtenerPedidoPorIdService(Number(id));
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

export const actualizarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await actualizarPedidoService(Number(id), req.body);
    res.json({ mensaje: 'Pedido actualizado', pedido });
  } catch (error) {
    next(error);
  }
};

export const cerrarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pedido = await cerrarPedidoService(Number(id));
    res.json({ mensaje: 'Pedido cerrado exitosamente', pedido });
  } catch (error) {
    next(error);
  }
};

export const eliminarPedido = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eliminarPedidoService(Number(id));
    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};