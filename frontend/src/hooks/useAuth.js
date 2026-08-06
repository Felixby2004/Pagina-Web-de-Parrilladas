import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    usuario,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    registrar,
    verificar,
    reenviarVerificacion,
    solicitarRecuperacion,
    cambiarPasswordRecuperacion,
    cambiarPasswordPerfil,
    obtenerPerfil,
    clearError,
  } = useAuthStore();

  return {
    usuario,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    registrar,
    verificar,
    reenviarVerificacion,
    solicitarRecuperacion,
    cambiarPasswordRecuperacion,
    cambiarPasswordPerfil,
    obtenerPerfil,
    clearError,
  };
};