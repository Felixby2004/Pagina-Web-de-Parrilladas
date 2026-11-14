import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracionService } from '../services/configuracion.service';
import { useSnackbar } from './useSnackbar';

export const useConfiguracion = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['configuracion'],
    queryFn: configuracionService.obtener,
    staleTime: 10 * 60 * 1000,
  });

  const actualizarMutation = useMutation({
    mutationFn: async (formData) => {
      const result = await configuracionService.actualizar(formData);
      return result;
    },
    onSuccess: ({ configuracion }) => {
      queryClient.setQueryData(['configuracion'], configuracion);
      showSnackbar('Configuración actualizada exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['configuracion'] });
    },
    onError: (error) => {
      const mensaje = error.response?.data?.error || 'Error al actualizar configuración';
      showSnackbar(mensaje, 'error');
    },
  });

  return {
    configuracion: data || null,
    isLoading,
    error,
    refetch,
    actualizar: actualizarMutation.mutateAsync,
    actualizarLoading: actualizarMutation.isPending,
  };
};
