import api from './api.js';

export const authService = {
  // Registro
  registrar: async (datos) => {
    const response = await api.post('/auth/registro', datos);
    return response.data;
  },

  // Verificar código
  verificar: async (correo, codigo) => {
    const response = await api.post('/auth/verificar', { correo, codigo });
    return response.data;
  },

  // Reenviar código
  reenviarVerificacion: async (correo) => {
    const response = await api.post('/auth/reenviar-verificacion', { correo });
    return response.data;
  },

  // Login
  login: async (correo, contraseña) => {
    const response = await api.post('/auth/login', { correo, contraseña });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  // Solicitar recuperación
  solicitarRecuperacion: async (correo) => {
    const response = await api.post('/auth/recuperar-solicitar', { correo });
    return response.data;
  },

  // Cambiar contraseña con recuperación
  cambiarPasswordRecuperacion: async (correo, codigo, nuevaContraseña) => {
    const response = await api.post('/auth/recuperar-cambiar', { 
      correo, 
      codigo, 
      nuevaContraseña,
      confirmarContraseña: nuevaContraseña
    });
    return response.data;
  },

  // Cambiar contraseña desde perfil (requiere autenticación)
  cambiarPasswordPerfil: async (contraseñaActual, nuevaContraseña) => {
    const response = await api.put('/auth/perfil/password', {
      contraseñaActual,
      nuevaContraseña,
      confirmarContraseña: nuevaContraseña
    });
    return response.data;
  },

  // Obtener perfil
  obtenerPerfil: async () => {
    const response = await api.get('/auth/perfil');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  // Obtener usuario actual (del localStorage)
  getUsuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};