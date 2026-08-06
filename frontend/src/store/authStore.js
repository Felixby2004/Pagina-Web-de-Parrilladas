import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  usuario: authService.getUsuarioActual(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  // Login
  login: async (correo, contraseña) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(correo, contraseña);
      set({
        usuario: data.usuario,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al iniciar sesión';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Logout
  logout: () => {
    authService.logout();
    set({ usuario: null, isAuthenticated: false, error: null });
  },

  // Registrar
  registrar: async (datos) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.registrar(datos);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || error.message || 'Error al registrar';
      console.error('Error en registro:', error.response?.data || error);
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Verificar
  verificar: async (correo, codigo) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.verificar(correo, codigo);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al verificar';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Reenviar verificación
  reenviarVerificacion: async (correo) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.reenviarVerificacion(correo);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al reenviar código';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Solicitar recuperación
  solicitarRecuperacion: async (correo) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.solicitarRecuperacion(correo);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al solicitar recuperación';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Cambiar contraseña con recuperación
  cambiarPasswordRecuperacion: async (correo, codigo, nuevaContraseña) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.cambiarPasswordRecuperacion(correo, codigo, nuevaContraseña);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al cambiar contraseña';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Cambiar contraseña desde perfil
  cambiarPasswordPerfil: async (contraseñaActual, nuevaContraseña) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.cambiarPasswordPerfil(contraseñaActual, nuevaContraseña);
      set({ isLoading: false });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al cambiar contraseña';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Obtener perfil
  obtenerPerfil: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.obtenerPerfil();
      set({ 
        usuario: data,
        isLoading: false,
      });
      return { success: true, data };
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al obtener perfil';
      set({ 
        error: mensaje,
        isLoading: false,
      });
      return { success: false, error: mensaje };
    }
  },

  // Limpiar error
  clearError: () => set({ error: null }),
}));