import {
  crearNotaService,
  obtenerNotasPorPedidoService,
  actualizarNotaService,
  eliminarNotaService,
} from '../services/nota.service.js';

export const crearNota = async (req, res, next) => {
  try {
    const { pedidoId } = req.params;
    const nota = await crearNotaService(Number(pedidoId), req.body);
    res.status(201).json({ mensaje: 'Nota creada exitosamente', nota });
  } catch (error) {
    next(error);
  }
};

export const listarNotasPorPedido = async (req, res, next) => {
  try {
    const { pedidoId } = req.params;
    const notas = await obtenerNotasPorPedidoService(Number(pedidoId));
    res.json(notas);
  } catch (error) {
    next(error);
  }
};

export const actualizarNota = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nota = await actualizarNotaService(Number(id), req.body);
    res.json({ mensaje: 'Nota actualizada', nota });
  } catch (error) {
    next(error);
  }
};

export const eliminarNota = async (req, res, next) => {
  try {
    const { id } = req.params;
    await eliminarNotaService(Number(id));
    res.json({ mensaje: 'Nota eliminada' });
  } catch (error) {
    next(error);
  }
};