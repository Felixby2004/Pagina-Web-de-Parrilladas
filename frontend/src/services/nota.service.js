import api from './api.js';

export const notaService = {
  listar: async (pedidoId) => {
    const response = await api.get(`/pedidos/${pedidoId}/notas`);
    return response.data;
  },
  crear: async (pedidoId, data) => {
    const response = await api.post(`/pedidos/${pedidoId}/notas`, data);
    return response.data;
  },
  actualizar: async (id, data) => {
    const response = await api.put(`/notas/${id}`, data);
    return response.data;
  },
  eliminar: async (id) => {
    const response = await api.delete(`/notas/${id}`);
    return response.data;
  },
};