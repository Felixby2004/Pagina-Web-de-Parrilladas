import api from './api.js';

export const productoService = {
  listar: async (params = {}) => {
    const cleanParams = {};
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.search && params.search.trim() !== '') cleanParams.search = params.search.trim();
    if (params.tipo && params.tipo !== '') cleanParams.tipo = params.tipo;
    if (params.sort) cleanParams.sort = params.sort;
    if (params.order) cleanParams.order = params.order;

    const response = await api.get('/productos', { params: cleanParams });
    return response.data;
  },

  obtener: async (id) => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  crear: async (data) => {
    const response = await api.post('/productos', data);
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/productos/${id}`, data);
    return response.data;
  },

  eliminar: async (id) => {
    const response = await api.put(`/productos/${id}/eliminar`);
    return response.data;
  },

  listarPorTipo: async (tipo) => {
    const response = await api.get(`/productos/tipos/${tipo}`);
    return response.data;
  },

  obtenerTaperYPapa: async () => {
    const response = await api.get('/productos/taper-papa');
    return response.data;
  }
};
