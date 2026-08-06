import api from './api.js';

export const reporteService = {
  diario: async (fecha) => {
    const response = await api.get('/reportes/diario', { params: { fecha } });
    return response.data;
  },
  ingresos: async (fechaInicio, fechaFin) => {
    const response = await api.get('/reportes/ingresos', { params: { fechaInicio, fechaFin } });
    return response.data;
  },
};