import api from './api.js';

export const configuracionService = {
  obtener: async () => {
    const response = await api.get('/configuracion');
    return response.data;
  },
  actualizar: async (data) => {
    const response = await api.put('/configuracion', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  obtenerListaProductosImagen: async () => {
    const response = await api.get('/configuracion/lista-productos/imagen', {
      responseType: 'blob',
    });
    return response.data;
  },
};
