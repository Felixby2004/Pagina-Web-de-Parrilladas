import { reporteDiario, reporteIngresos } from '../services/reporte.service.js';

export const obtenerReporteDiario = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      throw { statusCode: 400, message: 'La fecha es requerida (YYYY-MM-DD)' };
    }
    const reporte = await reporteDiario(fecha);
    res.json(reporte);
  } catch (error) {
    next(error);
  }
};

export const obtenerReporteIngresos = async (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      throw { statusCode: 400, message: 'Fecha de inicio y fin son requeridas' };
    }
    const reporte = await reporteIngresos(fechaInicio, fechaFin);
    res.json(reporte);
  } catch (error) {
    next(error);
  }
};