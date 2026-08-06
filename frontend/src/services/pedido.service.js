import api from './api.js';

export const pedidoService = {
  listar: async (params = {}) => {
    const response = await api.get('/pedidos', { params });
    return response.data;
  },
  obtener: async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },
  crear: async (data) => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },
  actualizar: async (id, data) => {
    const response = await api.put(`/pedidos/${id}`, data);
    return response.data;
  },
  cerrar: async (id) => {
    const response = await api.post(`/pedidos/${id}/cerrar`);
    return response.data;
  },
  eliminar: async (id) => {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  },
};